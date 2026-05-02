import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Fetch shared credits from organizations
    const Organization = (await import('@/lib/models/Organization')).default;
    const orgs = await Organization.find({
      $or: [{ ownerId: session.userId }, { members: session.userId }]
    });

    let sharedCredits = 0;
    if (orgs.length > 0) {
      // Find the owner with the most credits among all orgs user is in
      const owners = await User.find({ _id: { $in: orgs.map(o => o.ownerId) } });
      sharedCredits = Math.max(...owners.map(o => o.orgCredits || 0));
    }

    // Count pending sync requests for notifications
    const SyncRequest = (await import('@/lib/models/SyncRequest')).default;
    const pendingNotifications = await SyncRequest.countDocuments({
      targetUsers: {
        $elemMatch: {
          userId: session.userId,
          status: 'pending'
        }
      }
    });

    return NextResponse.json({ 
      user,
      notifications: pendingNotifications,
      sharedCredits: sharedCredits
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
