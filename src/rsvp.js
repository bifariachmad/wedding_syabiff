import { CONFIG } from './config.js';
import { ID_PATTERN, validate } from './api.js';

export const attendanceOf = response => response?.attendance || 'attending';

export function validateRSVP(name, guests, attendance) {
  if (!['attending', 'declined'].includes(attendance)) return 'Pilih konfirmasi kehadiran';
  return validate(name, attendance === 'declined' ? 1 : guests);
}

export function validResponse(value) {
  return Boolean(value && ID_PATTERN.test(value.id) && typeof value.name === 'string'
    && value.name.trim().length >= 2 && value.name.length <= 60
    && (attendanceOf(value) === 'declined' ? value.guests === 0
      : attendanceOf(value) === 'attending' && Number.isInteger(value.guests)
        && value.guests >= 1 && value.guests <= CONFIG.MAX_GUESTS));
}
