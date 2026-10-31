/**
 * Keeps only digits and a single decimal point, with at most two decimals.
 * Used for money fields so letters and symbols are dropped as they are typed or pasted.
 */
export function sanitizeDecimal(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const dot = cleaned.indexOf('.');
  if (dot === -1) return cleaned;
  const whole = cleaned.slice(0, dot);
  const fraction = cleaned.slice(dot + 1).replace(/\./g, '').slice(0, 2);
  return `${whole}.${fraction}`;
}
