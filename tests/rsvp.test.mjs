import test from 'node:test';
import assert from 'node:assert/strict';
import { createBackend } from './gas-harness.mjs';
import { validResponse, validateRSVP } from '../src/rsvp.js';

test('Declined RSVPs persist, exclude people and reservations from totals, and cannot check in', () => {
  const b = createBackend();
  const response = b.call({ action: 'reserve', name: 'Tamu Berhalangan', attendance: 'declined', guests: 0 });
  assert.equal(response.ok, true);
  assert.equal(validResponse(response.reservation), true);
  const list = b.call({ action: 'list', pin: 'test-only-pin' });
  assert.equal(list.reservations[0].attendance, 'declined');
  assert.equal(list.reservations[0].checked_in, false);
  assert.deepEqual(list.stats, { reservations: 0, guests: 0, checkedIn: 0 });
  assert.equal(b.call({ action: 'checkin', pin: 'test-only-pin', id: response.reservation.id }).error, 'Tamu mengonfirmasi tidak dapat hadir.');
});

test('Changing either RSVP direction retains one record and invalidates the old ticket', () => {
  const b = createBackend();
  const first = b.call({ action: 'reserve', name: 'Ayu Putri', guests: 3 }).reservation;
  const declined = b.call({ action: 'reserve', name: ' ayu  putri ', attendance: 'declined', guests: 0 }).reservation;
  assert.equal(declined.id, first.id);
  assert.equal(b.call({ action: 'checkin', pin: 'test-only-pin', id: first.id }).ok, false);
  const attending = b.call({ action: 'reserve', name: 'Ayu Putri', attendance: 'attending', guests: 2 }).reservation;
  assert.equal(attending.id, first.id);
  assert.equal(attending.attendance, 'attending');
  assert.equal(b.data.length, 2);
  assert.deepEqual(b.call({ action: 'stats', pin: 'test-only-pin' }).stats, { reservations: 1, guests: 2, checkedIn: 0 });
  assert.equal(b.call({ action: 'checkin', pin: 'test-only-pin', id: first.id }).ok, true);
  assert.match(b.call({ action: 'reserve', name: first.name, attendance: 'declined', guests: 0 }).error, /sudah check-in/);
  assert.equal(b.data[1][5], 2);
});

test('Decline still validates names, honeypots, and explicit consistent attendance', () => {
  const b = createBackend();
  for (const payload of [
    { name: '' }, { name: 'A' }, { name: 'N'.repeat(61) }, { name: 'Line\nbreak' },
    { website: 'bot' }, { guests: 1 }, { guests: '0' }, { attendance: 'maybe' }, { attendance: null },
  ]) assert.equal(b.call({ action: 'reserve', name: 'Tamu Uji', guests: 0, attendance: 'declined', ...payload }).ok, false);
  assert.equal(b.data.length, 1);
  assert.equal(validateRSVP('Tamu Uji', 0, 'declined'), '');
  assert.notEqual(validateRSVP('', 0, 'declined'), '');
  assert.notEqual(validateRSVP('Tamu Uji', 0, 'attending'), '');
  assert.notEqual(validateRSVP('Tamu Uji', 1, ''), '');
  assert.equal(validResponse({ id: '123456', name: 'Tamu Lama', guests: 1 }), true);
  assert.equal(validResponse({ id: '123456', name: 'Tamu Uji', guests: 0 }), false);
  assert.equal(validResponse({ id: '123456', name: 'Tamu Uji', guests: 2, attendance: 'declined' }), false);
});
