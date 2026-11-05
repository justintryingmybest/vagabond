import type { Expense, Trip } from './types.ts';

export type Balance = { userId: string; netCents: number };
export type Settlement = { fromId: string; toId: string; amountCents: number };

/**
 * Turns booked stops that have a payer and price into expenses, shared by
 * every trip member who did not skip that stop.
 */
export function expensesFromBookings(trip: Trip): Expense[] {
  const memberIds = trip.members.map((m) => m.userId);
  const out: Expense[] = [];
  for (const day of trip.days) {
    for (const stop of day.stops) {
      const b = stop.booking;
      if (b.status !== 'booked' || !b.paidById || !b.priceCents) continue;
      out.push({
        id: `booking-${stop.id}`,
        description: stop.title,
        amountCents: b.priceCents,
        currency: b.currency ?? 'USD',
        paidById: b.paidById,
        sharedByIds: memberIds.filter((id) => !stop.skippedBy.includes(id)),
        stopId: stop.id,
      });
    }
  }
  return out;
}

/**
 * Net balance per member: positive means they are owed money.
 * Remainder cents from uneven splits go to the first sharers, so totals
 * always reconcile to zero.
 */
export function balances(memberIds: string[], expenses: Expense[]): Balance[] {
  const net = new Map(memberIds.map((id) => [id, 0]));
  for (const e of expenses) {
    if (e.sharedByIds.length === 0) continue;
    net.set(e.paidById, (net.get(e.paidById) ?? 0) + e.amountCents);
    const base = Math.floor(e.amountCents / e.sharedByIds.length);
    let remainder = e.amountCents - base * e.sharedByIds.length;
    for (const id of e.sharedByIds) {
      const share = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      net.set(id, (net.get(id) ?? 0) - share);
    }
  }
  return [...net].map(([userId, netCents]) => ({ userId, netCents }));
}

/** Greedy settle-up: fewest practical transfers from debtors to creditors. */
export function settleUp(list: Balance[]): Settlement[] {
  const debtors = list.filter((b) => b.netCents < 0).map((b) => ({ ...b }));
  const creditors = list.filter((b) => b.netCents > 0).map((b) => ({ ...b }));
  debtors.sort((a, b) => a.netCents - b.netCents);
  creditors.sort((a, b) => b.netCents - a.netCents);
  const out: Settlement[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(-debtors[i].netCents, creditors[j].netCents);
    out.push({ fromId: debtors[i].userId, toId: creditors[j].userId, amountCents: amount });
    debtors[i].netCents += amount;
    creditors[j].netCents -= amount;
    if (debtors[i].netCents === 0) i++;
    if (creditors[j].netCents === 0) j++;
  }
  return out;
}

export function formatMoney(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}
