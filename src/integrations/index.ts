/**
 * Active integration providers. Everything is mocked until the paid APIs are
 * priced out (see the plan doc). Swap one line per provider when going live.
 */
import { mockExcursions, mockFlights, mockLodging, mockPlaces } from './mock';

export const places = mockPlaces;
export const excursions = mockExcursions;
export const flights = mockFlights;
export const lodging = mockLodging;

export type * from './types';
