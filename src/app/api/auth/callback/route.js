import { NextResponse } from 'next/server';
import { getGoogleTokens, getGoogleUser } from '@/lib/google';
import { createSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Exchange code for tokens
    const tokens = await getGoogleTokens(code);
    
    if (tokens.error) {
      return NextResponse.redirect(new URL('/login?error=token_error', request.url));
    }

    // Get user info
    const googleUser = await getGoogleUser(tokens.access_token);

    // Connect to DB and upsert user
    await connectDB();

    let user = await User.findOne({ googleId: googleUser.id });

    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        image: googleUser.picture,
        googleId: googleUser.id,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token || '',
        credits: 0,
        freeUsed: false,
        plan: 'free',
      });
    } else {
      user.googleAccessToken = tokens.access_token;
      if (tokens.refresh_token) {
        user.googleRefreshToken = tokens.refresh_token;
      }
      user.name = googleUser.name;
      user.image = googleUser.picture;
      await user.save();
    }

    // Create session
    await createSession({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image,
    });

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}
