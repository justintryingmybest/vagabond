/**
 * Sample data for the beta until Supabase is wired up. Names are placeholders.
 */
import type { Stop, Trip, User } from '@/lib/types';

export const CURRENT_USER_ID = 'u-me';

export const users: User[] = [
  { id: 'u-me', name: 'You', handle: 'you', interests: ['culinary', 'outdoors', 'history'], lodging: 'hotel', loyalty: ['hyatt'] },
  { id: 'u-sam', name: 'Sam', handle: 'sam', interests: ['nightlife', 'culinary'], lodging: 'rental', loyalty: [] },
  { id: 'u-alex', name: 'Alex', handle: 'alex', interests: ['museums', 'art'], lodging: 'hotel', loyalty: ['marriott'] },
  { id: 'u-riley', name: 'Riley', handle: 'riley', interests: ['outdoors'], lodging: 'hostel', loyalty: [] },
  { id: 'u-maya', name: 'Maya', handle: 'maya', interests: ['culinary', 'art'], lodging: 'any', loyalty: ['hilton'] },
  { id: 'u-jordan', name: 'Jordan', handle: 'jordan', interests: ['nightlife', 'outdoors'], lodging: 'rental', loyalty: [] },
  { id: 'u-priya', name: 'Priya', handle: 'priya', interests: ['history', 'museums'], lodging: 'hotel', loyalty: ['ihg'] },
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
    country: 'Portugal',
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
    id: 't-lisbon-alex',
    title: '3 days of Lisbon viewpoints and food',
    destination: 'Lisbon, Portugal',
    country: 'Portugal',
    coverEmoji: '🚋',
    startDate: '2026-06-10',
    endDate: '2026-06-12',
    visibility: 'public',
    publishedAt: '2026-06-20',
    authorId: 'u-alex',
    members: [{ userId: 'u-alex', role: 'owner' }],
    days: [
      {
        id: 'la1',
        date: '2026-06-10',
        title: 'Viewpoints and tram 28',
        stops: [
          stop({ id: 'la1a', title: 'Miradouro da Senhora do Monte', kind: 'place', location: { lat: 38.7189, lng: -9.1327 }, startTime: '09:00', tags: ['outdoors'] }),
          stop({ id: 'la1b', title: 'Tram 28 to Estrela', kind: 'transit', location: { lat: 38.7139, lng: -9.1394 }, startTime: '11:00', tags: ['history'] }),
          stop({ id: 'la1c', title: 'Time Out Market', kind: 'food', location: { lat: 38.7069, lng: -9.1459 }, startTime: '13:30', tags: ['culinary'] }),
        ],
      },
      {
        id: 'la2',
        date: '2026-06-11',
        title: 'Belém',
        stops: [
          stop({ id: 'la2a', title: 'Jerónimos Monastery', kind: 'place', location: { lat: 38.6979, lng: -9.2068 }, startTime: '10:00', tags: ['history', 'museums'] }),
          stop({ id: 'la2b', title: 'Belém Tower', kind: 'place', location: { lat: 38.6916, lng: -9.216 }, startTime: '13:00', tags: ['history', 'outdoors'] }),
        ],
      },
      {
        id: 'la3',
        date: '2026-06-12',
        title: 'LX Factory and sunset',
        stops: [
          stop({ id: 'la3a', title: 'LX Factory', kind: 'place', location: { lat: 38.7036, lng: -9.1783 }, startTime: '11:00', tags: ['shopping', 'art'] }),
          stop({ id: 'la3b', title: 'Sunset at Miradouro de Santa Catarina', kind: 'place', location: { lat: 38.7094, lng: -9.1476 }, startTime: '19:30', tags: ['outdoors', 'nightlife'] }),
        ],
      },
    ],
    votes: [],
    expenses: [],
  },
  {
    id: 't-oktoberfest',
    title: 'Oktoberfest weekend in Munich',
    destination: 'Munich, Germany',
    country: 'Germany',
    coverEmoji: '🍺',
    startDate: '2025-09-26',
    endDate: '2025-09-28',
    visibility: 'public',
    publishedAt: '2025-10-02',
    authorId: 'u-jordan',
    event: { name: 'Oktoberfest', kind: 'festival', when: 'Late September to early October' },
    members: [{ userId: 'u-jordan', role: 'owner' }],
    days: [
      {
        id: 'ok1',
        date: '2025-09-26',
        title: 'Old town and beer halls',
        stops: [
          stop({ id: 'ok1a', title: 'Marienplatz', kind: 'place', location: { lat: 48.1374, lng: 11.5755 }, startTime: '11:00', tags: ['history'] }),
          stop({ id: 'ok1b', title: 'Viktualienmarkt lunch', kind: 'food', location: { lat: 48.1351, lng: 11.5762 }, startTime: '13:00', tags: ['culinary'] }),
          stop({ id: 'ok1c', title: 'Hofbräuhaus', kind: 'food', location: { lat: 48.1376, lng: 11.5799 }, startTime: '19:00', tags: ['nightlife', 'culinary'] }),
        ],
      },
      {
        id: 'ok2',
        date: '2025-09-27',
        title: 'Wiesn day',
        stops: [
          stop({ id: 'ok2a', title: 'Theresienwiese, early tent entry', kind: 'place', location: { lat: 48.1316, lng: 11.5498 }, startTime: '09:00', tags: ['nightlife'], notes: 'Tents fill by late morning on weekends. Reserve a table months ahead or arrive at opening.' }),
          stop({ id: 'ok2b', title: 'Bavaria statue viewpoint', kind: 'place', location: { lat: 48.1303, lng: 11.5459 }, startTime: '16:00', tags: ['outdoors'] }),
        ],
      },
      {
        id: 'ok3',
        date: '2025-09-28',
        title: 'Recovery day',
        stops: [
          stop({ id: 'ok3a', title: 'Englischer Garten and Eisbach surfers', kind: 'place', location: { lat: 48.1437, lng: 11.5878 }, startTime: '11:00', tags: ['outdoors', 'relaxation'] }),
          stop({ id: 'ok3b', title: 'Deutsches Museum', kind: 'place', location: { lat: 48.1299, lng: 11.5834 }, startTime: '15:00', tags: ['museums'] }),
        ],
      },
    ],
    votes: [],
    expenses: [],
  },
  {
    id: 't-primavera',
    title: 'Primavera Sound and Barcelona beaches',
    destination: 'Barcelona, Spain',
    country: 'Spain',
    coverEmoji: '🎶',
    startDate: '2026-06-04',
    endDate: '2026-06-07',
    visibility: 'public',
    publishedAt: '2026-06-15',
    authorId: 'u-maya',
    event: { name: 'Primavera Sound', kind: 'music', when: 'Early June' },
    members: [{ userId: 'u-maya', role: 'owner' }],
    days: [
      {
        id: 'pr1',
        date: '2026-06-04',
        title: 'Gothic Quarter and tapas',
        stops: [
          stop({ id: 'pr1a', title: 'Barcelona Cathedral', kind: 'place', location: { lat: 41.384, lng: 2.1762 }, startTime: '11:00', tags: ['history'] }),
          stop({ id: 'pr1b', title: 'La Boqueria market', kind: 'food', location: { lat: 41.3817, lng: 2.1716 }, startTime: '13:30', tags: ['culinary'] }),
        ],
      },
      {
        id: 'pr2',
        date: '2026-06-05',
        title: 'Festival night one',
        stops: [
          stop({ id: 'pr2a', title: 'Barceloneta beach', kind: 'place', location: { lat: 41.3784, lng: 2.1925 }, startTime: '12:00', tags: ['outdoors', 'relaxation'] }),
          stop({ id: 'pr2b', title: 'Parc del Fòrum, festival grounds', kind: 'place', location: { lat: 41.4106, lng: 2.2266 }, startTime: '18:00', tags: ['nightlife'] }),
        ],
      },
      {
        id: 'pr3',
        date: '2026-06-06',
        title: 'Gaudí and festival night two',
        stops: [
          stop({ id: 'pr3a', title: 'Sagrada Família', kind: 'place', location: { lat: 41.4036, lng: 2.1744 }, startTime: '10:00', tags: ['history', 'art'], booking: { status: 'to_book', url: 'https://www.viator.com/', provider: 'Viator (mock)' } }),
          stop({ id: 'pr3b', title: 'Parc del Fòrum, festival grounds', kind: 'place', location: { lat: 41.4106, lng: 2.2266 }, startTime: '19:00', tags: ['nightlife'] }),
        ],
      },
    ],
    votes: [],
    expenses: [],
  },
  {
    id: 't-kyoto',
    title: '5 days of Kyoto temples and food',
    destination: 'Kyoto, Japan',
    country: 'Japan',
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

export const seedForkCounts: Record<string, number> = {
  't-kyoto': 42,
  't-lisbon-alex': 18,
  't-oktoberfest': 35,
  't-primavera': 9,
};

/** Forks in the last 7 days, which drives "Trending". */
export const seedRecentForks: Record<string, number> = {
  't-oktoberfest': 14,
  't-primavera': 6,
  't-lisbon-alex': 4,
  't-kyoto': 1,
};
