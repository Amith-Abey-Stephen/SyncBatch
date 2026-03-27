import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Transaction from '@/lib/models/Transaction';
import { getPlanById } from '@/lib/plans';
import crypto from 'crypto';

// Create Razorpay order
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await request.json();
    const plan = getPlanById(planId);

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: plan.price * 100, // Amount in paise
      currency: plan.currency,
      receipt: `syncbatch_${session.userId}_${Date.now()}`,
      notes: {
        planId: plan.id,
        userId: session.userId,
        credits: plan.credits.toString(),
      },
    });

    // Create pending transaction
    await connectDB();
    await Transaction.create({
      userId: session.userId,
      amount: plan.price,
      creditsAdded: plan.credits,
      planId: plan.id,
      paymentId: '',
      orderId: order.id,
      status: 'pending',
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
