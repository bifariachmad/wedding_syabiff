// Bound Google Sheets web app. Run setup() once before deploying.
const MAX_GUESTS = 5;
const COLUMNS = ['id', 'created_at', 'updated_at', 'name', 'name_key', 'guests', 'checked_in', 'checked_in_at'];
const SHEET_ID = '18MMsdmA47e9p3nhbQrhV-P4b8W9F4njlfvXiZEj6jsE';
const HEADERS = ['Kode Reservasi','Dibuat pada','Diperbarui pada','Nama Tamu','Nama Normalisasi','Jumlah Tamu','Sudah Hadir','Waktu Kehadiran'];
const ID_PATTERN = /^(?:[1-9][0-9]{5}|[A-HJ-NP-Z2-9]{8})$/;

function setup() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  if (!spreadsheet) throw new Error('Open this script from Extensions > Apps Script in your Sheet.');
  props.setProperty('SHEET_ID', spreadsheet.getId());
  if (!props.getProperty('ADMIN_PIN')) props.setProperty('ADMIN_PIN', Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase());
  if (!props.getProperty('KIOSK_PIN')) props.setProperty('KIOSK_PIN',props.getProperty('ADMIN_PIN'));
  const sheet = spreadsheet.getSheetByName('Reservations') || spreadsheet.insertSheet('Reservations');
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  const header = sheet.getRange(1, 1, 1, 8).getValues()[0].join('|');
  if (![COLUMNS.join('|'), HEADERS.join('|')].includes(header)) throw new Error('Unexpected headers; no existing data was changed.');
  sheet.getRange(1, 1, 1, 8).setValues([HEADERS]).setBackground('#ebebeb').setFontWeight('bold').setWrap(true);
  sheet.setFrozenRows(1);sheet.setRowHeight(1, 42);
  [180,215,215,280,240,130,130,215].forEach(function(width,i){sheet.setColumnWidth(i+1,width);});
  sheet.hideColumns(5);
  spreadsheet.setSpreadsheetTimeZone('Asia/Jakarta');
  if (!sheet.getFilter()) sheet.getRange(1,1,sheet.getMaxRows(),8).createFilter();
  // Zero means an explicit declined RSVP; positive counts mean attending.
  sheet.getRange('F2:F').setNumberFormat('0').setDataValidation(SpreadsheetApp.newDataValidation().requireNumberBetween(0,5).setAllowInvalid(false).build());
  sheet.getRange('F1').setNote('0 = tidak dapat hadir; 1–5 = jumlah tamu yang akan hadir.');
  sheet.getRange('G2:G').setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build());
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
    if (!['reserve', 'list', 'checkin', 'stats', 'publicSettings', 'settings', 'saveSettings', 'changePin'].includes(action)) throw new Error('Permintaan tidak valid.');
    if (action === 'publicSettings') return json_({ok:true,rsvpOpen:PropertiesService.getScriptProperties().getProperty('RSVP_OPEN') !== 'false'});
    if (action !== 'reserve') {
      if(body.service==='kiosk' && ['list','checkin','stats'].includes(action)) authenticate_(body.pin,'KIOSK_PIN');
      else authenticate_(body.pin);
    }
    if (action === 'settings') return json_({ok:true,rsvpOpen:PropertiesService.getScriptProperties().getProperty('RSVP_OPEN') !== 'false'});
    if (action === 'saveSettings' || action === 'changePin') return json_(updateSettings_(body));
    if (action === 'reserve') return json_(reserve_(body));
    if (action === 'checkin') return json_(checkin_(body.id));
    const reservations = rows_(sheet_());
    if (action === 'stats') return json_({ ok: true, stats: stats_(reservations) });
    return json_({ ok: true, reservations: reservations.map(publicRow_), stats: stats_(reservations) });
  } catch (error) {
    const allowed = ['Nama belum diisi','Nama minimal 2 karakter','Nama maksimal 60 karakter','Jumlah tamu minimal 1','Jumlah tamu maksimal 5','PIN tidak valid.','PIN baru harus 8–128 karakter tanpa spasi di awal atau akhir.','Konfirmasi kehadiran sudah ditutup. Hubungi panitia untuk perubahan.','Kode tidak ditemukan.','Tamu mengonfirmasi tidak dapat hadir.','Tamu sudah check-in. Hubungi panitia untuk mengubah kehadiran.','Permintaan tidak valid.','Terlalu banyak percobaan. Coba lagi nanti.'];
    return json_({ ok: false, error: allowed.includes(error.message) ? error.message : 'Gagal mengirim. Periksa koneksi lalu coba lagi.' });
  }
}

function json_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function sheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) throw new Error('Run setup first');
  const sheet = SpreadsheetApp.openById(id).getSheetByName('Reservations');
  if (!sheet || ![COLUMNS.join('|'), HEADERS.join('|')].includes(sheet.getRange(1, 1, 1, COLUMNS.length).getValues()[0].join('|'))) throw new Error('Invalid schema');
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
  }).filter(function(record){return ID_PATTERN.test(String(record.id));});
}
function publicRow_(r) { return { id: r.id, name: r.name, guests: Number(r.guests), attendance: Number(r.guests) === 0 ? 'declined' : 'attending', checked_in: r.checked_in === true || r.checked_in === 'true', checked_in_at: r.checked_in_at || '' }; }
function stats_(rows) { return { reservations: rows.filter(function (r) { return Number(r.guests) > 0; }).length, guests: rows.reduce(function (sum, r) { return sum + Number(r.guests); }, 0), checkedIn: rows.filter(function (r) { return r.checked_in === true || r.checked_in === 'true'; }).reduce(function (sum, r) { return sum + Number(r.guests); }, 0) }; }
function authenticate_(pin,property) {
  const expected = PropertiesService.getScriptProperties().getProperty(property||'ADMIN_PIN');
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
  if (body.attendance !== undefined && !['attending', 'declined'].includes(body.attendance)) throw new Error('Permintaan tidak valid.');
  if (body.attendance === 'declined') {
    if (body.guests !== 0) throw new Error('Permintaan tidak valid.');
    return { name: name, name_key: name.toLowerCase().replace(/\s+/g, ' '), guests: 0, attendance: 'declined' };
  }
  if (typeof body.guests !== 'number' || !Number.isInteger(body.guests) || body.guests < 1) throw new Error('Jumlah tamu minimal 1');
  if (body.guests > MAX_GUESTS) throw new Error('Jumlah tamu maksimal 5');
  return { name: name, name_key: name.toLowerCase().replace(/\s+/g, ' '), guests: body.guests, attendance: 'attending' };
}
function reserve_(body) {
  const valid = validate_(body);
  if (PropertiesService.getScriptProperties().getProperty('RSVP_OPEN') === 'false') {
    try { authenticate_(body.pin); } catch (_) { throw new Error('Konfirmasi kehadiran sudah ditutup. Hubungi panitia untuk perubahan.'); }
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = sheet_(), rows = rows_(sheet), now = new Date().toISOString();
    const match = rows.find(function (r) { return r.name_key === valid.name_key; });
    const safeName = /^[=+\-@']/.test(valid.name) ? "'" + valid.name : valid.name;
    const safeKey = /^[=+\-@']/.test(valid.name_key) ? "'" + valid.name_key : valid.name_key;
    if (match) {
      if (valid.guests === 0 && (match.checked_in === true || match.checked_in === 'true')) throw new Error('Tamu sudah check-in. Hubungi panitia untuk mengubah kehadiran.');
      sheet.getRange(match.row, 3, 1, 4).setValues([[now, safeName, safeKey, valid.guests]]);
      SpreadsheetApp.flush();
      return { ok: true, updated: true, reservation: { id: match.id, name: valid.name, guests: valid.guests, attendance: valid.attendance } };
    }
    let id;
    do {
      const seed = Utilities.getUuid().replace(/-/g, '');
      id = String(100000 + parseInt(seed.slice(0, 12), 16) % 900000);
    } while (rows.some(function (r) { return r.id === id; }));
    const nextRow = rows.reduce(function(last,r){return Math.max(last,r.row);},1)+1;
    if (nextRow > sheet.getMaxRows()) sheet.insertRowAfter(sheet.getMaxRows());
    sheet.getRange(nextRow,1,1,8).setValues([[id, now, now, safeName, safeKey, valid.guests, false, '']]);
    SpreadsheetApp.flush();
    return { ok: true, updated: false, reservation: { id: id, name: valid.name, guests: valid.guests, attendance: valid.attendance } };
  } finally { lock.releaseLock(); }
}

function updateSettings_(body) {
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    // Authenticate again inside the lock so two simultaneous PIN changes cannot overwrite each other.
    authenticate_(body.pin);
    const props=PropertiesService.getScriptProperties();
    if(body.action==='changePin') {
      if(typeof body.newPin!=='string'||body.newPin.length<8||body.newPin.length>128||body.newPin.trim()!==body.newPin||/[\u0000-\u001f\u007f]/.test(body.newPin)) throw new Error('PIN baru harus 8–128 karakter tanpa spasi di awal atau akhir.');
      if(!props.getProperty('KIOSK_PIN'))props.setProperty('KIOSK_PIN',props.getProperty('ADMIN_PIN'));
      props.setProperty('ADMIN_PIN',body.newPin);
      return {ok:true};
    }
    if(typeof body.rsvpOpen!=='boolean')throw new Error('Permintaan tidak valid.');
    props.setProperty('RSVP_OPEN',String(body.rsvpOpen));
    return {ok:true,rsvpOpen:body.rsvpOpen};
  } finally {lock.releaseLock();}
}
function checkin_(value) {
  const id = String(value || '').trim().toUpperCase().replace(/^DJSL-/, '').replace(/[ -]/g, '');
  if (!ID_PATTERN.test(id)) throw new Error('Kode tidak ditemukan.');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = sheet_(), record = rows_(sheet).find(function (r) { return r.id === id; });
    if (!record) throw new Error('Kode tidak ditemukan.');
    if (Number(record.guests) === 0) throw new Error('Tamu mengonfirmasi tidak dapat hadir.');
    if (record.checked_in !== true && record.checked_in !== 'true') {
      record.checked_in = true; record.checked_in_at = new Date().toISOString();
      sheet.getRange(record.row, 7, 1, 2).setValues([[true, record.checked_in_at]]);
      SpreadsheetApp.flush();
    }
    return { ok: true, reservation: publicRow_(record) };
  } finally { lock.releaseLock(); }
}
