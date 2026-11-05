/**
 * Turns "areas I want to visit + dates + interests" into proposed itineraries.
 * Pure functions: the Plan screen fetches candidates and weather, this module
 * ranks and arranges them.
 */
import { addDays } from './dates.ts';
import { type Area, distanceKm, inAnyArea } from './geo.ts';
import type { Day, Interest, LatLng, Stop, Trip } from './types.ts';
import { type DayWeather, weatherTips } from './weather-advice.ts';

export type Candidate = {
  id: string;
  title: string;
  location: LatLng;
  tags: Interest[];
  rating?: number;
  kind: Stop['kind'];
  bookingUrl?: string;
  provider?: string;
  priceCents?: number;
};

export type ProposalSource = 'forked' | 'top-rated' | 'excursions';

export type Proposal = {
  id: string;
  source: ProposalSource;
  title: string;
  destination: string;
  blurb: string;
  days: Day[];
  /** Fork count for community trips. */
  forks?: number;
  basedOnTripId?: string;
  weatherAdjusted: boolean;
};

export type ProposalInput = {
  areas: Area[];
  startDate: string;
  dayCount: number;
  interests: Interest[];
  publishedTrips: Trip[];
  forkCounts: Record<string, number>;
  places: Candidate[];
  excursions: Candidate[];
  weather?: DayWeather[];
  /** Phrase like "in your area" for titles. */
  areaLabel: string;
  /** Place name for generated trips, e.g. from a community trip in the area. */
  destination: string;
};

const STOPS_PER_DAY = 3;

export function proposeItineraries(input: ProposalInput): Proposal[] {
  const out: Proposal[] = [];
  const dates = Array.from({ length: input.dayCount }, (_, i) => addDays(input.startDate, i));

  // 1. Community trips that pass through the drawn areas, most forked first.
  const community = input.publishedTrips
    .map((t) => ({
      t,
      hits: t.days.flatMap((d) => d.stops).filter((s) => inAnyArea(s.location, input.areas)).length,
    }))
    .filter((x) => x.hits > 0)
    .sort((a, b) => (input.forkCounts[b.t.id] ?? 0) - (input.forkCounts[a.t.id] ?? 0))
    .slice(0, 3);

  for (const { t } of community) {
    const days = dates.map((date, i) => {
      const src = t.days[i % t.days.length];
      return {
        id: `p-${t.id}-${i}`,
        date,
        title: src.title,
        stops: src.stops.map((s) => cleanStop(s, `${t.id}-${i}`)),
      };
    });
    const forks = input.forkCounts[t.id] ?? 0;
    out.push(
      finish(input, {
        id: `forked-${t.id}`,
        source: 'forked',
        title: t.title,
        destination: t.destination,
        blurb:
          t.days.length < input.dayCount
            ? `${forks} people forked this ${t.days.length}-day trip. Repeated to fill ${input.dayCount} days; edit freely.`
            : `${forks} people forked this trip.`,
        days: days.slice(0, input.dayCount),
        forks,
        basedOnTripId: t.id,
        weatherAdjusted: false,
      }),
    );
  }

  // 2. Highest-rated places that match the traveler's interests.
  const liked = (c: Candidate) =>
    input.interests.length === 0 || c.tags.some((t) => input.interests.includes(t));
  const ranked = [...input.places]
    .sort((a, b) => Number(liked(b)) - Number(liked(a)) || (b.rating ?? 0) - (a.rating ?? 0));
  if (ranked.length > 0) {
    out.push(
      finish(input, {
        id: 'top-rated',
        source: 'top-rated',
        title: `Top-rated ${input.areaLabel}`,
        destination: input.destination,
        blurb: `The highest-rated spots for ${listInterests(input.interests)}, grouped so each day stays in one part of the map.`,
        days: arrange(ranked.slice(0, input.dayCount * STOPS_PER_DAY), dates, 'tr'),
        weatherAdjusted: false,
      }),
    );
  }

  // 3. One bookable excursion per day, filled out with nearby places.
  if (input.excursions.length > 0) {
    const days = dates.map((date, i) => {
      const exc = input.excursions[i % input.excursions.length];
      const nearby = ranked
        .filter((p) => p.id !== exc.id)
        .sort((a, b) => distanceKm(a.location, exc.location) - distanceKm(b.location, exc.location))
        .slice(i * 2, i * 2 + 2);
      return {
        id: `p-exc-${i}`,
        date,
        title: exc.title,
        stops: [exc, ...nearby].map((c, n) => toStop(c, `exc-${i}-${n}`)),
      };
    });
    out.push(
      finish(input, {
        id: 'excursions',
        source: 'excursions',
        title: `A tour a day ${input.areaLabel}`,
        destination: input.destination,
        blurb: 'Built around bookable tours and activities, with nearby stops for the rest of the day.',
        days,
        weatherAdjusted: false,
      }),
    );
  }

  return out;
}

/** Group candidates into days by longitude so each day is geographically tight. */
function arrange(cands: Candidate[], dates: string[], prefix: string): Day[] {
  const sorted = [...cands].sort((a, b) => a.location.lng - b.location.lng);
  const per = Math.max(1, Math.ceil(sorted.length / dates.length));
  return dates.map((date, i) => ({
    id: `p-${prefix}-${i}`,
    date,
    stops: sorted.slice(i * per, i * per + per).map((c, n) => toStop(c, `${prefix}-${i}-${n}`)),
  }));
}

/** Apply weather swaps so outdoor-heavy days land on drier dates. */
function finish(input: ProposalInput, p: Proposal): Proposal {
  if (!input.weather) return p;
  let days = p.days;
  let adjusted = false;
  for (const tip of weatherTips(days, input.weather)) {
    if (tip.kind !== 'swap') continue;
    const a = days.find((d) => d.id === tip.dayId)!;
    const b = days.find((d) => d.id === tip.withDayId)!;
    days = days.map((d) =>
      d.id === a.id ? { ...d, title: b.title, stops: b.stops } : d.id === b.id ? { ...d, title: a.title, stops: a.stops } : d,
    );
    adjusted = true;
  }
  return { ...p, days, weatherAdjusted: adjusted };
}

function toStop(c: Candidate, id: string): Stop {
  return {
    id: `s-${id}`,
    title: c.title,
    kind: c.kind,
    location: c.location,
    tags: c.tags,
    skippedBy: [],
    booking: c.bookingUrl
      ? { status: 'to_book', url: c.bookingUrl, provider: c.provider, priceCents: c.priceCents }
      : { status: 'not_needed' },
  };
}

function cleanStop(s: Stop, suffix: string): Stop {
  return {
    ...s,
    id: `${s.id}-${suffix}`,
    skippedBy: [],
    booking:
      s.booking.status === 'not_needed'
        ? { status: 'not_needed' }
        : { status: 'to_book', url: s.booking.url, provider: s.booking.provider },
  };
}

function listInterests(i: Interest[]): string {
  if (i.length === 0) return 'everything';
  if (i.length === 1) return i[0];
  return `${i.slice(0, -1).join(', ')} and ${i[i.length - 1]}`;
}
