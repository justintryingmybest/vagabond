/**
 * In-memory trip store for the beta. The action names match what the Supabase
 * repository will expose, so screens will not change when it is swapped in.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Booking, Trip, User } from '@/lib/types';

import { CURRENT_USER_ID, seedForkCounts, seedRecentForks, seedTrips, users as seedUsers } from './seed';

type TripStore = {
  currentUserId: string;
  me: User;
  users: User[];
  updateMe: (patch: Partial<Omit<User, 'id'>>) => void;
  trips: Trip[];
  forkCounts: Record<string, number>;
  /** Forks in the last 7 days. */
  recentForks: Record<string, number>;
  getTrip: (id: string) => Trip | undefined;
  userName: (id: string) => string;
  /** Toggle the current user's opt-out of a stop. */
  toggleSkip: (tripId: string, stopId: string) => void;
  updateBooking: (tripId: string, stopId: string, patch: Partial<Booking>) => void;
  castVote: (tripId: string, voteId: string, optionId: string) => void;
  publish: (tripId: string) => void;
  /** Copy a published trip into a new private trip owned by the current user. */
  fork: (tripId: string) => string | undefined;
  /** Add a new trip (e.g. from a proposal) owned by the current user. */
  addTrip: (trip: Omit<Trip, 'id' | 'authorId' | 'members'>) => string;
  /** Swap the plans (stops and titles) of two days, keeping their dates. */
  swapDays: (tripId: string, dayA: string, dayB: string) => void;
};

const Ctx = createContext<TripStore | null>(null);

const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export function TripStoreProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(seedTrips);
  const [forkCounts, setForkCounts] = useState(seedForkCounts);
  const [recentForks, setRecentForks] = useState(seedRecentForks);
  const [users, setUsers] = useState<User[]>(seedUsers);
  const me = CURRENT_USER_ID;

  const editTrip = useCallback((tripId: string, fn: (t: Trip) => Trip) => {
    setTrips((all) => all.map((t) => (t.id === tripId ? fn(t) : t)));
  }, []);

  const editStop = useCallback(
    (tripId: string, stopId: string, fn: (s: Trip['days'][number]['stops'][number]) => typeof s) =>
      editTrip(tripId, (t) => ({
        ...t,
        days: t.days.map((d) => ({
          ...d,
          stops: d.stops.map((s) => (s.id === stopId ? fn(s) : s)),
        })),
      })),
    [editTrip],
  );

  const value = useMemo<TripStore>(
    () => ({
      currentUserId: me,
      me: users.find((u) => u.id === me)!,
      users,
      updateMe: (patch) => setUsers((all) => all.map((u) => (u.id === me ? { ...u, ...patch } : u))),
      trips,
      forkCounts,
      recentForks,
      getTrip: (id) => trips.find((t) => t.id === id),
      userName: (id) => users.find((u) => u.id === id)?.name ?? 'Someone',
      toggleSkip: (tripId, stopId) =>
        editStop(tripId, stopId, (s) => ({
          ...s,
          skippedBy: s.skippedBy.includes(me)
            ? s.skippedBy.filter((id) => id !== me)
            : [...s.skippedBy, me],
        })),
      updateBooking: (tripId, stopId, patch) =>
        editStop(tripId, stopId, (s) => ({ ...s, booking: { ...s.booking, ...patch } })),
      castVote: (tripId, voteId, optionId) =>
        editTrip(tripId, (t) => ({
          ...t,
          votes: t.votes.map((v) =>
            v.id !== voteId
              ? v
              : {
                  ...v,
                  options: v.options.map((o) => ({
                    ...o,
                    voterIds:
                      o.id === optionId
                        ? [...o.voterIds.filter((id) => id !== me), me]
                        : o.voterIds.filter((id) => id !== me),
                  })),
                },
          ),
        })),
      publish: (tripId) =>
        editTrip(tripId, (t) => ({
          ...t,
          visibility: 'public',
          publishedAt: new Date().toISOString().slice(0, 10),
        })),
      fork: (tripId) => {
        const src = trips.find((t) => t.id === tripId);
        if (!src) return undefined;
        const id = newId('t');
        const copy: Trip = {
          ...structuredClone(src),
          id,
          title: `${src.title} (my version)`,
          visibility: 'private',
          publishedAt: undefined,
          forkedFromId: src.id,
          authorId: me,
          members: [{ userId: me, role: 'owner' }],
          votes: [],
          expenses: [],
        };
        // A fork keeps the plan, not the original group's personal state.
        copy.days = copy.days.map((d) => ({
          ...d,
          stops: d.stops.map((s) => ({
            ...s,
            skippedBy: [],
            booking: {
              status: s.booking.status === 'not_needed' ? 'not_needed' : 'to_book',
              url: s.booking.url,
              provider: s.booking.provider,
            },
          })),
        }));
        setTrips((all) => [copy, ...all]);
        setForkCounts((c) => ({ ...c, [src.id]: (c[src.id] ?? 0) + 1 }));
        setRecentForks((c) => ({ ...c, [src.id]: (c[src.id] ?? 0) + 1 }));
        return id;
      },
      addTrip: (input) => {
        const id = newId('t');
        setTrips((all) => [
          { ...input, id, authorId: me, members: [{ userId: me, role: 'owner' }] },
          ...all,
        ]);
        return id;
      },
      swapDays: (tripId, dayA, dayB) =>
        editTrip(tripId, (t) => {
          const a = t.days.find((d) => d.id === dayA);
          const b = t.days.find((d) => d.id === dayB);
          if (!a || !b) return t;
          return {
            ...t,
            days: t.days.map((d) =>
              d.id === dayA
                ? { ...d, title: b.title, stops: b.stops }
                : d.id === dayB
                  ? { ...d, title: a.title, stops: a.stops }
                  : d,
            ),
          };
        }),
    }),
    [trips, forkCounts, recentForks, users, me, editTrip, editStop],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTrips(): TripStore {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTrips must be used inside TripStoreProvider');
  return v;
}
