import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { name, email, phoneNumber, password } = await request.json();
    
    if (!name || !email || !password || !phoneNumber) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await dbConnect();
    
    // Check if any user exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return NextResponse.json({ error: 'Setup already completed. Users exist in the database.' }, { status: 403 });
    }

    // Create the first admin
    const adminUser = await User.create({
      name,
      email,
      phoneNumber,
      password,
      role: 'admin',
      status: 'approved'
    });

    return NextResponse.json({ message: 'Admin account created successfully!', user: adminUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
