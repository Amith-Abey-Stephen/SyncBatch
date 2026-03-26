import { NextResponse } from 'next/server';
import { utils, write } from 'xlsx';

export async function GET() {
  const data = [
    { Name: 'John Doe', Phone: '+919876543210' },
    { Name: 'Jane Smith', Phone: '9876543211' },
    { Name: 'Mike Ross', Phone: '+14155552671' }
  ];

  // Create worksheet
  const ws = utils.json_to_sheet(data);
  
  // Set nice column widths for the template
  ws['!cols'] = [
    { wch: 20 }, // Name length
    { wch: 20 }  // Phone length
  ];

  // Create workbook and append sheet
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Contacts');

  // Convert to buffer
  const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });

  // Return as excel download
  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Disposition': 'attachment; filename="syncbatch_template.xlsx"',
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });
}
