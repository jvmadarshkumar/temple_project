"use client";

import { useEffect, useState } from 'react';
import { downloadTransactionsAsExcel } from '@/lib/export';

export default function ViewerDashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data) => setTransactions(data.transactions || []))
      .finally(() => setLoading(false));
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncome - totalExpense;

  if (loading) return <div>Loading data...</div>;

  return (
    <div className="grid">
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
          <h3>Recent Transactions</h3>
          <button className="btn btn-primary" onClick={() => downloadTransactionsAsExcel(transactions)}>
            Download Excel
          </button>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
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
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center" style={{ padding: '2rem' }}>No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
