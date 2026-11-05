import assert from 'node:assert/strict';
import { test } from 'node:test';

import { inPolygon } from './geo.ts';
import type { Day, Stop } from './types.ts';
import { weatherTips } from './weather-advice.ts';

const square = [
  { lat: 0, lng: 0 },
  { lat: 0, lng: 10 },
  { lat: 10, lng: 10 },
  { lat: 10, lng: 0 },
];

test('point in polygon', () => {
  assert.equal(inPolygon({ lat: 5, lng: 5 }, square), true);
  assert.equal(inPolygon({ lat: 15, lng: 5 }, square), false);
});

const stop = (id: string, outdoors: boolean): Stop => ({
  id,
  title: id,
  kind: 'place',
  location: { lat: 0, lng: 0 },
  tags: outdoors ? ['outdoors'] : ['museums'],
  booking: { status: 'not_needed' },
  skippedBy: [],
});

test('suggests swapping a rainy outdoor day with a dry indoor day', () => {
  const days: Day[] = [
    { id: 'd1', date: '2027-01-01', stops: [stop('hike', true)] },
    { id: 'd2', date: '2027-01-02', stops: [stop('museum', false)] },
  ];
  const tips = weatherTips(days, [
    { date: '2027-01-01', rainChance: 80, sky: 'rain' },
    { date: '2027-01-02', rainChance: 10, sky: 'clear' },
  ]);
  assert.equal(tips.length, 1);
  assert.equal(tips[0].kind, 'swap');
});

test('falls back to an indoor backup when no day is drier', () => {
  const days: Day[] = [{ id: 'd1', date: '2027-01-01', stops: [stop('hike', true)] }];
  const tips = weatherTips(days, [{ date: '2027-01-01', rainChance: 80, sky: 'rain' }]);
  assert.equal(tips[0].kind, 'indoor');
});

test('no tips for dry days or indoor plans', () => {
  const days: Day[] = [{ id: 'd1', date: '2027-01-01', stops: [stop('museum', false)] }];
  assert.deepEqual(weatherTips(days, [{ date: '2027-01-01', rainChance: 90, sky: 'rain' }]), []);
});

test('proposals: community trip in the area ranks first, rain moves outdoor day', async () => {
  const { proposeItineraries } = await import('./propose.ts');
  const area = { id: 'a', name: 'A', points: square };
  const published = {
    id: 't1',
    title: 'Square trip',
    destination: 'Square',
    coverEmoji: 'x',
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    visibility: 'public' as const,
    publishedAt: '2026-01-05',
    authorId: 'u',
    members: [],
    votes: [],
    expenses: [],
    days: [
      { id: 'x1', date: '2026-01-01', stops: [{ ...stop('hike', true), location: { lat: 5, lng: 5 } }] },
      { id: 'x2', date: '2026-01-02', stops: [{ ...stop('museum', false), location: { lat: 5, lng: 6 } }] },
    ],
  };
  const props = proposeItineraries({
    areas: [area],
    startDate: '2027-03-01',
    dayCount: 2,
    interests: ['outdoors'],
    publishedTrips: [published],
    forkCounts: { t1: 9 },
    places: [],
    excursions: [],
    weather: [
      { date: '2027-03-01', rainChance: 90, sky: 'rain' },
      { date: '2027-03-02', rainChance: 5, sky: 'clear' },
    ],
    areaLabel: 'in Square',
    destination: 'Square',
  });
  assert.equal(props[0].source, 'forked');
  assert.equal(props[0].forks, 9);
  assert.equal(props[0].weatherAdjusted, true);
  assert.equal(props[0].days[1].stops[0].title, 'hike');
});
