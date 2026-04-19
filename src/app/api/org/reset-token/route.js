import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import Organization from '@/lib/models/Organization';
import crypto from 'crypto';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    const inviteToken = crypto.randomBytes(8).toString('hex'); // 16 chars
    const inviteExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const org = await Organization.findOneAndUpdate(
      { ownerId: session.userId },
      { inviteToken, inviteExpiry },
      { new: true }
    );

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ inviteToken: org.inviteToken });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
