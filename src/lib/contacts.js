import * as XLSX from 'xlsx';

/**
 * Parse an Excel or CSV file buffer into an array of contacts
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @returns {{ contacts: Array<{name: string, phone: string}>, errors: string[] }}
 */
export function parseExcelBuffer(buffer, filename) {
  const contacts = [];
  const errors = [];

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (data.length === 0) {
      return { contacts: [], errors: ['File is empty or has no readable data'] };
    }

    // Try to find name and phone columns
    const headers = Object.keys(data[0]).map(h => h.toLowerCase().trim());
    
    let nameCol = findColumn(headers, ['name', 'full name', 'fullname', 'contact name', 'contactname', 'first name', 'firstname']);
    let phoneCol = findColumn(headers, ['phone', 'phone number', 'phonenumber', 'mobile', 'mobile number', 'mobilenumber', 'tel', 'telephone', 'contact', 'number', 'cell']);

    if (!nameCol && !phoneCol) {
      // Try positional fallback: first col = name, second = phone
      const keys = Object.keys(data[0]);
      if (keys.length >= 2) {
        nameCol = keys[0];
        phoneCol = keys[1];
      } else {
        return { contacts: [], errors: ['Could not find name and phone columns'] };
      }
    }

    const originalKeys = Object.keys(data[0]);
    const actualNameCol = originalKeys.find(k => k.toLowerCase().trim() === nameCol) || nameCol;
    const actualPhoneCol = originalKeys.find(k => k.toLowerCase().trim() === phoneCol) || phoneCol;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const name = String(row[actualNameCol] || '').trim();
      let phone = String(row[actualPhoneCol] || '').trim();

      if (!name && !phone) continue;

      // Clean phone number
      phone = cleanPhoneNumber(phone);

      if (!phone) {
        errors.push(`Row ${i + 2}: Invalid phone number for "${name}"`);
        continue;
      }

      if (!name) {
        errors.push(`Row ${i + 2}: Missing name for phone "${phone}"`);
        continue;
      }

      contacts.push({ name, phone });
    }

    return { contacts, errors };
  } catch (err) {
    return { contacts: [], errors: [`Failed to parse file: ${err.message}`] };
  }
}

function findColumn(headers, possibleNames) {
  for (const possible of possibleNames) {
    const found = headers.find(h => h === possible);
    if (found) return found;
  }
  return null;
}

function cleanPhoneNumber(phone) {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  if (!cleaned) return null;
  
  // If it starts with + keep it, otherwise ensure it has country code
  if (cleaned.startsWith('+')) {
    if (cleaned.length < 10) return null;
  } else {
    // Remove leading zeros  
    cleaned = cleaned.replace(/^0+/, '');
    if (cleaned.length === 10) {
      cleaned = '+91' + cleaned; // Default to India
    } else if (cleaned.length > 10) {
      cleaned = '+' + cleaned;
    } else {
      return null;
    }
  }

  return cleaned;
}

/**
 * Generate VCF content from contacts array
 */
export function generateVCF(contacts) {
  return contacts.map(c => {
    return `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${c.name}\r\nTEL:${c.phone}\r\nEND:VCARD`;
  }).join('\r\n');
}
