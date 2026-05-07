import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

// GET all transactions (for both Viewer and Admin)
export async function GET(request: NextRequest) {
  try {
    const tokenPayload = getUserFromRequest(request);
    if (!tokenPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    await dbConnect();
    // Also load the User model so Mongoose can resolve the ref properly in case it's not loaded
    require('@/models/User');
    const transactions = await Transaction.find({})
      .populate('addedBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Transaction.countDocuments();
    
    return NextResponse.json({ 
      transactions, 
      total, 
      page, 
      totalPages: Math.ceil(total / limit) 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new transaction (Admin only)
export async function POST(request: NextRequest) {
  try {
    const tokenPayload = getUserFromRequest(request);
    if (!tokenPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    require('@/models/User');
    const User = require('@/models/User').default;
    const user = await User.findById((tokenPayload as any).id);

    if (!user || (user.role !== 'admin' && !user.canAddTransactions)) {
      return NextResponse.json({ error: 'Unauthorized. You do not have permission to add transactions.' }, { status: 403 });
    }

    const body = await request.json();
    const { type, amount, category, date, description } = body;

    if (!type || !amount || !category || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();
    
    const newTransaction = await Transaction.create({
      type,
      amount: Number(amount),
      category,
      date: new Date(date),
      description,
      addedBy: (tokenPayload as any).id
    });
    
    return NextResponse.json({ message: 'Transaction added', transaction: newTransaction });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
