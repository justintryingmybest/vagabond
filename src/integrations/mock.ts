/**
 * Offline stand-ins for paid APIs. Data is illustrative, not real inventory.
 */
import type { Interest, LatLng } from '@/lib/types';

import type {
  ExcursionsProvider,
  FlightsProvider,
  PlaceResult,
  PlacesProvider,
} from './types';

const jitter = (base: LatLng, i: number): LatLng => ({
  lat: base.lat + Math.sin(i * 1.7) * 0.02,
  lng: base.lng + Math.cos(i * 1.3) * 0.02,
});

const SAMPLE: { name: string; tags: Interest[] }[] = [
  { name: 'Old Town walking route', tags: ['history', 'outdoors'] },
  { name: 'City art museum', tags: ['museums', 'art'] },
  { name: 'Night market', tags: ['culinary', 'nightlife'] },
  { name: 'Riverside park', tags: ['outdoors', 'relaxation'] },
  { name: 'Cocktail bar', tags: ['nightlife'] },
  { name: 'Local food hall', tags: ['culinary'] },
];

export const mockPlaces: PlacesProvider = {
  async search(query, near, interests) {
    const results: PlaceResult[] = SAMPLE.map((s, i) => ({
      id: `mock-place-${i}`,
      name: query ? `${s.name} (${query})` : s.name,
      location: jitter(near, i),
      rating: 4 + ((i * 3) % 10) / 10,
      reviewCount: 120 + i * 37,
      tags: s.tags,
    }));
    if (!interests?.length) return results;
    return results.filter((r) => r.tags.some((t) => interests.includes(t)));
  },
};

export const mockExcursions: ExcursionsProvider = {
  async search(destination, near) {
    return [
      { title: `${destination} food tour`, mins: 180, price: 8900, tags: ['culinary'] },
      { title: `${destination} day hike`, mins: 360, price: 6500, tags: ['outdoors'] },
      { title: `${destination} history walk`, mins: 120, price: 3500, tags: ['history'] },
      { title: `${destination} sunset boat trip`, mins: 120, price: 5400, tags: ['outdoors', 'nightlife'] },
    ].map((x, i) => ({
      id: `mock-exc-${i}`,
      title: x.title,
      location: jitter(near, i + 7),
      priceCents: x.price,
      currency: 'USD',
      durationMinutes: x.mins,
      rating: 4.6,
      bookingUrl: 'https://www.viator.com/',
      provider: 'Viator (mock)',
      tags: x.tags as Interest[],
    }));
  },
};

export const mockFlights: FlightsProvider = {
  async search(from, to, date) {
    return [0, 1, 2].map((i) => ({
      id: `mock-flight-${i}`,
      carrier: ['Example Air', 'Sample Airways', 'Demo Jet'][i],
      from,
      to,
      departAt: `${date}T0${7 + i * 2}:00`,
      arriveAt: `${date}T1${2 + i * 2}:30`,
      stops: i === 2 ? 1 : 0,
      priceCents: 32900 + i * 4500,
      currency: 'USD',
      bookingUrl: 'https://www.google.com/travel/flights',
    }));
  },
};
