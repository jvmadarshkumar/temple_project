"use client";

import { useEffect, useState } from 'react';
import { downloadTransactionsAsExcel } from '@/lib/export';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'users'>('transactions');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, usersRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/users')
      ]);
      const txData = await txRes.json();
      const usersData = await usersRes.json();
      
      setTransactions(txData.transactions || []);
      setUsers(usersData.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setShowAddModal(false);
      fetchData();
      setFormData({ ...formData, amount: '', description: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveUser = async (id: string) => {
    const password = prompt('Enter a fixed password for this user to login:');
    if (!password) return;

    try {
      await fetch(`/api/users/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncome - totalExpense;

  if (loading && transactions.length === 0) return <div>Loading Admin Dashboard...</div>;

  return (
    <div className="grid">
      <div className="flex gap-4 mb-4">
        <button 
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('transactions')}
        >
          Manage Transactions
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
      </div>

      {activeTab === 'transactions' && (
        <>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div className="glass-panel text-center">
              <h3>Total Income</h3>
              <h2 className="text-success">₹{totalIncome.toLocaleString()}</h2>
            </div>
            <div className="glass-panel text-center">
              <h3>Total Expenses</h3>
              <h2 className="text-danger">₹{totalExpense.toLocaleString()}</h2>
            </div>
            <div className="glass-panel text-center">
              <h3>Net Balance</h3>
              <h2 style={{ color: netBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                ₹{netBalance.toLocaleString()}
              </h2>
            </div>
          </div>

          <div className="glass-panel">
            <div className="flex justify-between align-center mb-4">
              <h3>Transactions</h3>
              <div className="flex gap-4">
                <button className="btn btn-secondary" onClick={() => downloadTransactionsAsExcel(transactions)}>
                  Export Excel
                </button>
                <button className="btn btn-primary" onClick={() => setShowAddModal(!showAddModal)}>
                  {showAddModal ? 'Cancel' : '+ Add Transaction'}
                </button>
              </div>
            </div>

            {showAddModal && (
              <form onSubmit={handleAddTransaction} className="mb-4" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <div>
                    <label>Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div>
                    <label>Amount (₹)</label>
                    <input type="number" required min="1" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                  </div>
                  <div>
                    <label>Date</label>
                    <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                </div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
                  <div>
                    <label>Category</label>
                    <input type="text" required placeholder="e.g. Donation, Maintenance" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                  </div>
                  <div>
                    <label>Description (Optional)</label>
                    <input type="text" placeholder="Additional details..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="btn btn-success mt-4">Save Transaction</button>
              </form>
            )}
            
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t._id}>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`text-${t.type === 'income' ? 'success' : 'danger'}`}>
                          {t.type.toUpperCase()}
                        </span>
                      </td>
                      <td>{t.category}</td>
                      <td>{t.description}</td>
                      <td className={`text-${t.type === 'income' ? 'success' : 'danger'}`}>
                        ₹{t.amount.toLocaleString()}
                      </td>
                      <td>
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => handleDeleteTransaction(t._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center" style={{ padding: '2rem' }}>No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="glass-panel">
          <div className="mb-4">
            <h3>Pending Approvals</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.status === 'pending').map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phoneNumber}</td>
                    <td>
                      <button className="btn btn-success" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => handleApproveUser(u._id)}>
                        Approve & Set Password
                      </button>
                    </td>
                  </tr>
                ))}
                {users.filter(u => u.status === 'pending').length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center">No pending users.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <h3>Approved Users (View Passwords)</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Assigned Password</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.status === 'approved').map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role.toUpperCase()}</td>
                    <td style={{ fontFamily: 'monospace', letterSpacing: '1px', color: 'var(--accent-color)' }}>
                      {u.password || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
