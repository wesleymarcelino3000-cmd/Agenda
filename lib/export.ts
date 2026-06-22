import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export function exportToPDF(title: string, rows: Record<string, unknown>[]) {
  const doc = new jsPDF();
  doc.text(title, 14, 16);
  rows.slice(0, 80).forEach((row, index) => {
    doc.text(`${index + 1}. ${JSON.stringify(row).slice(0, 95)}`, 14, 28 + index * 7);
  });
  doc.save(`${title.toLowerCase().replaceAll(' ', '-')}.pdf`);
}

export function exportToExcel(title: string, rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 28));
  XLSX.writeFile(wb, `${title.toLowerCase().replaceAll(' ', '-')}.xlsx`);
}
