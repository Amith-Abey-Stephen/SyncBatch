import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import SyncRequest from '@/lib/models/SyncRequest';

export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { action } = await request.json(); // 'sync' or 'ignore'

    await connectDB();

    const syncRequest = await SyncRequest.findById(id);
    if (!syncRequest) {
      return NextResponse.json({ error: 'Sync request not found' }, { status: 404 });
    }

    const targetUser = syncRequest.targetUsers.find(
      t => t.userId.toString() === session.userId
    );

    if (!targetUser) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    targetUser.status = action === 'sync' ? 'done' : 'ignored';
    targetUser.syncedAt = new Date();
    await syncRequest.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
