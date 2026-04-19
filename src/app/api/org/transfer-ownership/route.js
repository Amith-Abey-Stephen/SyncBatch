import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Organization from '@/lib/models/Organization';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orgId, newOwnerId } = await request.json();

    await connectDB();

    const org = await Organization.findById(orgId);
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

    // Verify current owner
    if (org.ownerId.toString() !== session.userId) {
      return NextResponse.json({ error: 'Only the current owner can transfer ownership' }, { status: 403 });
    }

    // Verify new owner is a member
    if (!org.members.includes(newOwnerId)) {
      return NextResponse.json({ error: 'New owner must be a member of the organization' }, { status: 400 });
    }

    // Transfer ownership
    org.ownerId = newOwnerId;
    await org.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
