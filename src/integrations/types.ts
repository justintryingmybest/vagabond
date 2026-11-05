/**
 * Contracts for third-party integrations. Every paid API starts as a mock that
 * implements one of these interfaces; swapping in the real provider means
 * writing one new implementation and changing src/integrations/index.ts.
 *
 * Real implementations must run server-side (Supabase Edge Function or API
 * route) so partner keys never ship in the app bundle.
 */
import type { Interest, LatLng } from '@/lib/types';

export type PlaceResult = {
  id: string;
  name: string;
  location: LatLng;
  rating?: number;
  reviewCount?: number;
  tags: Interest[];
  summary?: string;
};

export interface PlacesProvider {
  search(query: string, near: LatLng, interests?: Interest[]): Promise<PlaceResult[]>;
}

export type ExcursionResult = {
  id: string;
  title: string;
  location: LatLng;
  priceCents: number;
  currency: string;
  durationMinutes: number;
  rating?: number;
  /** Affiliate deep link for link-out booking. */
  bookingUrl: string;
  provider: string;
};

export interface ExcursionsProvider {
  search(destination: string, interests?: Interest[]): Promise<ExcursionResult[]>;
}

export type FlightOffer = {
  id: string;
  carrier: string;
  from: string;
  to: string;
  departAt: string;
  arriveAt: string;
  stops: number;
  priceCents: number;
  currency: string;
  /** Link-out to the airline or an OTA affiliate. */
  bookingUrl: string;
};

export interface FlightsProvider {
  search(from: string, to: string, date: string): Promise<FlightOffer[]>;
}

export type CardProgram = {
  id: string;
  name: string;
  /** Points per dollar by spend category. */
  earn: Partial<Record<'flights' | 'hotels' | 'dining' | 'travel' | 'other', number>>;
};
