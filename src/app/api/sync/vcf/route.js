import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { generateVCF } from '@/lib/contacts';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contacts } = await request.json();

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts provided' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check contact limit for plan
    const limit = user.maxContactsLimit || 50;
    if (contacts.length > limit) {
      return NextResponse.json({ 
        error: `Sync limit exceeded. Your current pack allows up to ${limit} contacts per sync. Please upgrade to a higher pack for larger lists.` 
      }, { status: 403 });
    }

    // Check credits
    const hasCredits = !user.freeUsed || user.credits > 0;
    if (!hasCredits) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
    }

    // Generate VCF
    const vcfContent = generateVCF(contacts);

    // Deduct credit
    if (!user.freeUsed) {
      user.freeUsed = true;
    } else {
      user.credits -= 1;
    }
    await user.save();

    return new NextResponse(vcfContent, {
      headers: {
        'Content-Type': 'text/vcard',
        'Content-Disposition': `attachment; filename="contacts_${Date.now()}.vcf"`,
      },
    });
  } catch (error) {
    console.error('VCF error:', error);
    return NextResponse.json({ error: 'Failed to generate VCF' }, { status: 500 });
  }
}
