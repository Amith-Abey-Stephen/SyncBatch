import { NextResponse } from 'next/server';
import { getGoogleTokens, getGoogleUser } from '@/lib/google';
import { createSession, encrypt } from '@/lib/session';
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
        credits: 1, // Award 1 free credits
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

    // Create session token
    const sessionData = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image,
    };
    
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const sessionToken = await encrypt({ ...sessionData, expiresAt: expiresAt.toISOString() });

    // Handle redirect
    const cookieStore = await request.cookies;
    const redirectPath = cookieStore.get('auth_redirect')?.value || '/dashboard';
    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    
    // Clear the redirect cookie
    response.cookies.delete('auth_redirect');
    
    // Set session cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}
