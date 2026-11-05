/**
 * Passport stamps, badges, points, and rankings. Pure functions so the same
 * rules can run server-side later (rankings must not trust the client).
 */
import { distanceKm } from './geo.ts';
import type { Trip } from './types.ts';

export type Continent =
  | 'Africa'
  | 'Antarctica'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'Oceania'
  | 'South America';

export const CONTINENT_COUNT = 7;

export function kmToMi(km: number): number {
  return Math.round(km * 0.621371);
}

/** Countries we know about, with continent and flag. Extend as needed. */
export const COUNTRIES: Record<string, { continent: Continent; flag: string }> = {
  Argentina: { continent: 'South America', flag: '🇦🇷' },
  Australia: { continent: 'Oceania', flag: '🇦🇺' },
  Brazil: { continent: 'South America', flag: '🇧🇷' },
  Canada: { continent: 'North America', flag: '🇨🇦' },
  Chile: { continent: 'South America', flag: '🇨🇱' },
  Colombia: { continent: 'South America', flag: '🇨🇴' },
  'Costa Rica': { continent: 'North America', flag: '🇨🇷' },
  Croatia: { continent: 'Europe', flag: '🇭🇷' },
  Egypt: { continent: 'Africa', flag: '🇪🇬' },
  France: { continent: 'Europe', flag: '🇫🇷' },
  Germany: { continent: 'Europe', flag: '🇩🇪' },
  Greece: { continent: 'Europe', flag: '🇬🇷' },
  Iceland: { continent: 'Europe', flag: '🇮🇸' },
  India: { continent: 'Asia', flag: '🇮🇳' },
  Indonesia: { continent: 'Asia', flag: '🇮🇩' },
  Ireland: { continent: 'Europe', flag: '🇮🇪' },
  Italy: { continent: 'Europe', flag: '🇮🇹' },
  Japan: { continent: 'Asia', flag: '🇯🇵' },
  Kenya: { continent: 'Africa', flag: '🇰🇪' },
  Mexico: { continent: 'North America', flag: '🇲🇽' },
  Morocco: { continent: 'Africa', flag: '🇲🇦' },
  Netherlands: { continent: 'Europe', flag: '🇳🇱' },
  'New Zealand': { continent: 'Oceania', flag: '🇳🇿' },
  Peru: { continent: 'South America', flag: '🇵🇪' },
  Portugal: { continent: 'Europe', flag: '🇵🇹' },
  'South Africa': { continent: 'Africa', flag: '🇿🇦' },
  'South Korea': { continent: 'Asia', flag: '🇰🇷' },
  Spain: { continent: 'Europe', flag: '🇪🇸' },
  Switzerland: { continent: 'Europe', flag: '🇨🇭' },
  Thailand: { continent: 'Asia', flag: '🇹🇭' },
  'United Kingdom': { continent: 'Europe', flag: '🇬🇧' },
  'United States': { continent: 'North America', flag: '🇺🇸' },
  Vietnam: { continent: 'Asia', flag: '🇻🇳' },
};

/** One completed trip, reduced to what the passport needs. */
export type Stamp = { country: string; year: number; km: number; tripId?: string };

export type PassportStats = {
  countries: string[];
  continents: Continent[];
  km: number;
  trips: number;
  forksReceived: number;
  publishedTrips: number;
  largestGroup: number;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** 0..1 progress toward earning it. */
  progress: number;
  earned: boolean;
  /** e.g. "3 / 5 countries" */
  progressLabel: string;
};

/** Distance covered between consecutive stops of a trip, in km. */
export function tripKm(trip: Trip): number {
  const stops = trip.days.flatMap((d) => d.stops);
  let km = 0;
  for (let i = 1; i < stops.length; i++) km += distanceKm(stops[i - 1].location, stops[i].location);
  return km;
}

export function stampFromTrip(trip: Trip): Stamp {
  return {
    country: trip.country,
    year: Number(trip.endDate.slice(0, 4)),
    km: Math.round(tripKm(trip)),
    tripId: trip.id,
  };
}

export function passportStats(
  stamps: Stamp[],
  extra: Pick<PassportStats, 'forksReceived' | 'publishedTrips' | 'largestGroup'>,
): PassportStats {
  const countries = [...new Set(stamps.map((s) => s.country))];
  const continents = [
    ...new Set(countries.map((c) => COUNTRIES[c]?.continent).filter(Boolean)),
  ] as Continent[];
  return {
    countries,
    continents,
    km: stamps.reduce((s, x) => s + x.km, 0),
    trips: stamps.length,
    ...extra,
  };
}

/** Points that drive rankings. Weighted so breadth beats repeat trips. */
export function points(s: PassportStats): number {
  return (
    s.countries.length * 100 +
    s.continents.length * 250 +
    Math.floor(s.km / 100) * 5 +
    s.forksReceived * 20 +
    s.publishedTrips * 50
  );
}

type Rule = {
  id: string;
  name: string;
  icon: string;
  description: string;
  value: (s: PassportStats) => number;
  goal: number;
  unit: string;
};

const EARTH_KM = 40075;

const RULES: Rule[] = [
  { id: 'first-stamp', name: 'First stamp', icon: '🛂', description: 'Visit your first country', value: (s) => s.countries.length, goal: 1, unit: 'country' },
  { id: 'five-countries', name: 'Explorer', icon: '🧭', description: 'Visit 5 countries', value: (s) => s.countries.length, goal: 5, unit: 'countries' },
  { id: 'ten-countries', name: 'Globetrotter', icon: '🌍', description: 'Visit 10 countries', value: (s) => s.countries.length, goal: 10, unit: 'countries' },
  { id: 'twenty-five-countries', name: 'Vagabond', icon: '🎒', description: 'Visit 25 countries', value: (s) => s.countries.length, goal: 25, unit: 'countries' },
  { id: 'two-continents', name: 'Continental', icon: '✈️', description: 'Visit 2 continents', value: (s) => s.continents.length, goal: 2, unit: 'continents' },
  { id: 'four-continents', name: 'Four corners', icon: '🗺️', description: 'Visit 4 continents', value: (s) => s.continents.length, goal: 4, unit: 'continents' },
  { id: 'all-continents', name: 'All seven', icon: '🐧', description: 'Visit every continent, Antarctica included', value: (s) => s.continents.length, goal: CONTINENT_COUNT, unit: 'continents' },
  { id: 'thousand-miles', name: '1,000 miles', icon: '🥾', description: 'Cover 1,000 miles between stops', value: (s) => kmToMi(s.km), goal: 1000, unit: 'miles' },
  { id: 'around-the-world', name: 'Around the world', icon: '🌐', description: `Cover ${kmToMi(EARTH_KM).toLocaleString('en-US')} miles, once around the equator`, value: (s) => kmToMi(s.km), goal: kmToMi(EARTH_KM), unit: 'miles' },
  { id: 'trailblazer', name: 'Trailblazer', icon: '🔱', description: 'Have your trips forked 10 times', value: (s) => s.forksReceived, goal: 10, unit: 'forks' },
  { id: 'storyteller', name: 'Storyteller', icon: '📸', description: 'Publish 3 trips', value: (s) => s.publishedTrips, goal: 3, unit: 'trips' },
  { id: 'crew', name: 'Crew', icon: '👯', description: 'Take a trip with 4 or more people', value: (s) => s.largestGroup, goal: 4, unit: 'travelers' },
];

export function badges(s: PassportStats): Badge[] {
  return RULES.map((r) => {
    const v = r.value(s);
    return {
      id: r.id,
      name: r.name,
      icon: r.icon,
      description: r.description,
      progress: Math.min(1, v / r.goal),
      earned: v >= r.goal,
      progressLabel: `${Math.min(v, r.goal).toLocaleString('en-US')} / ${r.goal.toLocaleString('en-US')} ${r.unit}`,
    };
  });
}

export type RankRow = { userId: string; points: number; rank: number };

/** Standard competition ranking: ties share a rank (1, 2, 2, 4). */
export function rank(entries: { userId: string; points: number }[]): RankRow[] {
  const sorted = [...entries].sort(
    (a, b) => b.points - a.points || a.userId.localeCompare(b.userId),
  );
  let current = 0;
  return sorted.map((e, i) => {
    if (i === 0 || sorted[i - 1].points !== e.points) current = i + 1;
    return { ...e, rank: current };
  });
}
