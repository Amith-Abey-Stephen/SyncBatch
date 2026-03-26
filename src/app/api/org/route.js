import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Organization from '@/lib/models/Organization';
import crypto from 'crypto';

// Get user's organization
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    const user = await User.findById(session.userId);
    
    // Find org where user is owner or member
    const org = await Organization.findOne({
      $or: [
        { ownerId: session.userId },
        { members: session.userId }
      ]
    }).populate('members', 'name email image');
    
    const ownedOrg = await Organization.findOne({ ownerId: session.userId })
      .populate('members', 'name email image');

    return NextResponse.json({ org: ownedOrg || org });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Create organization
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    await connectDB();

    // Check if user already owns an org
    const existing = await Organization.findOne({ ownerId: session.userId });
    if (existing) {
      return NextResponse.json({ error: 'You already own an organization' }, { status: 400 });
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const org = await Organization.create({
      name,
      description: description || '',
      ownerId: session.userId,
      members: [session.userId],
      inviteToken,
      inviteExpiry,
    });

    // Update user
    await User.findByIdAndUpdate(session.userId, { orgId: org._id });

    return NextResponse.json({ org });
  } catch (error) {
    console.error('Org create error:', error);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}
