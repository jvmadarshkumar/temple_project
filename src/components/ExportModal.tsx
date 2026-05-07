"use client";

import { useState } from 'react';
import { downloadTransactionsAsExcel } from '@/lib/export';

export default function ExportModal({ transactions, onClose }: { transactions: any[], onClose: () => void }) {
  const [option, setOption] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handleExport = () => {
    let filtered = [...transactions];
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    if (option === 'current_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (option === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (option === 'last_six_months') {
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (option === 'financial_year') {
      const currentMonth = now.getMonth();
      const year = currentMonth >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      start = new Date(year, 3, 1); // April 1
      end = new Date(year + 1, 2, 31, 23, 59, 59); // March 31
    } else if (option === 'custom') {
      if (customStart) start = new Date(customStart);
      if (customEnd) {
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
    }

    if (start || end) {
      filtered = transactions.filter(t => {
        const txDate = new Date(t.date);
        let isValid = true;
        if (start) isValid = isValid && txDate >= start;
        if (end) isValid = isValid && txDate <= end;
        return isValid;
      });
    }

    downloadTransactionsAsExcel(filtered);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="mb-4">Export Transactions</h3>
        
        <div className="grid grid-1 gap-4 mb-4">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date Range</label>
            <select value={option} onChange={e => setOption(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}>
              <option value="all">All Time</option>
              <option value="current_month">Current Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_six_months">Last 6 Months</option>
              <option value="financial_year">Current Financial Year (Apr-Mar)</option>
              <option value="custom">Custom Dates</option>
            </select>
          </div>

          {option === 'custom' && (
            <div className="grid grid-2 gap-4">
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>From</label>
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: 'white', color: 'black' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>To</label>
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: 'white', color: 'black' }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-mobile justify-between mt-4">
          <button className="btn btn-secondary btn-full-mobile" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-full-mobile" onClick={handleExport}>Download Excel</button>
        </div>
      </div>
    </div>
  );
}
