import assert from 'node:assert/strict';
import { test } from 'node:test';

import { rankLodging, type LodgingOption } from './lodging.ts';
import { badges, passportStats, points, rank } from './passport.ts';

const extra = { forksReceived: 0, publishedTrips: 0, largestGroup: 1 };

test('passport counts unique countries and continents', () => {
  const s = passportStats(
    [
      { country: 'Portugal', year: 2025, km: 100 },
      { country: 'Portugal', year: 2026, km: 50 },
      { country: 'Japan', year: 2026, km: 200 },
    ],
    extra,
  );
  assert.deepEqual(s.countries, ['Portugal', 'Japan']);
  assert.deepEqual(s.continents, ['Europe', 'Asia']);
  assert.equal(s.km, 350);
  const b = badges(s);
  assert.equal(b.find((x) => x.id === 'first-stamp')!.earned, true);
  assert.equal(b.find((x) => x.id === 'two-continents')!.earned, true);
  assert.equal(b.find((x) => x.id === 'five-countries')!.progressLabel, '2 / 5 countries');
  assert.equal(points(s), 2 * 100 + 2 * 250 + 3 * 5);
});

test('ranking shares ranks on ties', () => {
  const r = rank([
    { userId: 'a', points: 10 },
    { userId: 'b', points: 30 },
    { userId: 'c', points: 10 },
    { userId: 'd', points: 5 },
  ]);
  assert.deepEqual(r.map((x) => [x.userId, x.rank]), [['b', 1], ['a', 2], ['c', 2], ['d', 4]]);
});

test('lodging: preferred type, then member programs, then rating', () => {
  const o = (id: string, type: LodgingOption['type'], rating: number, program?: 'hyatt'): LodgingOption => ({
    id, name: id, type, rating, program, location: { lat: 0, lng: 0 }, nightlyCents: 1, bookingUrl: '', provider: '',
  });
  const ranked = rankLodging([o('rental', 'rental', 4.9), o('hilton', 'hotel', 4.8), o('hyatt', 'hotel', 4.2, 'hyatt')], 'hotel', ['hyatt']);
  assert.deepEqual(ranked.map((x) => x.id), ['hyatt', 'hilton', 'rental']);
  assert.match(ranked[0].reason, /World of Hyatt/);
});
