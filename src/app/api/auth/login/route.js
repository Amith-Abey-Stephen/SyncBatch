import { getGoogleAuthURL } from '@/lib/google';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get('redirect');
  
  const url = getGoogleAuthURL();
  const response = NextResponse.redirect(url);
  
  if (redirect) {
    response.cookies.set('auth_redirect', redirect, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10 minutes
      path: '/',
    });
  }
  
  return response;
}
