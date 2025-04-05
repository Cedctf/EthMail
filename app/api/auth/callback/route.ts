import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');
  const accessToken = searchParams.get('access_token');

  if (error) {
    return NextResponse.redirect(`/?error=${error}`);
  }

  if (accessToken) {
    return NextResponse.redirect(`/?access_token=${accessToken}`);
  }

  return NextResponse.redirect('/?error=no_token');
} 