import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { TripMap } from '@/components/map/trip-map';
import { AREA_COLORS } from '@/components/map/types';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Pill, SectionTitle } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { CURRENT_USER_ID, users } from '@/data/seed';
import { useTrips } from '@/data/trip-store';
import { useTheme } from '@/hooks/use-theme';
import { excursions, places } from '@/integrations';
import { getDailyWeather } from '@/integrations/weather';
import { addDays, isIsoDate } from '@/lib/dates';
import { type Area, centroid, inAnyArea } from '@/lib/geo';
import { type Proposal, proposeItineraries } from '@/lib/propose';
import type { Interest, LatLng } from '@/lib/types';

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

const SOURCE_LABEL: Record<Proposal['source'], string> = {
  forked: 'Most forked',
  'top-rated': 'Top rated',
  excursions: 'Tours and activities',
};

export default function PlanScreen() {
  const theme = useTheme();
  const store = useTrips();
  const me = users.find((u) => u.id === CURRENT_USER_ID)!;

  const [areas, setAreas] = useState<Area[]>([]);
  const [draft, setDraft] = useState<LatLng[] | null>(null);
  const [startDate, setStartDate] = useState(addDays(new Date().toISOString().slice(0, 10), 30));
  const [dayCount, setDayCount] = useState(3);
  const [interests, setInterests] = useState<Interest[]>(me.interests);
  const [proposals, setProposals] = useState<Proposal[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const drawing = draft !== null;
  const shown = proposals?.find((p) => p.id === selected);

  const markers = useMemo(
    () =>
      (shown?.days.flatMap((d) => d.stops) ?? []).map((s, i) => ({
        id: s.id,
        location: s.location,
        label: String(i + 1),
        title: s.title,
      })),
    [shown],
  );

  function finishArea() {
    if (!draft || draft.length < 3) return;
    setAreas((a) => [...a, { id: `area-${Date.now()}`, name: `Area ${a.length + 1}`, points: draft }]);
    setDraft(null);
    setProposals(null);
  }

  async function suggest() {
    if (areas.length === 0) return setError('Draw at least one area on the map first.');
    if (!isIsoDate(startDate)) return setError('Enter the start date as YYYY-MM-DD.');
    setError(null);
    setBusy(true);
    const center = centroid(areas.flatMap((a) => a.points));
    const label = areas.length === 1 ? 'in your area' : `across ${areas.length} areas`;
    const dates = Array.from({ length: dayCount }, (_, i) => addDays(startDate, i));
    const perArea = await Promise.all(
      areas.map(async (a) => {
        const c = centroid(a.points);
        const [p, e] = await Promise.all([places.search('', c), excursions.search(a.name, c)]);
        return { p, e };
      }),
    );
    const weather = await getDailyWeather(center, dates);
    const published = store.trips.filter((t) => t.visibility === 'public' && t.publishedAt);
    const known = published.find((t) =>
      t.days.some((d) => d.stops.some((s) => inAnyArea(s.location, areas))),
    );
    const result = proposeItineraries({
      areas,
      startDate,
      dayCount,
      interests,
      publishedTrips: published,
      forkCounts: store.forkCounts,
      places: perArea.flatMap((x, ai) =>
        x.p.map((r) => ({ ...r, id: `${r.id}-${ai}`, title: r.name, kind: 'place' as const })),
      ),
      excursions: perArea.flatMap((x, ai) =>
        x.e.map((r) => ({
          id: `${r.id}-${ai}`,
          title: r.title,
          location: r.location,
          tags: r.tags,
          rating: r.rating,
          kind: 'excursion' as const,
          bookingUrl: r.bookingUrl,
          provider: r.provider,
          priceCents: r.priceCents,
        })),
      ),
      weather,
      areaLabel: label,
      destination: known?.destination ?? 'Your drawn area',
    });
    setProposals(result);
    setSelected(result[0]?.id ?? null);
    setBusy(false);
  }

  function create(p: Proposal) {
    const id = store.addTrip({
      title: p.source === 'forked' ? `${p.title} (my version)` : p.title,
      destination: p.destination,
      coverEmoji: '🗺️',
      startDate: p.days[0].date,
      endDate: p.days[p.days.length - 1].date,
      visibility: 'private',
      forkedFromId: p.basedOnTripId,
      days: p.days,
      votes: [],
      expenses: [],
    });
    router.push({ pathname: '/trip/[id]', params: { id } });
  }

  return (
    <Screen title="Plan" subtitle="Draw the places you want to go, then pick dates. We'll suggest itineraries.">
      <View style={styles.mapWrap}>
        <TripMap
          height={340}
          areas={areas}
          draft={draft ?? []}
          markers={markers}
          showRoute={markers.length > 1}
          onPress={drawing ? (p) => setDraft((d) => [...(d ?? []), p]) : undefined}
          initialCenter={{ lat: 38.72, lng: -9.14 }}
          initialZoom={10}
        />
        {drawing ? (
          <View style={[styles.hint, { backgroundColor: theme.background }]}>
            <ThemedText type="small">
              Tap the map to add corners ({draft.length} so far, 3 or more needed).
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.row}>
        {drawing ? (
          <>
            <Button label="Finish area" onPress={finishArea} />
            <Button variant="secondary" label="Cancel" onPress={() => setDraft(null)} />
          </>
        ) : (
          <Button label={areas.length ? 'Draw another area' : 'Draw an area'} onPress={() => setDraft([])} />
        )}
      </View>

      {areas.length > 0 ? (
        <View style={[styles.row, styles.wrap]}>
          {areas.map((a, i) => (
            <Pressable
              key={a.id}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${a.name}`}
              onPress={() => {
                setAreas((all) => all.filter((x) => x.id !== a.id));
                setProposals(null);
              }}
              style={[styles.areaChip, { borderColor: AREA_COLORS[i % AREA_COLORS.length] }]}>
              <ThemedText type="small">{a.name} ✕</ThemedText>
            </Pressable>
          ))}
        </View>
      ) : null}

      <SectionTitle>When and how long</SectionTitle>
      <Card>
        <View style={[styles.row, styles.between]}>
          <ThemedText type="small">Start date</ThemedText>
          <TextInput
            id="start-date"
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.textSecondary}
            inputMode="numeric"
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          />
        </View>
        <View style={[styles.row, styles.between]}>
          <ThemedText type="small">Length</ThemedText>
          <View style={styles.row}>
            <Stepper label="−" onPress={() => setDayCount((n) => Math.max(1, n - 1))} />
            <ThemedText type="smallBold" style={styles.count}>
              {dayCount} {dayCount === 1 ? 'day' : 'days'}
            </ThemedText>
            <Stepper label="+" onPress={() => setDayCount((n) => Math.min(14, n + 1))} />
          </View>
        </View>
      </Card>

      <SectionTitle>Interests</SectionTitle>
      <View style={[styles.row, styles.wrap]}>
        {INTERESTS.map((i) => {
          const on = interests.includes(i);
          return (
            <Pressable
              key={i}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => setInterests((all) => (on ? all.filter((x) => x !== i) : [...all, i]))}>
              <Pill label={i} tone={on ? 'tint' : 'neutral'} />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.cta}>
        <Button label={busy ? 'Finding itineraries…' : 'Suggest itineraries'} onPress={suggest} />
        {error ? <ThemedText style={{ color: theme.warning }}>{error}</ThemedText> : null}
      </View>

      {proposals ? (
        <>
          <SectionTitle>Suggested itineraries</SectionTitle>
          {proposals.length === 0 ? (
            <ThemedText themeColor="textSecondary">Nothing found for these areas yet.</ThemedText>
          ) : null}
          {proposals.map((p) => (
            <Card
              key={p.id}
              style={[styles.proposal, selected === p.id && { borderColor: theme.tint, borderWidth: 1.5 }]}>
              <View style={[styles.row, styles.wrap]}>
                <Pill tone="tint" label={SOURCE_LABEL[p.source]} />
                {p.forks ? <Pill label={`${p.forks} forks`} /> : null}
                {p.weatherAdjusted ? <Pill tone="success" label="Rearranged for weather" /> : null}
              </View>
              <ThemedText type="smallBold">{p.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {p.blurb}
              </ThemedText>
              {p.days.map((d, i) => (
                <ThemedText key={d.id} type="small">
                  <ThemedText type="smallBold">Day {i + 1}: </ThemedText>
                  {d.stops.map((s) => s.title).join(' → ') || 'Free day'}
                </ThemedText>
              ))}
              <View style={styles.row}>
                <Button label="Use this plan" onPress={() => create(p)} />
                <Button variant="secondary" label="Show on map" onPress={() => setSelected(p.id)} />
              </View>
            </Card>
          ))}
          <ThemedText type="small" themeColor="textSecondary">
            Places and tours are sample data until the live APIs are connected.
          </ThemedText>
        </>
      ) : null}
    </Screen>
  );
}

function Stepper({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label === '+' ? 'More days' : 'Fewer days'}
      onPress={onPress}
      style={[styles.stepper, { borderColor: theme.border }]}>
      <ThemedText type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mapWrap: { marginTop: Spacing.three },
  hint: {
    position: 'absolute',
    left: Spacing.two,
    bottom: Spacing.two,
    right: Spacing.two,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    opacity: 0.95,
  },
  row: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center', marginTop: Spacing.two },
  wrap: { flexWrap: 'wrap' },
  between: { justifyContent: 'space-between', marginTop: 0 },
  areaChip: { borderWidth: 2, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: 2 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    minWidth: 130,
    fontSize: 15,
  },
  stepper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: { minWidth: 64, textAlign: 'center' },
  cta: { marginTop: Spacing.four, gap: Spacing.two },
  proposal: { marginBottom: Spacing.three, borderWidth: 1, borderColor: 'transparent' },
});
