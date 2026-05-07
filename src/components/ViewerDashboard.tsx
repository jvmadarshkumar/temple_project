"use client";

import { useEffect, useState } from 'react';
import ExportModal from './ExportModal';
import { downloadTransactionsAsExcel } from '@/lib/export';

export default function ViewerDashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data) => setTransactions(data.transactions || []))
      .finally(() => setLoading(false));
  }, []);

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
          <div className="flex gap-4 align-center">
            <button className="btn btn-primary" onClick={() => setShowExportModal(true)}>
              Download Excel
            </button>
          </div>
        </div>

        {showExportModal && (
          <ExportModal transactions={transactions} onClose={() => setShowExportModal(false)} />
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
                  <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
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
    </div>
  );
}
