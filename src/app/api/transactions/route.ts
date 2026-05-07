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

    await dbConnect();
    const transactions = await Transaction.find({}).sort({ date: -1 });
    
    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new transaction (Admin only)
export async function POST(request: NextRequest) {
  try {
    const tokenPayload = getUserFromRequest(request);
    if (!tokenPayload || (tokenPayload as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
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
