import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Transaction from '@/lib/models/Transaction';
import { getPlanById } from '@/lib/plans';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    await connectDB();

    // Update transaction
    const transaction = await Transaction.findOne({ orderId: razorpay_order_id });
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    transaction.paymentId = razorpay_payment_id;
    transaction.status = 'completed';
    await transaction.save();

    // Add credits to user
    const user = await User.findById(session.userId);
    user.credits += transaction.creditsAdded;
    user.plan = 'paid';

    // Update Limits based on plan
    if (transaction.planId) {
      const plan = getPlanById(transaction.planId);
      if (plan) {
        if (plan.maxContacts) {
          user.maxContactsLimit = Math.max(user.maxContactsLimit || 0, plan.maxContacts);
        }
        if (plan.maxOrgs) {
          user.maxOrgsLimit = Math.max(user.maxOrgsLimit || 0, plan.maxOrgs);
        }
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      credits: user.credits,
      creditsAdded: transaction.creditsAdded,
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
