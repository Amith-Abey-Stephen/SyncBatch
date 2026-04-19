import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, subject, message, type } = body;

    // In a real application, you would:
    // 1. Send an email using Resend/SendGrid
    // 2. Save to a database (e.g., MongoDB SupportTicket model)
    // 3. Send a Slack/Discord notification

    console.log('--- New Support Message ---');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Subject/Type:', subject || type);
    console.log('Message:', message);
    console.log('---------------------------');

    // Simulate database/API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ 
      success: true, 
      message: 'Message received successfully. We will get back to you soon!' 
    });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again later.' },
      { status: 500 }
    );
  }
}
