import assert from 'node:assert/strict';
import { test } from 'node:test';

import { balances, settleUp } from './costs.ts';
import type { Expense } from './types.ts';

const exp = (paidById: string, amountCents: number, sharedByIds: string[]): Expense => ({
  id: `${paidById}-${amountCents}`,
  description: 'x',
  amountCents,
  currency: 'USD',
  paidById,
  sharedByIds,
});

test('only members who went share a cost', () => {
  // Museum: Ana paid $40 for herself and Ben; Cy skipped it.
  const b = balances(['ana', 'ben', 'cy'], [exp('ana', 4000, ['ana', 'ben'])]);
  assert.deepEqual(b, [
    { userId: 'ana', netCents: 2000 },
    { userId: 'ben', netCents: -2000 },
    { userId: 'cy', netCents: 0 },
  ]);
});

test('uneven splits reconcile to zero', () => {
  const b = balances(['a', 'b', 'c'], [exp('a', 1000, ['a', 'b', 'c'])]);
  assert.equal(b.reduce((s, x) => s + x.netCents, 0), 0);
});

test('settle up pays creditors in full', () => {
  const b = balances(
    ['a', 'b', 'c'],
    [exp('a', 9000, ['a', 'b', 'c']), exp('b', 3000, ['a', 'b', 'c'])],
  );
  const s = settleUp(b);
  // Net: a +5000, b -1000, c -4000
  assert.deepEqual(s, [
    { fromId: 'c', toId: 'a', amountCents: 4000 },
    { fromId: 'b', toId: 'a', amountCents: 1000 },
  ]);
});
