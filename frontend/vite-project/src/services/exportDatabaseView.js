export async function exportDatabaseView(title, columns, rows) {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title, { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = columns.map(({ label }) => ({ header: label, width: Math.max(15, label.length + 4) }));
  for (const row of rows) {
    sheet.addRow(columns.map(({ key, render, exportValue }, index) => {
      const value = (exportValue ?? render)?.(row[key], row) ?? row[key];
      const cell = typeof value === 'number' || typeof value === 'string' ? value : null;
      const column = sheet.getColumn(index + 1);
      column.width = Math.min(55, Math.max(column.width, String(cell ?? '').length + 2));
      return cell;
    }));
  }
  sheet.getRow(1).font = { bold: true };
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: sheet.rowCount, column: columns.length } };
  const bytes = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `lisbonwhisper-${title.toLowerCase().replace(/\s+/g, '-')}.xlsx`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
