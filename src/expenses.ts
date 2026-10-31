import type { Crew, ExpenseType } from './types';

export const EXPENSE_TYPES: { value: ExpenseType; label: string }[] = [
  { value: 'food', label: 'Food' },
  { value: 'housing', label: 'Housing' },
  { value: 'recreation', label: 'Recreation' },
  { value: 'gas', label: 'Gas' },
  { value: 'retail', label: 'Retail' },
  { value: 'necessities', label: 'Necessities' },
  { value: 'other', label: 'Other' },
];

/** The "Paid by" menu for a trip: each crew member, then "All" and "Other". */
export function payerOptions(crew: Crew[]): string[] {
  const names = crew.map((member) => member.name).filter((name) => name !== 'All' && name !== 'Other');
  return [...new Set(names), 'All', 'Other'];
}

/**
 * "All" stands for everyone, so picking it replaces any individual names,
 * and picking a name drops "All".
 */
export function togglePayer(current: string[], name: string): string[] {
  if (name === 'All') return current.includes('All') ? [] : ['All'];
  const withoutAll = current.filter((item) => item !== 'All');
  return withoutAll.includes(name) ? withoutAll.filter((item) => item !== name) : [...withoutAll, name];
}

/** Keeps the menu order so the card always reads the same way. */
export function orderPayers(names: string[], options: string[]) {
  return options.filter((name) => names.includes(name));
}

/** The line under an expense title: "Paid by Ava, Bo · Split 4 ways". */
export function expenseDetails(paidBy: string[], notes: string) {
  const who = `Paid by ${paidBy.join(', ')}`;
  return notes ? `${who} · ${notes}` : who;
}
