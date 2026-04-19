import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Organization from '@/lib/models/Organization';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orgId } = await request.json();

    await connectDB();

    const org = await Organization.findById(orgId);
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

    // Cannot leave if you are the owner (must transfer first or delete org)
    if (org.ownerId.toString() === session.userId) {
      return NextResponse.json({ error: 'Owners cannot leave. Transfer ownership or delete organization instead.' }, { status: 400 });
    }

    // Remove user from members array
    org.members = org.members.filter(m => m.toString() !== session.userId);
    await org.save();

    // Update user's orgId
    await User.findByIdAndUpdate(session.userId, { orgId: null });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
