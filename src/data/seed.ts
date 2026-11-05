/**
 * Sample data for the beta until Supabase is wired up. Names are placeholders.
 */
import type { Stop, Trip, User } from '@/lib/types';

export const CURRENT_USER_ID = 'u-me';

export const users: User[] = [
  { id: 'u-me', name: 'You', handle: 'you', interests: ['culinary', 'outdoors', 'history'] },
  { id: 'u-sam', name: 'Sam', handle: 'sam', interests: ['nightlife', 'culinary'] },
  { id: 'u-alex', name: 'Alex', handle: 'alex', interests: ['museums', 'art'] },
  { id: 'u-riley', name: 'Riley', handle: 'riley', interests: ['outdoors'] },
];

const stop = (s: Partial<Stop> & Pick<Stop, 'id' | 'title' | 'kind' | 'location'>): Stop => ({
  tags: [],
  booking: { status: 'not_needed' },
  skippedBy: [],
  ...s,
});

export const seedTrips: Trip[] = [
  {
    id: 't-lisbon',
    title: 'Lisbon long weekend',
    destination: 'Lisbon, Portugal',
    coverEmoji: '🇵🇹',
    startDate: '2027-04-15',
    endDate: '2027-04-18',
    visibility: 'members',
    authorId: 'u-me',
    members: [
      { userId: 'u-me', role: 'owner' },
      { userId: 'u-sam', role: 'editor' },
      { userId: 'u-alex', role: 'editor' },
    ],
    days: [
      {
        id: 'd1',
        date: '2027-04-15',
        title: 'Arrive and Alfama',
        stops: [
          stop({
            id: 's1',
            title: 'Flight to LIS',
            kind: 'flight',
            location: { lat: 38.7742, lng: -9.1342 },
            startTime: '08:10',
            booking: {
              status: 'booked',
              ownerId: 'u-me',
              provider: 'TAP (link-out)',
              confirmationCode: 'K7Q2ZP',
            },
          }),
          stop({
            id: 's2',
            title: 'Castelo de São Jorge',
            kind: 'place',
            location: { lat: 38.7139, lng: -9.1334 },
            startTime: '14:00',
            tags: ['history'],
            booking: { status: 'to_book', ownerId: 'u-alex', priceCents: 1500 },
          }),
          stop({
            id: 's3',
            title: 'Dinner in Alfama',
            kind: 'food',
            location: { lat: 38.7118, lng: -9.1300 },
            startTime: '20:00',
            tags: ['culinary'],
          }),
        ],
      },
      {
        id: 'd2',
        date: '2027-04-16',
        title: 'Belém and Bairro Alto',
        stops: [
          stop({
            id: 's4',
            title: 'MAAT museum',
            kind: 'place',
            location: { lat: 38.6957, lng: -9.1937 },
            startTime: '10:00',
            tags: ['museums', 'art'],
            skippedBy: ['u-sam'],
            booking: {
              status: 'booked',
              ownerId: 'u-alex',
              paidById: 'u-alex',
              priceCents: 2200,
              confirmationCode: 'MAAT-55',
            },
          }),
          stop({
            id: 's5',
            title: 'Pastéis de Belém',
            kind: 'food',
            location: { lat: 38.6975, lng: -9.2032 },
            startTime: '12:30',
            tags: ['culinary'],
          }),
          stop({
            id: 's6',
            title: 'Sintra day tour',
            kind: 'excursion',
            location: { lat: 38.7876, lng: -9.3906 },
            startTime: '15:00',
            tags: ['outdoors', 'history'],
            booking: {
              status: 'booked',
              ownerId: 'u-sam',
              provider: 'Viator (mock)',
              url: 'https://www.viator.com/',
              paidById: 'u-sam',
              priceCents: 26700,
            },
          }),
          stop({
            id: 's7',
            title: 'Bairro Alto bars',
            kind: 'place',
            location: { lat: 38.7136, lng: -9.1449 },
            startTime: '22:00',
            tags: ['nightlife'],
          }),
        ],
      },
    ],
    votes: [
      {
        id: 'v1',
        question: 'Saturday morning?',
        dayId: 'd2',
        createdById: 'u-sam',
        closed: false,
        options: [
          { id: 'o1', label: 'Surf lesson in Cascais', voterIds: ['u-sam'] },
          { id: 'o2', label: 'LX Factory market', voterIds: ['u-alex'] },
        ],
      },
    ],
    expenses: [
      {
        id: 'e1',
        description: 'Airbnb, 3 nights',
        amountCents: 54000,
        currency: 'USD',
        paidById: 'u-me',
        sharedByIds: ['u-me', 'u-sam', 'u-alex'],
      },
    ],
  },
  {
    id: 't-kyoto',
    title: '5 days of Kyoto temples and food',
    destination: 'Kyoto, Japan',
    coverEmoji: '⛩️',
    startDate: '2026-03-02',
    endDate: '2026-03-06',
    visibility: 'public',
    publishedAt: '2026-03-12',
    authorId: 'u-riley',
    members: [{ userId: 'u-riley', role: 'owner' }],
    days: [
      {
        id: 'k1',
        date: '2026-03-02',
        title: 'Higashiyama',
        stops: [
          stop({
            id: 'k1a',
            title: 'Kiyomizu-dera at opening',
            kind: 'place',
            location: { lat: 34.9949, lng: 135.785 },
            startTime: '06:30',
            tags: ['history'],
            notes: 'Go at opening; it is packed by 10.',
          }),
          stop({
            id: 'k1b',
            title: 'Nishiki Market',
            kind: 'food',
            location: { lat: 35.005, lng: 135.7649 },
            startTime: '12:00',
            tags: ['culinary'],
          }),
          stop({
            id: 'k1c',
            title: 'Gion evening walk',
            kind: 'place',
            location: { lat: 35.0037, lng: 135.7788 },
            startTime: '18:30',
            tags: ['history', 'nightlife'],
          }),
        ],
      },
      {
        id: 'k2',
        date: '2026-03-03',
        title: 'Arashiyama',
        stops: [
          stop({
            id: 'k2a',
            title: 'Bamboo grove',
            kind: 'place',
            location: { lat: 35.017, lng: 135.6713 },
            startTime: '07:00',
            tags: ['outdoors'],
          }),
          stop({
            id: 'k2b',
            title: 'Fushimi Inari hike',
            kind: 'place',
            location: { lat: 34.9671, lng: 135.7727 },
            startTime: '15:00',
            tags: ['outdoors', 'history'],
          }),
        ],
      },
    ],
    votes: [],
    expenses: [],
  },
];

export const seedForkCounts: Record<string, number> = { 't-kyoto': 42 };
