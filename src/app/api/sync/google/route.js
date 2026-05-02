import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { refreshGoogleToken } from '@/lib/google';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contacts } = await request.json();

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts provided' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check contact limit for plan
    const limit = user.maxContactsLimit || 50;
    if (contacts.length > limit) {
      return NextResponse.json({ 
        error: `Sync limit exceeded. Your current pack allows up to ${limit} contacts per sync. Please upgrade to a higher pack for larger lists.` 
      }, { status: 403 });
    }

    // Check credits
    const hasCredits = user.credits > 0;
    if (!hasCredits) {
      return NextResponse.json({ error: 'Insufficient credits. Please purchase more.' }, { status: 403 });
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

    // First, get existing contacts to check for duplicates
    let existingPhones = new Set();
    try {
      const existingRes = await fetch(
        'https://people.googleapis.com/v1/people/me/connections?personFields=phoneNumbers&pageSize=1000',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      if (existingRes.ok) {
        const existingData = await existingRes.json();
        if (existingData.connections) {
          for (const person of existingData.connections) {
            if (person.phoneNumbers) {
              for (const phone of person.phoneNumbers) {
                existingPhones.add(phone.value.replace(/[^\d+]/g, ''));
              }
            }
          }
        }
      }
    } catch (e) {
      // Continue without duplicate check
    }

    const addedContacts = [];
    const skippedContacts = [];

    // Batch process contacts
    const BATCH_SIZE = 10;
    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map(async (contact) => {
        const cleanPhone = contact.phone.replace(/[^\d+]/g, '');
        
        // Check for duplicate
        if (existingPhones.has(cleanPhone)) {
          skippedContacts.push({ ...contact, reason: 'Already exists' });
          return;
        }

        try {
          const res = await fetch(
            'https://people.googleapis.com/v1/people:createContact',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                names: [{ givenName: contact.name }],
                phoneNumbers: [{ value: contact.phone }],
              }),
            }
          );

          if (res.ok) {
            addedContacts.push(contact);
            existingPhones.add(cleanPhone);
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

    // Deduct credit
    user.credits -= 1;
    if (!user.freeUsed) user.freeUsed = true;
    await user.save();

    return NextResponse.json({
      added: addedContacts,
      skipped: skippedContacts,
      addedCount: addedContacts.length,
      skippedCount: skippedContacts.length,
      creditsRemaining: user.credits,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
