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

    // Only owner can delete
    if (org.ownerId.toString() !== session.userId) {
      return NextResponse.json({ error: 'Only the owner can delete the organization' }, { status: 403 });
    }

    // Update all members to remove this orgId
    await User.updateMany(
      { _id: { $in: org.members } },
      { $set: { orgId: null } }
    );

    // Delete the organization
    await Organization.findByIdAndDelete(orgId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
