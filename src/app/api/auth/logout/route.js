import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');
  return response;
}
