import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { refreshGoogleToken } from '@/lib/google';
import { deductCredits } from '@/lib/credits';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contacts, orgId } = await request.json();

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts provided' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use centralized credit utility
    const creditResult = await deductCredits(user._id, orgId, {
      action: 'delete',
      method: 'google',
      contactsCount: contacts.length,
      details: 'Delete from Google Contacts'
    });

    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error }, { status: 403 });
    }

    // Get a valid access token
    let accessToken = user.googleAccessToken;
    
    // Try to refresh token if needed
    if (user.googleRefreshToken) {
      try {
        const refreshed = await refreshGoogleToken(user.googleRefreshToken);
        if (refreshed.access_token) {
          accessToken = refreshed.access_token;
          user.googleAccessToken = accessToken;
          await user.save();
        }
      } catch (e) {
        // Use existing token
      }
    }

    // Fetch ALL contacts to find those that need to be deleted
    // We need to map phone numbers to resourceNames
    let contactMap = new Map(); // phone -> resourceName
    let nextSyncToken = null;
    let nextPageToken = null;

    try {
      do {
        const url = new URL('https://people.googleapis.com/v1/people/me/connections');
        url.searchParams.append('personFields', 'names,phoneNumbers');
        url.searchParams.append('pageSize', '1000');
        if (nextPageToken) url.searchParams.append('pageToken', nextPageToken);

        const existingRes = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (!existingRes.ok) break;

        const data = await existingRes.json();
        if (data.connections) {
          for (const person of data.connections) {
            if (person.phoneNumbers) {
              for (const phone of person.phoneNumbers) {
                const cleanPhone = phone.value.replace(/[^\d+]/g, '');
                // Add to map - one phone can belong to one resourceName
                if (!contactMap.has(cleanPhone)) {
                  contactMap.set(cleanPhone, person.resourceName);
                }
              }
            }
          }
        }
        nextPageToken = data.nextPageToken;
      } while (nextPageToken);
    } catch (e) {
      console.error('Error fetching connections:', e);
      return NextResponse.json({ error: 'Failed to fetch existing contacts from Google' }, { status: 500 });
    }

    const deletedContacts = [];
    const skippedContacts = [];

    // Batch process deletions
    const BATCH_SIZE = 10;
    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map(async (contact) => {
        const cleanPhone = contact.phone.replace(/[^\d+]/g, '');
        const resourceName = contactMap.get(cleanPhone);
        
        if (!resourceName) {
          skippedContacts.push({ ...contact, reason: 'Not found in Google contacts' });
          return;
        }

        try {
          const res = await fetch(
            `https://people.googleapis.com/v1/${resourceName}:deleteContact`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          if (res.ok) {
            deletedContacts.push(contact);
            contactMap.delete(cleanPhone); // Prevent multiple deletions of same resource if multiple phones match
          } else {
            const errData = await res.json().catch(() => ({}));
            skippedContacts.push({ ...contact, reason: errData.error?.message || 'API error' });
          }
        } catch (err) {
          skippedContacts.push({ ...contact, reason: 'Network error' });
        }
      });

      await Promise.all(promises);
    }

    return NextResponse.json({
      deleted: deletedContacts,
      skipped: skippedContacts,
      deletedCount: deletedContacts.length,
      skippedCount: skippedContacts.length,
      creditsRemaining: creditResult.creditsRemaining,
      orgCreditsRemaining: creditResult.orgCreditsRemaining,
      addedCount: deletedContacts.length, 
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
