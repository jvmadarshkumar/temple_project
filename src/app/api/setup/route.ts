import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Check if any user exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return NextResponse.json({ error: 'Setup already completed. Users exist in the database.' }, { status: 403 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'adminadarshkumar@gmail.com';

    // Create the first admin
    const adminUser = await User.create({
      name: 'Temple Admin',
      email: adminEmail,
      phoneNumber: '0000000000',
      password: 'admin',
      role: 'admin',
      status: 'approved'
    });

    return NextResponse.json({ 
      message: 'Admin account created successfully! You can now log in.', 
      email: adminEmail,
      password: 'admin' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
