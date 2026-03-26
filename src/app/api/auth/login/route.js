import { getGoogleAuthURL } from '@/lib/google';
import { NextResponse } from 'next/server';

export async function GET() {
  const url = getGoogleAuthURL();
  return NextResponse.redirect(url);
}
