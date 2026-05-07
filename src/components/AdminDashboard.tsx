"use client";

import { useEffect, useState } from 'react';
import ExportModal from './ExportModal';
import { downloadTransactionsAsExcel } from '@/lib/export';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'users'>('transactions');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Export filters
  const [showExportModal, setShowExportModal] = useState(false);

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

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePermission = async (id: string, field: string, value: boolean) => {
    try {
      await fetch(`/api/users/${id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const currentYear = new Date().getFullYear().toString();

  const groupedTransactions = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('default', { month: 'long' });
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(t);
    return acc;
  }, {} as Record<string, Record<string, any[]>>);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const sortMonths = (a: string, b: string) => monthNames.indexOf(b) - monthNames.indexOf(a);

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
          <div className="grid grid-3 mb-4">
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
            <div className="flex flex-col-mobile justify-between align-center mb-4">
              <h3>Transactions</h3>
              <div className="flex flex-col-mobile gap-4 align-center w-full" style={{ width: '100%' }}>
                <button className="btn btn-secondary btn-full-mobile" onClick={() => setShowExportModal(true)}>
                  Export Excel
                </button>
                <button className="btn btn-primary btn-full-mobile" onClick={() => setShowAddModal(!showAddModal)}>
                  {showAddModal ? 'Cancel' : '+ Add Transaction'}
                </button>
              </div>
            </div>

            {showExportModal && (
              <ExportModal transactions={transactions} onClose={() => setShowExportModal(false)} />
            )}

            {showAddModal && (
              <form onSubmit={handleAddTransaction} className="mb-4" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div className="grid grid-3">
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
                <div className="grid grid-2 mt-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
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
            
            <div>
              {Object.keys(groupedTransactions).sort((a, b) => Number(b) - Number(a)).map(year => {
                const monthsObj = groupedTransactions[year];
                const sortedMonths = Object.keys(monthsObj).sort(sortMonths);
                
                const renderMonth = (month: string, isOpen: boolean) => {
                  const groupTxs = monthsObj[month];
                  const groupIncome = groupTxs.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0);
                  const groupExpense = groupTxs.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0);
                  const groupNet = groupIncome - groupExpense;

                  return (
                    <details key={month} open={isOpen} className="mb-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', padding: '0.5rem', outline: 'none' }}>
                        {month} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', opacity: 0.8, marginLeft: '1rem' }}>(Net Balance: ₹{groupNet.toLocaleString()})</span>
                      </summary>
                      <div className="table-wrapper" style={{ marginTop: '1rem' }}>
                        <table>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Type</th>
                              <th>Category</th>
                              <th>Description</th>
                              <th>Amount</th>
                              <th>Added By</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupTxs.map((t: any) => (
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
                                <td>{t.addedBy?.name || 'System'}</td>
                                <td>
                                  <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => handleDeleteTransaction(t._id)}>
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  );
                };

                if (year === currentYear) {
                  return sortedMonths.map((month, index) => renderMonth(month, index === 0));
                } else {
                  let yearIncome = 0;
                  let yearExpense = 0;
                  Object.values(monthsObj).flat().forEach((t: any) => {
                    if (t.type === 'income') yearIncome += t.amount;
                    else yearExpense += t.amount;
                  });
                  const yearNet = yearIncome - yearExpense;

                  return (
                    <details key={year} className="mb-4" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', padding: '0.5rem', outline: 'none', color: 'var(--accent-color)' }}>
                        {year} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'white', marginLeft: '1rem' }}>(Net Balance: ₹{yearNet.toLocaleString()})</span>
                      </summary>
                      <div style={{ marginTop: '1rem', marginLeft: '1rem' }}>
                        {sortedMonths.map(month => renderMonth(month, false))}
                      </div>
                    </details>
                  );
                }
              })}
              {transactions.length === 0 && (
                <div className="text-center" style={{ padding: '2rem' }}>No transactions found.</div>
              )}
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
                      <div className="flex gap-4">
                        <button className="btn btn-success" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => handleUpdateStatus(u._id, 'approved')}>
                          Approve
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => handleUpdateStatus(u._id, 'rejected')}>
                          Reject
                        </button>
                      </div>
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
            <h3>Approved Users Management</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Password</th>
                  <th>Permissions</th>
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
                    <td>
                      {u.role !== 'admin' && (
                        <div className="flex flex-col-mobile gap-4">
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={u.isDisabled || false} 
                              onChange={(e) => handleTogglePermission(u._id, 'isDisabled', e.target.checked)} 
                            />
                            Disable User
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={u.canAddTransactions || false} 
                              onChange={(e) => handleTogglePermission(u._id, 'canAddTransactions', e.target.checked)} 
                            />
                            Allow Add Tx
                          </label>
                        </div>
                      )}
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
