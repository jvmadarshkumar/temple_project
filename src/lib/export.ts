import * as XLSX from 'xlsx';

export function downloadTransactionsAsExcel(transactions: any[], filename = 'transactions.xlsx') {
  const incomes = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const aoa: any[][] = [];

  // Row 1: Headings matching the exact columns you provided
  aoa.push([
    'Date', 'Type', 'Category', 'Amount', 'Description', '',
    'Date', 'Type', 'Category', 'Amount', 'Description', '',
    'Balance'
  ]);

  // Row 2: Totals (Aligned with the Amount columns)
  aoa.push([
    '', '', '', totalIncome, '', '',
    '', '', '', totalExpense, '', '',
    netBalance
  ]);

  // Data rows
  const maxRows = Math.max(incomes.length, expenses.length);
  for (let i = 0; i < maxRows; i++) {
    const row: any[] = [];
    
    // Income Side (Left)
    if (i < incomes.length) {
      row.push(
        new Date(incomes[i].date).toLocaleDateString('en-GB'),
        incomes[i].type.toUpperCase(),
        incomes[i].category,
        incomes[i].amount,
        incomes[i].description || ''
      );
    } else {
      row.push('', '', '', '', '');
    }

    row.push(''); // Spacer

    // Expense Side (Right)
    if (i < expenses.length) {
      row.push(
        new Date(expenses[i].date).toLocaleDateString('en-GB'),
        expenses[i].type.toUpperCase(),
        expenses[i].category,
        expenses[i].amount,
        expenses[i].description || ''
      );
    } else {
      row.push('', '', '', '', '');
    }

    row.push(''); // Spacer
    row.push(''); // Balance column space below the total

    aoa.push(row);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Formatting column widths to ensure it looks neat and fits the data
  worksheet['!cols'] = [
    { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 25 }, { wch: 3 },
    { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 25 }, { wch: 3 },
    { wch: 15 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  XLSX.writeFile(workbook, filename);
}
