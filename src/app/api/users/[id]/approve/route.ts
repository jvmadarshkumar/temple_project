import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenPayload = getUserFromRequest(request);
    if (!tokenPayload || (tokenPayload as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Password must be provided to approve the user' }, { status: 400 });
    }

    await dbConnect();
    
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.status = 'approved';
    user.password = password; // Storing plain text as requested by admin rules
    await user.save();
    
    return NextResponse.json({ message: 'User approved successfully', user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
