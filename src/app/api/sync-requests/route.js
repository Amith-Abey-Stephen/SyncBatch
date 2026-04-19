import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Organization from '@/lib/models/Organization';
import ContactList from '@/lib/models/ContactList';
import SyncRequest from '@/lib/models/SyncRequest';

// Get sync requests for user
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // Requests targeted at this user
    const incomingRequests = await SyncRequest.find({
      'targetUsers.userId': session.userId,
    })
      .populate('listId', 'title contacts')
      .populate('requestedBy', 'name email image')
      .sort({ createdAt: -1 });

    // Requests sent by this user
    const sentRequests = await SyncRequest.find({
      requestedBy: session.userId,
    })
      .populate('listId', 'title contacts')
      .populate('targetUsers.userId', 'name email image')
      .sort({ createdAt: -1 });

    return NextResponse.json({ incoming: incomingRequests, sent: sentRequests });
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

    // Check credits (1 credit per sync request)
    if (user.credits < 1 && user.freeUsed) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
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
      targetUsers: targetUserIds.map(uid => ({
        userId: uid,
        status: 'pending',
      })),
    });

    // Deduct credit
    if (!user.freeUsed) {
      user.freeUsed = true;
    } else {
      user.credits -= 1;
    }
    await user.save();

    return NextResponse.json({ success: true, syncRequest });
  } catch (error) {
    console.error('Sync request error:', error);
    return NextResponse.json({ error: 'Failed to create sync request' }, { status: 500 });
  }
}
