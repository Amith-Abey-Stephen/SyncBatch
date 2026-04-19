import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { cancel } = await request.json().catch(() => ({}));

    if (cancel) {
      user.deletionScheduledAt = null;
      await user.save();
      return NextResponse.json({ message: 'Account deletion cancelled' });
    }

    // Schedule deletion 10 days from now
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 10);
    
    user.deletionScheduledAt = deletionDate;
    await user.save();

    return NextResponse.json({ 
      message: 'Account scheduled for deletion', 
      deletionDate: deletionDate.toISOString() 
    });
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
