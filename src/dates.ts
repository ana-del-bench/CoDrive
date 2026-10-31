const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export type DateParts = { year: number; month: number; day: number };

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** Builds a YYYY-MM-DD string. `month` is 0-based, like Date. */
export function toIso(year: number, month: number, day: number) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

export function parseIso(iso: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const check = new Date(year, month, day);
  if (check.getFullYear() !== year || check.getMonth() !== month || check.getDate() !== day) return null;
  return { year, month, day };
}

export function todayIso() {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
}

/** "2026-04-04" -> "Apr 04, 2026". Returns '' for anything that is not a date. */
export function formatIso(iso: string) {
  const parts = parseIso(iso);
  if (!parts) return '';
  return `${MONTHS[parts.month]} ${pad2(parts.day)}, ${parts.year}`;
}

export function formatTripDates(startIso: string, endIso: string) {
  return `${formatIso(startIso)} – ${formatIso(endIso)}`;
}

type Side = { month: number | null; day: number; year: number | null };

function parseSide(text: string): Side | null {
  const match = /^(?:([A-Za-z]{3})[A-Za-z]*\.?\s+)?(\d{1,2})(?:,?\s*(\d{4}))?$/.exec(text.trim());
  if (!match) return null;
  const month = match[1] ? MONTHS.findIndex((name) => name.toLowerCase() === match[1].toLowerCase()) : null;
  if (month === -1) return null;
  return { month, day: Number(match[2]), year: match[3] ? Number(match[3]) : null };
}

/**
 * Turns the display text stored on a trip back into ISO dates so the edit form can show them.
 * Handles "Apr 04, 2026 – Apr 07, 2026", "Apr 04 – 07, 2026", "Apr 30 – May 3, 2026" and a
 * single "Oct 31, 2026". Anything else (for example "Dates TBD") gives empty strings.
 */
export function parseTripDates(dates: string): { start: string; end: string } {
  const empty = { start: '', end: '' };
  const [leftText, rightText] = dates.split(/\s*[–—]\s*|\s+-\s+/);
  const left = leftText ? parseSide(leftText) : null;
  if (!left || left.month === null) return empty;
  const right = rightText ? parseSide(rightText) : null;

  const year = left.year ?? right?.year ?? null;
  if (year === null) return empty;

  const start = parseIso(toIso(year, left.month, left.day)) ? toIso(year, left.month, left.day) : '';
  if (!right) return { start, end: '' };

  const endYear = right.year ?? year;
  const endMonth = right.month ?? left.month;
  const end = parseIso(toIso(endYear, endMonth, right.day)) ? toIso(endYear, endMonth, right.day) : '';
  return { start, end };
}
