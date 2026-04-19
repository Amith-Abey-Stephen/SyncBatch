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
    
    const orgs = await Organization.find({
      $or: [
        { ownerId: session.userId },
        { members: session.userId }
      ]
    }).populate('members', 'name email image');
    
    // Lazy migration: add slugs if missing
    for (const org of orgs) {
      if (!org.slug) {
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
    }

    return NextResponse.json({ orgs });
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

    // Check institutional plan & org limits
    const isInstitution = user.role === 'admin' || (user.maxOrgsLimit && user.maxOrgsLimit >= 1);
    if (!isInstitution) {
      return NextResponse.json({ 
        error: 'Organization creation requires an Institution Plan. Please upgrade in the Credits page.' 
      }, { status: 403 });
    }

    // Check how many orgs user already owns
    const ownedCount = await Organization.countDocuments({ ownerId: session.userId });
    if (user.role !== 'admin' && ownedCount >= user.maxOrgsLimit) {
      return NextResponse.json({ 
        error: `Plan Limit Reached: Your current plan allows up to ${user.maxOrgsLimit} organizations. Please upgrade for more.` 
      }, { status: 403 });
    }

    const slugify = (text) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

    // Users can own multiple organizations as long as they have the plan

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

    // Populate members for the response
    const populatedOrg = await Organization.findById(org._id).populate('members', 'name email image');

    return NextResponse.json({ org: populatedOrg });
  } catch (error) {
    console.error('Org create error:', error);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}
