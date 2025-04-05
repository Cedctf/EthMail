import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '', // Your Gmail address
    pass: process.env.EMAIL_PASSWORD || '', // Your Gmail password or app password
  },
});

export async function POST(request: Request) {
  try {
    // Get email and magic link from request body
    const { email, magicLink } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    console.log('Preparing to send email to:', email);
    console.log('Magic link:', magicLink || 'No magic link provided');
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@example.com',
      to: email,
      subject: 'Your Magic Link for Flow Mail Wallet',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to right, #4F46E5, #6366F1); padding: 20px; border-radius: 8px; text-align: center;">
            <h1 style="color: white; margin: 0;">Flow Mail Wallet</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px; margin-top: 20px;">
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 16px; color: #333;">You requested a magic link to access your wallet. Click the button below to sign in:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              ${magicLink ? `
                <a href="${magicLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Sign In to Wallet</a>
              ` : `
                <p style="color: #666;">Magic link will be generated and sent by the Magic SDK</p>
              `}
            </div>
            
            <p style="font-size: 14px; color: #666;">If you didn't request this email, you can safely ignore it.</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Flow Mail. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    
    // If we're in production and have email creds, send the email
    if (process.env.NODE_ENV === 'production' && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', email);
      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      // For development: Just log the email details and return the magic link
      console.log('DEVELOPMENT MODE: Email would be sent with content:', mailOptions);
      console.log('---------------');
      console.log('To test the magic link, open this URL:');
      console.log(magicLink);
      console.log('---------------');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Development mode: Check console for magic link', 
        development: true,
        magicLink: magicLink // Return the magic link in the response for testing
      });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: String(error) },
      { status: 500 }
    );
  }
} 