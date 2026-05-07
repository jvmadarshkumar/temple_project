import * as XLSX from 'xlsx';

export function downloadTransactionsAsExcel(transactions: any[], filename = 'transactions.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(
    transactions.map((t) => ({
      Date: new Date(t.date).toLocaleDateString(),
      Type: t.type.toUpperCase(),
      Category: t.category,
      Amount: t.amount,
      Description: t.description || '',
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

  XLSX.writeFile(workbook, filename);
}
