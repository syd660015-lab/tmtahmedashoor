import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

interface ExportData {
  type: string;
  duration: number;
  errors: number;
  timestamp: any;
  tScore: number;
  percentile: number;
  interpretation: string;
}

export const exportToExcel = (data: ExportData[], userName: string) => {
  const worksheetData = data.map(item => ({
    'التاريخ': format(item.timestamp?.toDate() || new Date(), 'yyyy-MM-dd HH:mm'),
    'نوع الاختبار': item.type,
    'المدة (ث)': item.duration,
    'الأخطاء': item.errors,
    'الدرجة المعيارية (T-Score)': item.tScore,
    'الرتبة المئينية': `${item.percentile}%`,
    'التدفسير': item.interpretation,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'نتائج الاختبارات');
  
  // Set RTL for the sheet if possible
  if (!worksheet['!ref']) return;
  
  XLSX.writeFile(workbook, `NeuroTrack_Results_${userName}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};

export const exportToPDF = (data: ExportData[], userName: string) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  // Since standard PDF fonts don't support Arabic well without extra configuration (loading TTF),
  // we will use a simplified table. For full Arabic support, we'd need to embed a font file.
  // In this sandbox environment, we'll try to provide a clean layout.
  
  doc.setFontSize(20);
  doc.text('NeuroTrack CTMT Pro - Results Report', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`User: ${userName}`, 20, 35);
  doc.text(`Report Date: ${format(new Date(), 'PPP p')}`, 20, 42);

  const tableColumn = ["Date", "Test Type", "Duration (s)", "Errors", "T-Score", "Percentile", "Interpretation"];
  const tableRows: any[] = [];

  data.forEach(item => {
    const rowData = [
      format(item.timestamp?.toDate() || new Date(), 'yyyy-MM-dd HH:mm'),
      item.type,
      item.duration,
      item.errors,
      item.tScore,
      `${item.percentile}%`,
      item.interpretation
    ];
    tableRows.push(rowData);
  });

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 50,
    theme: 'striped',
    headStyles: { fillColor: [49, 130, 206] },
  });

  doc.save(`NeuroTrack_Results_${userName}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
