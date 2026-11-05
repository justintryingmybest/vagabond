import { badges, type Badge, passportStats, points, type PassportStats, rank, type RankRow, type Stamp, stampFromTrip } from '@/lib/passport';
import type { Trip, User } from '@/lib/types';

import { pastStamps } from './history';

export type Passport = {
  stamps: Stamp[];
  stats: PassportStats;
  points: number;
  badges: Badge[];
};

/** Stamps from past travel plus trips in the app that have ended. */
export function passportFor(
  userId: string,
  trips: Trip[],
  forkCounts: Record<string, number>,
  today = new Date().toISOString().slice(0, 10),
): Passport {
  const mine = trips.filter((t) => t.members.some((m) => m.userId === userId));
  const authored = trips.filter((t) => t.authorId === userId);
  // Forked copies replay someone else's trip; count only trips actually taken.
  const done = mine.filter((t) => t.endDate < today && !t.forkedFromId);
  const stamps = [...(pastStamps[userId] ?? []), ...done.map(stampFromTrip)].sort(
    (a, b) => b.year - a.year,
  );
  const stats = passportStats(stamps, {
    forksReceived: authored.reduce((s, t) => s + (forkCounts[t.id] ?? 0), 0),
    publishedTrips: authored.filter((t) => t.publishedAt).length,
    largestGroup: Math.max(1, ...mine.map((t) => t.members.length)),
  });
  return { stamps, stats, points: points(stats), badges: badges(stats) };
}

export function leaderboard(
  users: User[],
  trips: Trip[],
  forkCounts: Record<string, number>,
): (RankRow & { countries: number })[] {
  const byUser = new Map(users.map((u) => [u.id, passportFor(u.id, trips, forkCounts)]));
  return rank(users.map((u) => ({ userId: u.id, points: byUser.get(u.id)!.points }))).map((r) => ({
    ...r,
    countries: byUser.get(r.userId)!.stats.countries.length,
  }));
}
