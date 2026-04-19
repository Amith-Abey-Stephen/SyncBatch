import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Organization from '@/lib/models/Organization';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    const { identifier } = await params;
    await connectDB();

    let query = {};
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query = { _id: identifier };
    } else {
      query = { slug: identifier };
    }

    const org = await Organization.findOne(query).select('name description');

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ name: org.name, description: org.description });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
