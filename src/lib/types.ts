/**
 * Core domain model. Mirrors supabase/migrations/0001_init.sql so the mock
 * store can be swapped for Supabase without changing screens.
 */

export type Interest =
  | 'history'
  | 'outdoors'
  | 'museums'
  | 'culinary'
  | 'nightlife'
  | 'art'
  | 'shopping'
  | 'relaxation';

export type LatLng = { lat: number; lng: number };

export type LodgingPref = 'hotel' | 'rental' | 'hostel' | 'any';

/** Hotel loyalty programs we can prioritize. */
export type LoyaltyProgram = 'hyatt' | 'marriott' | 'hilton' | 'ihg' | 'accor';

export type User = {
  id: string;
  name: string;
  handle: string;
  interests: Interest[];
  lodging: LodgingPref;
  loyalty: LoyaltyProgram[];
};

export type EventKind = 'festival' | 'music' | 'sports' | 'cultural';

/** A recurring event a trip is built around, e.g. Oktoberfest. */
export type TripEvent = {
  name: string;
  kind: EventKind;
  /** Human-readable timing, e.g. "Late September to early October". */
  when: string;
};

export type MemberRole = 'owner' | 'editor' | 'viewer';

export type TripMember = { userId: string; role: MemberRole };

export type StopKind = 'place' | 'food' | 'excursion' | 'flight' | 'lodging' | 'transit';

export type BookingStatus = 'not_needed' | 'to_book' | 'booked';

/** A booking made inside or outside the app (link-out), tracked on the stop. */
export type Booking = {
  status: BookingStatus;
  /** Member responsible for booking this stop. */
  ownerId?: string;
  provider?: string;
  /** Deep link used for link-out booking. */
  url?: string;
  confirmationCode?: string;
  /** Price in minor units (cents) to avoid float drift. */
  priceCents?: number;
  currency?: string;
  paidById?: string;
};

export type Stop = {
  id: string;
  title: string;
  kind: StopKind;
  location: LatLng;
  /** Local time "HH:MM" */
  startTime?: string;
  notes?: string;
  tags: Interest[];
  booking: Booking;
  /** Members who opted out of this stop (personal itinerary variation). */
  skippedBy: string[];
};

export type Day = { id: string; date: string; title?: string; stops: Stop[] };

export type VoteOption = { id: string; label: string; voterIds: string[] };

export type Vote = {
  id: string;
  question: string;
  dayId?: string;
  createdById: string;
  options: VoteOption[];
  closed: boolean;
};

export type Expense = {
  id: string;
  description: string;
  amountCents: number;
  currency: string;
  paidById: string;
  /** Members sharing the cost; split evenly. */
  sharedByIds: string[];
  stopId?: string;
};

export type TripVisibility = 'private' | 'members' | 'public';

export type Trip = {
  id: string;
  title: string;
  destination: string;
  /** Country name, matching src/lib/passport.ts. */
  country: string;
  coverEmoji: string;
  startDate: string;
  endDate: string;
  visibility: TripVisibility;
  /** Set when the trip was published after completion. */
  publishedAt?: string;
  /** The trip this one was forked from, for attribution and fork counts. */
  forkedFromId?: string;
  event?: TripEvent;
  authorId: string;
  members: TripMember[];
  days: Day[];
  votes: Vote[];
  expenses: Expense[];
};
