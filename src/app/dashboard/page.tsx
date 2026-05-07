import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Image from 'next/image';
import AdminDashboard from '@/components/AdminDashboard';
import ViewerDashboard from '@/components/ViewerDashboard';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    redirect('/');
  }

  await dbConnect();
  const user = await User.findById((decoded as any).id).lean();
  
  if (!user) {
    redirect('/');
  }

  // Pre-fetch data for SSR
  require('@/models/User'); // Ensure refs
  
  // Fetch first 50 transactions
  const initialTransactions = await Transaction.find({})
    .populate('addedBy', 'name email')
    .sort({ date: -1 })
    .limit(50)
    .lean();

  // If admin, fetch users
  let initialUsers: any[] = [];
  if (user.role === 'admin') {
    initialUsers = await User.find({}).sort({ createdAt: -1 }).lean();
  }

  // Serialize MongoDB documents to pass as props to Client Components
  const serializedUser = JSON.parse(JSON.stringify(user));
  const serializedTx = JSON.parse(JSON.stringify(initialTransactions));
  const serializedUsers = JSON.parse(JSON.stringify(initialUsers));

  return (
    <div style={{ paddingTop: '2rem' }}>
      <div className="glass-panel mb-4 flex flex-col-mobile justify-between align-center">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="mobile-text-center">
          <Image src="/ganesha-logo.png" alt="Ganesha Logo" width={80} height={80} className="logo-img" priority />
          <h2 style={{ margin: 0 }}>Temple Finance Tracker</h2>
        </div>
        <div className="flex flex-col-mobile align-center gap-4 mobile-text-center">
          <span>Welcome, {serializedUser.name} ({serializedUser.role})</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="btn btn-secondary btn-full-mobile">Logout</button>
          </form>
        </div>
      </div>
      
      {serializedUser.role === 'admin' ? (
        <AdminDashboard initialTransactions={serializedTx} initialUsers={serializedUsers} />
      ) : (
        <ViewerDashboard user={serializedUser} initialTransactions={serializedTx} />
      )}
    </div>
  );
}
