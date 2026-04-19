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
    
    let org = await Organization.findOne({
      $or: [
        { ownerId: session.userId },
        { members: session.userId }
      ]
    }).populate('members', 'name email image');
    
    // Lazy migration: add slug if missing
    if (org && !org.slug) {
      const slugify = (text) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      let baseSlug = slugify(org.name);
      let slug = baseSlug;
      let counter = 1;
      while (await Organization.findOne({ slug, _id: { $ne: org._id } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      org.slug = slug;
      await org.save();
    }

    return NextResponse.json({ org });
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
    const user = await User.findById(session.userId);

    // Only allow admin or users with institutional plan (maxContactsLimit >= 2000)
    const isInstitution = user.role === 'admin' || (user.maxContactsLimit && user.maxContactsLimit >= 2000);
    if (!isInstitution) {
      return NextResponse.json({ 
        error: 'Institutional synchronization requires an Institution Plan. Please upgrade in the Credits page to unlock organization features.' 
      }, { status: 403 });
    }

    const slugify = (text) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

    // Check if user already owns an org
    const existing = await Organization.findOne({ ownerId: session.userId });
    if (existing) {
      return NextResponse.json({ error: 'You already own an organization' }, { status: 400 });
    }

    let slug = slugify(name);
    // Ensure slug is unique
    const slugExists = await Organization.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
    }

    const inviteToken = crypto.randomBytes(8).toString('hex'); // 16 chars instead of 64
    const inviteExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const org = await Organization.create({
      name,
      slug,
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
