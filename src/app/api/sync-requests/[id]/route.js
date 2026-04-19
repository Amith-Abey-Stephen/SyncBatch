import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import SyncRequest from '@/lib/models/SyncRequest';
import ContactList from '@/lib/models/ContactList';
import { refreshGoogleToken } from '@/lib/google';

export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { action } = await request.json(); // 'sync' or 'ignore'

    await connectDB();

    const syncRequest = await SyncRequest.findById(id).populate('listId');
    if (!syncRequest) {
      return NextResponse.json({ error: 'Sync request not found' }, { status: 404 });
    }

    const targetUser = syncRequest.targetUsers.find(
      t => t.userId.toString() === session.userId
    );

    if (!targetUser) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (action === 'ignore') {
      targetUser.status = 'ignored';
      await syncRequest.save();
      return NextResponse.json({ success: true });
    }

    // Logic for 'sync' action
    const user = await User.findById(session.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Get valid token
    let accessToken = user.googleAccessToken;
    if (user.googleRefreshToken) {
      try {
        const refreshed = await refreshGoogleToken(user.googleRefreshToken);
        if (refreshed.access_token) {
          accessToken = refreshed.access_token;
          user.googleAccessToken = accessToken;
          await user.save();
        }
      } catch (e) { /* ignore */ }
    }

    const contacts = syncRequest.listId?.contacts || [];
    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts in list' }, { status: 400 });
    }

    const operation = syncRequest.operation || 'add';

    if (operation === 'add') {
      // Sync in batches
      const BATCH_SIZE = 10;
      for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
        const batch = contacts.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (contact) => {
          try {
            await fetch('https://people.googleapis.com/v1/people:createContact', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                names: [{ givenName: contact.name }],
                phoneNumbers: [{ value: contact.phone }],
              }),
            });
          } catch (e) { /* ignore individual failures */ }
        }));
      }
    } else {
      // DELETE operation
      // Fetch connections to find resourceNames
      let contactMap = new Map();
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
                  if (!contactMap.has(cleanPhone)) {
                    contactMap.set(cleanPhone, person.resourceName);
                  }
                }
              }
            }
          }
          nextPageToken = data.nextPageToken;
        } while (nextPageToken);
      } catch (e) { console.error('Delete fetch error:', e); }

      const BATCH_SIZE = 10;
      for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
        const batch = contacts.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (contact) => {
          const cleanPhone = contact.phone.replace(/[^\d+]/g, '');
          const resourceName = contactMap.get(cleanPhone);
          if (resourceName) {
            try {
              await fetch(`https://people.googleapis.com/v1/${resourceName}:deleteContact`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` },
              });
            } catch (e) { /* ignore */ }
          }
        }));
      }
    }

    targetUser.status = 'done';
    targetUser.syncedAt = new Date();
    await syncRequest.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sync request action error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
