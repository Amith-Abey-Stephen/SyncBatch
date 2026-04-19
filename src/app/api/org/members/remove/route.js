import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Organization from '@/lib/models/Organization';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    await connectDB();

    // Find the organization owned by this user
    const org = await Organization.findOne({ ownerId: session.userId });
    if (!org) {
      return NextResponse.json({ error: 'You must be the organization owner to remove members' }, { status: 403 });
    }

    // Don't allow owner to remove themselves
    if (userId === session.userId) {
      return NextResponse.json({ error: 'You cannot remove yourself from your own organization' }, { status: 400 });
    }

    // Check if user is actually a member
    if (!org.members.includes(userId)) {
      return NextResponse.json({ error: 'User is not a member of this organization' }, { status: 404 });
    }

    // Remove user from org
    org.members = org.members.filter(m => m.toString() !== userId);
    await org.save();

    // Update user's orgId
    await User.findByIdAndUpdate(userId, { orgId: null });

    return NextResponse.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
