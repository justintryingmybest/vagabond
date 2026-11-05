/**
 * Active integration providers. Everything is mocked until the paid APIs are
 * priced out (see the plan doc). Swap one line per provider when going live.
 */
import { mockExcursions, mockFlights, mockPlaces } from './mock';

export const places = mockPlaces;
export const excursions = mockExcursions;
export const flights = mockFlights;

export type * from './types';
