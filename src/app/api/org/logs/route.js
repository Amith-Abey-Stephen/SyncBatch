import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import Organization from '@/lib/models/Organization';
import OrgLog from '@/lib/models/OrgLog';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'Org ID required' }, { status: 400 });
    }

    await connectDB();

    // Verify user belongs to org
    const org = await Organization.findOne({
      _id: orgId,
      $or: [{ ownerId: session.userId }, { members: session.userId }]
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Fetch logs
    const logs = await OrgLog.find({ orgId })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Fetch logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
