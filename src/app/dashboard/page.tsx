"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';
import ViewerDashboard from '@/components/ViewerDashboard';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        router.push('/');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Dashboard...</div>;
  if (!user) return null;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <div style={{ paddingTop: '2rem' }}>
      <div className="glass-panel mb-4 flex flex-col-mobile justify-between align-center">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="mobile-text-center">
          <img src="/ganesha-logo.png" alt="Ganesha Logo" className="logo-img" />
          <h2 style={{ margin: 0 }}>Temple Finance Tracker</h2>
        </div>
        <div className="flex flex-col-mobile align-center gap-4 mobile-text-center">
          <span>Welcome, {user.name} ({user.role})</span>
          <button className="btn btn-secondary btn-full-mobile" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
      {user.role === 'admin' ? <AdminDashboard /> : <ViewerDashboard user={user} />}
    </div>
  );
}
