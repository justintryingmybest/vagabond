import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Card, Pill, SectionTitle } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { leaderboard, passportFor } from '@/data/passport-data';
import { useTrips } from '@/data/trip-store';
import { useTheme } from '@/hooks/use-theme';
import { PROGRAM_NAMES } from '@/lib/lodging';
import { COUNTRIES, CONTINENT_COUNT, kmToMi } from '@/lib/passport';
import type { Interest, LodgingPref, LoyaltyProgram } from '@/lib/types';

const INTERESTS: Interest[] = [
  'history',
  'outdoors',
  'museums',
  'culinary',
  'nightlife',
  'art',
  'shopping',
  'relaxation',
];

const LODGING: { id: LodgingPref; label: string }[] = [
  { id: 'hotel', label: 'Hotels' },
  { id: 'rental', label: 'Airbnb / rentals' },
  { id: 'hostel', label: 'Hostels' },
  { id: 'any', label: 'No preference' },
];

const PROGRAMS = Object.keys(PROGRAM_NAMES) as LoyaltyProgram[];

export default function ProfileScreen() {
  const store = useTrips();
  const theme = useTheme();
  const { me } = store;
  const passport = passportFor(me.id, store.trips, store.forkCounts);
  const board = leaderboard(store.users, store.trips, store.forkCounts);
  const myRow = board.find((r) => r.userId === me.id)!;
  const earned = passport.badges.filter((b) => b.earned);
  const next = passport.badges
    .filter((b) => !b.earned)
    .sort((a, b) => b.progress - a.progress);

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <Screen title="Profile">
      <Card>
        <View style={styles.headRow}>
          <View style={styles.flex}>
            <ThemedText type="smallBold">@{me.handle}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Ranked #{myRow.rank} of {board.length} Vagabonds · {passport.points.toLocaleString('en-US')} points
            </ThemedText>
          </View>
        </View>
        <View style={styles.stats}>
          <Stat value={passport.stats.countries.length} label="countries" />
          <Stat value={`${passport.stats.continents.length}/${CONTINENT_COUNT}`} label="continents" />
          <Stat value={kmToMi(passport.stats.km).toLocaleString('en-US')} label="miles" />
          <Stat value={earned.length} label="badges" />
        </View>
      </Card>

      <SectionTitle>Passport stamps</SectionTitle>
      <View style={styles.stamps}>
        {passport.stamps.map((s, i) => (
          <View
            key={`${s.country}-${s.year}-${i}`}
            style={[styles.stamp, { borderColor: theme.tint }]}
            accessibilityLabel={`${s.country}, ${s.year}`}>
            <ThemedText style={styles.flag}>{COUNTRIES[s.country]?.flag ?? '🏳️'}</ThemedText>
            <ThemedText type="smallBold" style={[styles.stampText, { color: theme.tint }]} numberOfLines={1}>
              {s.country.toUpperCase()}
            </ThemedText>
            <ThemedText style={[styles.stampYear, { color: theme.tint }]}>{s.year}</ThemedText>
          </View>
        ))}
      </View>

      <SectionTitle>Badges</SectionTitle>
      <View style={styles.badges}>
        {[...earned, ...next].map((b) => (
          <Card key={b.id} style={[styles.badge, !b.earned && styles.locked]}>
            <ThemedText style={styles.badgeIcon}>{b.icon}</ThemedText>
            <ThemedText type="smallBold">{b.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {b.earned ? b.description : b.progressLabel}
            </ThemedText>
            {!b.earned ? (
              <View style={[styles.bar, { backgroundColor: theme.backgroundSelected }]}>
                <View style={[styles.fill, { width: `${b.progress * 100}%`, backgroundColor: theme.tint }]} />
              </View>
            ) : null}
          </Card>
        ))}
      </View>

      <SectionTitle>Vagabond rankings</SectionTitle>
      <Card style={styles.board}>
        {board.map((r) => {
          const u = store.users.find((x) => x.id === r.userId)!;
          const mine = r.userId === me.id;
          return (
            <View
              key={r.userId}
              style={[styles.boardRow, mine && { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText type="smallBold" style={styles.rank}>
                {r.rank}
              </ThemedText>
              <ThemedText type={mine ? 'smallBold' : 'small'} style={styles.flex}>
                {mine ? 'You' : u.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.num}>
                {r.countries} countries
              </ThemedText>
              <ThemedText type="smallBold" style={styles.num}>
                {r.points.toLocaleString('en-US')}
              </ThemedText>
            </View>
          );
        })}
      </Card>
      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        Points: 100 per country, 250 per continent, 5 per 100 km traveled, 20 per fork of your trips,
        50 per published trip.
      </ThemedText>

      <SectionTitle>Travel preferences</SectionTitle>
      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          Interests shape suggested stops and day plans.
        </ThemedText>
        <View style={styles.pills}>
          {INTERESTS.map((i) => (
            <Pressable
              key={i}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: me.interests.includes(i) }}
              onPress={() => store.updateMe({ interests: toggle(me.interests, i) })}>
              <Pill label={i} tone={me.interests.includes(i) ? 'tint' : 'neutral'} />
            </Pressable>
          ))}
        </View>
      </Card>

      <SectionTitle>Where you like to stay</SectionTitle>
      <Card>
        <View style={styles.pills}>
          {LODGING.map((l) => (
            <Pressable
              key={l.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: me.lodging === l.id }}
              onPress={() => store.updateMe({ lodging: l.id })}>
              <Pill label={l.label} tone={me.lodging === l.id ? 'tint' : 'neutral'} />
            </Pressable>
          ))}
        </View>
        <ThemedText type="small" themeColor="textSecondary" style={styles.gapTop}>
          Hotel programs you belong to. Their properties are suggested first.
        </ThemedText>
        <View style={styles.pills}>
          {PROGRAMS.map((p) => (
            <Pressable
              key={p}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: me.loyalty.includes(p) }}
              onPress={() => store.updateMe({ loyalty: toggle(me.loyalty, p) })}>
              <Pill label={PROGRAM_NAMES[p]} tone={me.loyalty.includes(p) ? 'tint' : 'neutral'} />
            </Pressable>
          ))}
        </View>
      </Card>

      <SectionTitle>Cards and points</SectionTitle>
      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          Add the cards you hold and Vagabond will suggest which to use for each booking. Coming
          next.
        </ThemedText>
      </Card>
    </Screen>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headRow: { flexDirection: 'row', alignItems: 'center' },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.two },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, lineHeight: 28, fontWeight: 700, fontVariant: ['tabular-nums'] },
  stamps: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  stamp: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
    padding: Spacing.one,
  },
  flag: { fontSize: 26, lineHeight: 30 },
  stampText: { fontSize: 9, lineHeight: 12, letterSpacing: 0.5, maxWidth: 80 },
  stampYear: { fontSize: 10, lineHeight: 12, fontWeight: 600 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  badge: { width: '48%', flexGrow: 1, gap: 2, minWidth: 150 },
  locked: { opacity: 0.6 },
  badgeIcon: { fontSize: 24, lineHeight: 30 },
  bar: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: Spacing.one },
  fill: { height: 6, borderRadius: 3 },
  board: { paddingHorizontal: Spacing.one, gap: 0 },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: 8,
  },
  rank: { width: 22, textAlign: 'right', fontVariant: ['tabular-nums'] },
  num: { fontVariant: ['tabular-nums'], textAlign: 'right' },
  note: { marginTop: Spacing.two },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  gapTop: { marginTop: Spacing.two },
});
