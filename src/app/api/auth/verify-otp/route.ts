import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Otp from '@/models/Otp';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { email, otp, name, phoneNumber, password } = await request.json();
    if (!email || !otp || !name || !phoneNumber || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await dbConnect();

    // Verify OTP
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create pending user
    const newUser = await User.create({
      name,
      email,
      phoneNumber,
      password,
      role: 'viewer', // default role
      status: 'pending' // waits for admin approval
    });

    // Delete OTP
    await Otp.deleteOne({ _id: validOtp._id });

    return NextResponse.json({ message: 'Email verified. Registration pending admin approval.', user: newUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
