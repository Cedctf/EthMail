import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    console.log('Received code for exchange:', code ? 'Present' : 'Not found');
    
    if (!code) {
      console.error('No code provided in request');
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    
    console.log('Environment variables:');
    console.log('Client ID:', clientId ? 'Present' : 'Missing');
    console.log('Client Secret:', clientSecret ? 'Present' : 'Missing');
    console.log('Redirect URI:', redirectUri);
    
    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' }, 
        { status: 500 }
      );
    }
    
    // Exchange code for token
    console.log('Sending request to Google OAuth endpoint...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    console.log('Google OAuth response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange error:', errorData);
      return NextResponse.json(
        { error: 'Failed to exchange code for token', details: errorData }, 
        { status: tokenResponse.status }
      );
    }
    
    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');
    
    return NextResponse.json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token,
    });
  } catch (error) {
    console.error('Error exchanging code:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) }, 
      { status: 500 }
    );
  }
} 