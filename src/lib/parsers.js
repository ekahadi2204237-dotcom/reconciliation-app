import * as XLSX from 'xlsx';

export const normalizeHeader = (header) => {
  if (!header) return '';
  return String(header)
    .toLowerCase()
    .trim()
    .replace(/[\s\-_()]/g, '')
    .replace(/[^a-z0-9]/g, '');
};

export const parseNumericValue = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;

  let str = String(value).trim();

  str = str.replace(/[$₱₹₩₪€¥₩]/g, '');
  str = str.replace(/\s/g, '');

  const decimalMatch = str.match(/[.,]/g);
  if (decimalMatch && decimalMatch.length > 0) {
    const lastSeparatorIndex = Math.max(
      str.lastIndexOf(','),
      str.lastIndexOf('.')
    );
    const beforeLast = str.substring(0, lastSeparatorIndex);
    const afterLast = str.substring(lastSeparatorIndex + 1);

    if (beforeLast.match(/[.,]/g) && beforeLast.match(/[.,]/g).length > 0) {
      str = beforeLast.replace(/[,.]/g, '') + '.' + afterLast;
    } else {
      str = beforeLast + '.' + afterLast;
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

export const parseDate = (value) => {
  if (!value) return null;

  if (typeof value === 'number') {
    const excelEpoch = new Date('1900-01-01');
    const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  }

  const str = String(value).trim();
  const date = new Date(str);

  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  return null;
};

export const normalizeInvoice = (invoice) => {
  if (!invoice) return '';
  return String(invoice).trim().toUpperCase();
};

const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        resolve({ data: jsonData, sheetCount: workbook.SheetNames.length, fileName: file.name });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

const findColumnByNames = (headers, possibleNames) => {
  const normalizedPossible = possibleNames.map(normalizeHeader);
  for (let i = 0; i < headers.length; i++) {
    const normalizedHeader = normalizeHeader(headers[i]);
    if (normalizedPossible.includes(normalizedHeader)) {
      return { index: i, header: headers[i], normalized: normalizedHeader };
    }
  }
  return null;
};

const logParsingDebug = (marketplace, rowCount, headerMapping, invalidRows) => {
  console.log(`\n=== ${marketplace} Parsing ===`);
  console.log(`✓ Rows parsed: ${rowCount}`);
  console.log('Header mapping:', headerMapping);
  if (invalidRows.length > 0) {
    console.log(`⚠ Invalid rows (first 50 of ${invalidRows.length}):`);
    invalidRows.slice(0, 50).forEach(row => {
      console.log(`  Row ${row.index}:`, row.data);
    });
  }
};

export const loadAccurate = async (file) => {
  const result = await readExcelFile(file);
  const data = result.data;

  if (data.length < 2) {
    throw new Error('Accurate file must contain at least headers and one data row');
  }

  const headers = data[0];

  const invoiceCol = findColumnByNames(headers, ['faktur', 'invoice', 'invoiceno', 'no', 'number']);
  const amountCol = findColumnByNames(headers, ['total', 'amount', 'jumlah', 'grandtotal', 'price']);
  const dateCol = findColumnByNames(headers, ['tanggal', 'date', 'tgl', 'createddate', 'created']);

  if (!invoiceCol || !amountCol) {
    throw new Error('Could not find Invoice and Amount columns in Accurate file');
  }

  const records = [];
  const invalidRows = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const invoice = normalizeInvoice(row[invoiceCol.index]);
    const amount = parseNumericValue(row[amountCol.index]);
    const date = dateCol ? parseDate(row[dateCol.index]) : null;

    if (!invoice) {
      invalidRows.push({ index: i + 1, data: row });
      continue;
    }

    if (amount <= 0) {
      invalidRows.push({ index: i + 1, data: row });
      continue;
    }

    records.push({
      invoiceNumber: invoice,
      amount,
      date,
      rawRow: row
    });
  }

  logParsingDebug('Accurate', records.length, {
    invoice: invoiceCol.header,
    amount: amountCol.header,
    date: dateCol?.header || 'not found'
  }, invalidRows);

  return {
    marketplace: 'Accurate',
    records,
    metadata: {
      fileName: result.fileName,
      sheetCount: result.sheetCount,
      totalRows: data.length - 1,
      validRows: records.length,
      invalidRows: invalidRows.length
    }
  };
};

export const loadShopee = async (file) => {
  const result = await readExcelFile(file);
  const data = result.data;

  if (data.length < 2) {
    throw new Error('Shopee file must contain at least headers and one data row');
  }

  const headers = data[0];

  const invoiceCol = findColumnByNames(headers, ['orderid', 'ordernumber', 'order', 'transactionid', 'id']);
  const amountCol = findColumnByNames(headers, ['totalamount', 'amount', 'total', 'price', 'orderamount']);
  const dateCol = findColumnByNames(headers, ['completedtime', 'date', 'orderdate', 'createdate', 'tgl']);

  if (!invoiceCol || !amountCol) {
    throw new Error('Could not find Order ID and Total Amount columns in Shopee file');
  }

  const records = [];
  const invalidRows = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const invoice = normalizeInvoice(row[invoiceCol.index]);
    const amount = parseNumericValue(row[amountCol.index]);
    const date = dateCol ? parseDate(row[dateCol.index]) : null;

    if (!invoice) {
      invalidRows.push({ index: i + 1, data: row });
      continue;
    }

    if (amount <= 0) {
      invalidRows.push({ index: i + 1, data: row });
      continue;
    }

    records.push({
      invoiceNumber: invoice,
      amount,
      date,
      rawRow: row
    });
  }

  logParsingDebug('Shopee', records.length, {
    invoice: invoiceCol.header,
    amount: amountCol.header,
    date: dateCol?.header || 'not found'
  }, invalidRows);

  return {
    marketplace: 'Shopee',
    records,
    metadata: {
      fileName: result.fileName,
      sheetCount: result.sheetCount,
      totalRows: data.length - 1,
      validRows: records.length,
      invalidRows: invalidRows.length
    }
  };
};

export const loadTikTok = async (file) => {
  const result = await readExcelFile(file);
  const data = result.data;

  if (data.length < 2) {
    throw new Error('TikTok file must contain at least headers and one data row');
  }

  const headers = data[0];

  const invoiceCol = findColumnByNames(headers, ['ordernumber', 'orderid', 'order', 'transactionid', 'id', 'orderno']);
  const amountCol = findColumnByNames(headers, ['buyerpaidamount', 'amount', 'totalamount', 'total', 'price', 'paymentamount']);
  const dateCol = findColumnByNames(headers, ['orderdate', 'paiddate', 'date', 'createddate', 'tgl', 'time']);

  if (!invoiceCol || !amountCol) {
    throw new Error('Could not find Order Number and Amount columns in TikTok file');
  }

  const records = [];
  const invalidRows = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const invoice = normalizeInvoice(row[invoiceCol.index]);
    const amount = parseNumericValue(row[amountCol.index]);
    const date = dateCol ? parseDate(row[dateCol.index]) : null;

    if (!invoice) {
      invalidRows.push({ index: i + 1, data: row });
      continue;
    }

    if (amount <= 0) {
      invalidRows.push({ index: i + 1, data: row });
      continue;
    }

    records.push({
      invoiceNumber: invoice,
      amount,
      date,
      rawRow: row
    });
  }

  logParsingDebug('TikTok', records.length, {
    invoice: invoiceCol.header,
    amount: amountCol.header,
    date: dateCol?.header || 'not found'
  }, invalidRows);

  return {
    marketplace: 'TikTok',
    records,
    metadata: {
      fileName: result.fileName,
      sheetCount: result.sheetCount,
      totalRows: data.length - 1,
      validRows: records.length,
      invalidRows: invalidRows.length
    }
  };
};

export const loadLazada = async (file) => {
  const result = await readExcelFile(file);
  const data = result.data;

  if (data.length < 2) {
    throw new Error('Lazada file must contain at least headers and one data row');
  }

  const headers = data[0];

  const invoiceCol = findColumnByNames(headers, ['transactionnumber', 'transaction', 'id', 'orderid', 'ordernumber', 'transactionid']);
  const amountCol = findColumnByNames(headers, ['amount', 'total', 'totalamount', 'price', 'orderamount', 'totalvalue']);
  const dateCol = findColumnByNames(headers, ['createdtime', 'created', 'date', 'orderdate', 'tgl']);

  if (!invoiceCol || !amountCol) {
    throw new Error('Could not find Transaction Number and Amount columns in Lazada file');
  }

  const records = [];
  const invalidRows = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const invoice = normalizeInvoice(row[invoiceCol.index]);
    const amount = parseNumericValue(row[amountCol.index]);
    const date = dateCol ? parseDate(row[dateCol.index]) : null;

    if (!invoice) {
      invalidRows.push({ index: i + 1, data: row });
      continue;
    }

    if (amount <= 0) {
      invalidRows.push({ index: i + 1, data: row });
      continue;
    }

    records.push({
      invoiceNumber: invoice,
      amount,
      date,
      rawRow: row
    });
  }

  logParsingDebug('Lazada', records.length, {
    invoice: invoiceCol.header,
    amount: amountCol.header,
    date: dateCol?.header || 'not found'
  }, invalidRows);

  return {
    marketplace: 'Lazada',
    records,
    metadata: {
      fileName: result.fileName,
      sheetCount: result.sheetCount,
      totalRows: data.length - 1,
      validRows: records.length,
      invalidRows: invalidRows.length
    }
  };
};
