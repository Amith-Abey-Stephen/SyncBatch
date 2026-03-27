import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Organization from '@/lib/models/Organization';
import Transaction from '@/lib/models/Transaction';
import SyncRequest from '@/lib/models/SyncRequest';
import ContactList from '@/lib/models/ContactList';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const totalUsers = await User.countDocuments();
    const totalOrgs = await Organization.countDocuments();
    const totalTransactions = await Transaction.countDocuments({ status: 'completed' });
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const recentTransactions = await Transaction.find({ status: 'completed' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentUsers = await User.find()
      .select('name email role credits createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const syncStats = await SyncRequest.countDocuments();
    const contactLists = await ContactList.countDocuments();

    return NextResponse.json({
      stats: {
        totalUsers,
        totalOrgs,
        totalTransactions,
        totalRevenue: totalRevenue[0]?.total || 0,
        syncRequests: syncStats,
        contactLists
      },
      recentTransactions,
      recentUsers
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
