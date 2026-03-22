import { Item } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDFBlob = (items: Item[], title: string = 'Inventory Report'): Blob => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  const tableColumn = ["Item Name", "Category", "Quantity", "Unit Price", "Total Value"];
  const tableRows = items.map(item => [
    item.name,
    item.categoryName || 'N/A',
    item.quantity.toString(),
    `$${item.price.toFixed(2)}`,
    `$${(item.quantity * item.price).toFixed(2)}`
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  return doc.output('blob');
};

export const exportToPDF = (items: Item[], title: string = 'Inventory Report'): void => {
  const blob = generatePDFBlob(items, title);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'inventory-report.pdf');
  link.click();
};

export const generateCSVBlob = (items: Item[]): Blob => {
  const headers = ["Item Name", "Category", "Quantity", "Unit Price", "Total Value"];
  
  const csvRows = items.map(item => {
    const totalValue = item.quantity * item.price;
    return [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${(item.categoryName || '').replace(/"/g, '""')}"`,
      item.quantity,
      item.price.toFixed(2),
      totalValue.toFixed(2)
    ].join(',');
  });
  
  const csvContent = [headers.join(','), ...csvRows].join('\n');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

export const exportToCSV = (items: Item[], filename: string = 'inventory-report.csv'): void => {
  const blob = generateCSVBlob(items);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
