/** Ranks places to stay by the traveler's lodging type and loyalty programs. */
import type { LatLng, LodgingPref, LoyaltyProgram } from './types.ts';

export type LodgingType = 'hotel' | 'rental' | 'hostel';

export type LodgingOption = {
  id: string;
  name: string;
  type: LodgingType;
  program?: LoyaltyProgram;
  location: LatLng;
  rating: number;
  nightlyCents: number;
  bookingUrl: string;
  provider: string;
};

export const PROGRAM_NAMES: Record<LoyaltyProgram, string> = {
  hyatt: 'World of Hyatt',
  marriott: 'Marriott Bonvoy',
  hilton: 'Hilton Honors',
  ihg: 'IHG One Rewards',
  accor: 'ALL Accor',
};

export type RankedLodging = LodgingOption & { reason: string };

/**
 * Order: matching lodging type first, then properties in a program the
 * traveler belongs to, then rating.
 */
export function rankLodging(
  options: LodgingOption[],
  pref: LodgingPref,
  programs: LoyaltyProgram[],
): RankedLodging[] {
  const typeMatch = (o: LodgingOption) => pref === 'any' || o.type === pref;
  const member = (o: LodgingOption) => !!o.program && programs.includes(o.program);
  return [...options]
    .sort(
      (a, b) =>
        Number(typeMatch(b)) - Number(typeMatch(a)) ||
        Number(member(b)) - Number(member(a)) ||
        b.rating - a.rating,
    )
    .map((o) => ({
      ...o,
      reason: member(o)
        ? `You're a ${PROGRAM_NAMES[o.program!]} member: earn points and get member rates`
        : typeMatch(o)
          ? `Matches your preference for ${o.type === 'rental' ? 'rentals like Airbnb' : `${o.type}s`}`
          : 'Highest rated nearby',
    }));
}
