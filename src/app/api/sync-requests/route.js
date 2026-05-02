import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Organization from '@/lib/models/Organization';
import ContactList from '@/lib/models/ContactList';
import SyncRequest from '@/lib/models/SyncRequest';
import { deductCredits } from '@/lib/credits';

// Get sync requests for user
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    await connectDB();

    let incomingQuery = { 'targetUsers.userId': session.userId };
    let sentQuery = { requestedBy: session.userId };

    if (orgId) {
      incomingQuery.$or = [
        { orgId: orgId },
        { orgId: { $exists: false } }
      ];
      sentQuery.$or = [
        { orgId: orgId },
        { orgId: { $exists: false } }
      ];
    }

    // Requests targeted at this user
    const incomingRequests = await SyncRequest.find(incomingQuery)
      .populate('listId', 'title contacts orgId')
      .populate('requestedBy', 'name email image')
      .sort({ createdAt: -1 });

    // Requests sent by this user
    const sentRequests = await SyncRequest.find(sentQuery)
      .populate('listId', 'title contacts orgId')
      .populate('targetUsers.userId', 'name email image')
      .sort({ createdAt: -1 });

    // Lazy migration: fill missing orgId from listId
    const migrateAndFilter = async (reqs) => {
      const results = [];
      for (const req of reqs) {
        if (!req.orgId && req.listId?.orgId) {
          req.orgId = req.listId.orgId;
          await req.save();
        }
        
        // Final check: if orgId filter is active, only show matches
        if (orgId) {
          if (req.orgId?.toString() === orgId) {
            results.push(req);
          }
        } else {
          results.push(req);
        }
      }
      return results;
    };

    const finalIncoming = await migrateAndFilter(incomingRequests);
    const finalSent = await migrateAndFilter(sentRequests);

    return NextResponse.json({ incoming: finalIncoming, sent: finalSent });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Create sync request
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { contacts, title, targetUserIds, orgId, operation } = await request.json();

    if (!contacts || !targetUserIds || targetUserIds.length === 0 || !orgId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Fetch user for credit & limit check
    const user = await User.findById(session.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check contact limit for plan
    const limit = user.maxContactsLimit || 50;
    if (contacts.length > limit) {
      return NextResponse.json({ 
        error: `Sync limit exceeded. Your current pack allows up to ${limit} contacts per sync. Please upgrade to a higher pack for larger lists.` 
      }, { status: 403 });
    }

    // Use centralized credit utility
    const creditResult = await deductCredits(user._id, orgId, {
      action: 'broadcast',
      method: operation || 'add',
      contactsCount: contacts.length,
      details: `Broadcast: ${title || 'Contact List'}`
    });

    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error }, { status: 403 });
    }

    // Verify user belongs to org or owns it
    const org = await Organization.findOne({ 
      _id: orgId,
      $or: [{ ownerId: session.userId }, { members: session.userId }]
    });

    if (!org) {
      return NextResponse.json({ error: 'Invalid organization' }, { status: 403 });
    }

    // Create contact list
    const contactList = await ContactList.create({
      orgId: org._id,
      title: title || `Sync ${new Date().toLocaleDateString()}`,
      contacts,
      createdBy: session.userId,
    });

    // Create sync request
    const syncRequest = await SyncRequest.create({
      listId: contactList._id,
      requestedBy: session.userId,
      operation: operation || 'add',
      orgId: org._id,
      targetUsers: targetUserIds.map(uid => ({
        userId: uid,
        status: 'pending',
      })),
    });

    return NextResponse.json({ 
      success: true, 
      syncRequest,
      creditsRemaining: creditResult.creditsRemaining,
      orgCreditsRemaining: creditResult.orgCreditsRemaining
    });
  } catch (error) {
    console.error('Sync request error:', error);
    return NextResponse.json({ error: 'Failed to create sync request' }, { status: 500 });
  }
}
