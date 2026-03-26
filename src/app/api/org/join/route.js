import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Organization from '@/lib/models/Organization';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Invalid invite token' }, { status: 400 });
    }

    await connectDB();

    const org = await Organization.findOne({
      inviteToken: token,
      inviteExpiry: { $gt: new Date() },
    });

    if (!org) {
      return NextResponse.json({ error: 'Invalid or expired invite link' }, { status: 400 });
    }

    // Check if already a member
    if (org.members.includes(session.userId)) {
      return NextResponse.json({ message: 'Already a member', org });
    }

    // Add user to org
    org.members.push(session.userId);
    await org.save();

    await User.findByIdAndUpdate(session.userId, { orgId: org._id });

    return NextResponse.json({ success: true, org });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to join organization' }, { status: 500 });
  }
}
