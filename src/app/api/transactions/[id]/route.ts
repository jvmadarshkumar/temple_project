import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

// PUT update transaction (Admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tokenPayload = getUserFromRequest(request);
    if (!tokenPayload || (tokenPayload as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    
    await dbConnect();
    
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );
    
    if (!updatedTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transaction updated', transaction: updatedTransaction });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE transaction (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tokenPayload = getUserFromRequest(request);
    if (!tokenPayload || (tokenPayload as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;

    await dbConnect();
    
    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    
    if (!deletedTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
