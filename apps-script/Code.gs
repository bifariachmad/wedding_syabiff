// Bound Google Sheets web app. Run setup() once before deploying.
const MAX_GUESTS = 5;
const COLUMNS = ['id', 'created_at', 'updated_at', 'name', 'name_key', 'guests', 'checked_in', 'checked_in_at'];
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function setup() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Open this script from Extensions > Apps Script in your Sheet.');
  props.setProperty('SHEET_ID', spreadsheet.getId());
  if (!props.getProperty('ADMIN_PIN')) props.setProperty('ADMIN_PIN', Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase());
  const sheet = spreadsheet.getSheetByName('Reservations') || spreadsheet.insertSheet('Reservations');
  if (sheet.getLastRow() === 0) { sheet.appendRow(COLUMNS); sheet.setFrozenRows(1); }
  sheet.getRange('A:E').setNumberFormat('@');
  console.log('Setup complete. Your private ADMIN_PIN is in Project Settings > Script Properties.');
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > 4096) throw new Error('Permintaan tidak valid.');
    const body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Permintaan tidak valid.');
    const action = body.action;
    if (!['reserve', 'list', 'checkin', 'stats'].includes(action)) throw new Error('Permintaan tidak valid.');
    if (action !== 'reserve') authenticate_(body.pin);
    if (action === 'reserve') return json_(reserve_(body));
    if (action === 'checkin') return json_(checkin_(body.id));
    const reservations = rows_(sheet_());
    if (action === 'stats') return json_({ ok: true, stats: stats_(reservations) });
    return json_({ ok: true, reservations: reservations.map(publicRow_), stats: stats_(reservations) });
  } catch (error) {
    const allowed = ['Nama belum diisi','Nama minimal 2 karakter','Nama maksimal 60 karakter','Jumlah tamu minimal 1','Jumlah tamu maksimal 5','PIN tidak valid.','Kode tidak ditemukan.','Permintaan tidak valid.','Terlalu banyak percobaan. Coba lagi nanti.'];
    return json_({ ok: false, error: allowed.includes(error.message) ? error.message : 'Gagal mengirim. Periksa koneksi lalu coba lagi.' });
  }
}

function json_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function sheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) throw new Error('Run setup first');
  const sheet = SpreadsheetApp.openById(id).getSheetByName('Reservations');
  if (!sheet || sheet.getRange(1, 1, 1, COLUMNS.length).getValues()[0].join('|') !== COLUMNS.join('|')) throw new Error('Invalid schema');
  return sheet;
}
function rows_(sheet) {
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, COLUMNS.length).getValues().map(function (row, index) {
    const record = { row: index + 2 };
    COLUMNS.forEach(function (key, i) { record[key] = row[i]; });
    // Formula-safe leading apostrophes are not part of the guest name.
    ['name', 'name_key'].forEach(function (key) {
      if (String(record[key]).charAt(0) === "'" && /^[=+\-@']/.test(String(record[key]).slice(1))) record[key] = String(record[key]).slice(1);
    });
    return record;
  });
}
function publicRow_(r) { return { id: r.id, name: r.name, guests: Number(r.guests), checked_in: r.checked_in === true || r.checked_in === 'true', checked_in_at: r.checked_in_at || '' }; }
function stats_(rows) { return { reservations: rows.length, guests: rows.reduce(function (sum, r) { return sum + Number(r.guests); }, 0), checkedIn: rows.filter(function (r) { return r.checked_in === true || r.checked_in === 'true'; }).reduce(function (sum, r) { return sum + Number(r.guests); }, 0) }; }
function authenticate_(pin) {
  const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_PIN');
  if (typeof pin !== 'string' || !expected || pin.length > 128) throw new Error('PIN tidak valid.');
  // A constant-work comparison avoids early character-by-character exits.
  let mismatch = pin.length ^ expected.length;
  for (let i = 0; i < expected.length; i++) mismatch |= (pin.charCodeAt(i) || 0) ^ expected.charCodeAt(i);
  if (mismatch !== 0) throw new Error('PIN tidak valid.');
}
function validate_(body) {
  if (body.website !== undefined && body.website !== '') throw new Error('Permintaan tidak valid.');
  if (typeof body.name !== 'string') throw new Error('Nama belum diisi');
  const name = body.name.trim();
  if (!name) throw new Error('Nama belum diisi');
  if (name.length < 2) throw new Error('Nama minimal 2 karakter');
  if (name.length > 60) throw new Error('Nama maksimal 60 karakter');
  if (/[\u0000-\u001f\u007f]/.test(name)) throw new Error('Permintaan tidak valid.');
  if (typeof body.guests !== 'number' || !Number.isInteger(body.guests) || body.guests < 1) throw new Error('Jumlah tamu minimal 1');
  if (body.guests > MAX_GUESTS) throw new Error('Jumlah tamu maksimal 5');
  return { name: name, name_key: name.toLowerCase().replace(/\s+/g, ' '), guests: body.guests };
}
function reserve_(body) {
  const valid = validate_(body);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = sheet_(), rows = rows_(sheet), now = new Date().toISOString();
    const match = rows.find(function (r) { return r.name_key === valid.name_key; });
    const safeName = /^[=+\-@']/.test(valid.name) ? "'" + valid.name : valid.name;
    const safeKey = /^[=+\-@']/.test(valid.name_key) ? "'" + valid.name_key : valid.name_key;
    if (match) {
      sheet.getRange(match.row, 3, 1, 4).setValues([[now, safeName, safeKey, valid.guests]]);
      SpreadsheetApp.flush();
      return { ok: true, updated: true, reservation: { id: match.id, name: valid.name, guests: valid.guests } };
    }
    let id;
    do {
      const seed = Utilities.getUuid().replace(/-/g, '');
      id = Array.from({ length: 8 }, function (_, i) { return ALPHABET[parseInt(seed.slice(i * 2, i * 2 + 2), 16) % ALPHABET.length]; }).join('');
    } while (rows.some(function (r) { return r.id === id; }));
    sheet.appendRow([id, now, now, safeName, safeKey, valid.guests, false, '']);
    SpreadsheetApp.flush();
    return { ok: true, updated: false, reservation: { id: id, name: valid.name, guests: valid.guests } };
  } finally { lock.releaseLock(); }
}
function checkin_(value) {
  const id = String(value || '').replace(/^DJSL-/, '');
  if (!/^[A-HJ-NP-Z2-9]{8}$/.test(id)) throw new Error('Kode tidak ditemukan.');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = sheet_(), record = rows_(sheet).find(function (r) { return r.id === id; });
    if (!record) throw new Error('Kode tidak ditemukan.');
    if (record.checked_in !== true && record.checked_in !== 'true') {
      record.checked_in = true; record.checked_in_at = new Date().toISOString();
      sheet.getRange(record.row, 7, 1, 2).setValues([[true, record.checked_in_at]]);
      SpreadsheetApp.flush();
    }
    return { ok: true, reservation: publicRow_(record) };
  } finally { lock.releaseLock(); }
}
