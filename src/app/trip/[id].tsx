import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, View } from 'react-native';

import { RouteMap } from '@/components/route-map';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Pill, SectionTitle } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTrips } from '@/data/trip-store';
import { useTheme } from '@/hooks/use-theme';
import { balances, expensesFromBookings, formatMoney, settleUp } from '@/lib/costs';
import type { Stop, Trip } from '@/lib/types';

export default function TripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useTrips();
  const trip = store.getTrip(id);

  if (!trip) {
    return (
      <Screen inTabs={false} title="Trip not found">
        <ThemedText themeColor="textSecondary">This trip may have been deleted.</ThemedText>
      </Screen>
    );
  }

  const isMember = trip.members.some((m) => m.userId === store.currentUserId);
  const isOwner = trip.authorId === store.currentUserId;
  const source = trip.forkedFromId ? store.getTrip(trip.forkedFromId) : undefined;

  return (
    <Screen inTabs={false} title={`${trip.coverEmoji} ${trip.title}`} subtitle={subtitle(trip)}>
      <Stack.Screen options={{ title: trip.destination }} />

      {source ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.gapTop}>
          Forked from “{source.title}” by {store.userName(source.authorId)}
        </ThemedText>
      ) : null}

      <View style={styles.actions}>
        {trip.publishedAt && !isMember ? (
          <Button
            label="Fork this trip"
            onPress={() => {
              const newId = store.fork(trip.id);
              if (newId) router.replace({ pathname: '/trip/[id]', params: { id: newId } });
            }}
          />
        ) : null}
        {isOwner && !trip.publishedAt ? (
          <Button variant="secondary" label="Publish trip" onPress={() => store.publish(trip.id)} />
        ) : null}
      </View>

      <SectionTitle>Travelers</SectionTitle>
      <View style={styles.pills}>
        {trip.members.map((m) => (
          <Pill
            key={m.userId}
            label={`${store.userName(m.userId)}${m.role === 'owner' ? ' · owner' : ''}`}
          />
        ))}
      </View>

      {trip.days.map((day, i) => (
        <View key={day.id}>
          <SectionTitle>
            Day {i + 1} · {day.title ?? day.date}
          </SectionTitle>
          <RouteMap stops={day.stops} height={150} />
          <View style={styles.stops}>
            {day.stops.map((s, n) => (
              <StopRow key={s.id} trip={trip} stop={s} index={n + 1} interactive={isMember} />
            ))}
          </View>
        </View>
      ))}

      {trip.votes.length > 0 ? <Votes trip={trip} interactive={isMember} /> : null}
      {isMember && trip.members.length > 1 ? <Costs trip={trip} /> : null}
    </Screen>
  );
}

function subtitle(t: Trip) {
  return `${t.destination} · ${t.startDate} to ${t.endDate}`;
}

function StopRow({
  trip,
  stop,
  index,
  interactive,
}: {
  trip: Trip;
  stop: Stop;
  index: number;
  interactive: boolean;
}) {
  const store = useTrips();
  const theme = useTheme();
  const me = store.currentUserId;
  const skipping = stop.skippedBy.includes(me);
  const b = stop.booking;
  const owner = b.ownerId ? store.userName(b.ownerId) : undefined;

  return (
    <Card style={[styles.stop, skipping && styles.dim]}>
      <View style={styles.stopHead}>
        <ThemedText type="smallBold" style={{ color: theme.tint }}>
          {index}
        </ThemedText>
        <View style={styles.flex}>
          <ThemedText type="smallBold">{stop.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {[stop.startTime, stop.kind, ...stop.tags].filter(Boolean).join(' · ')}
          </ThemedText>
        </View>
      </View>

      {stop.notes ? <ThemedText type="small">{stop.notes}</ThemedText> : null}

      <View style={styles.pills}>
        {b.status === 'to_book' ? (
          <Pill tone="warning" label={owner ? `${owner} to book` : 'Needs booking'} />
        ) : null}
        {b.status === 'booked' ? (
          <Pill
            tone="success"
            label={`Booked${b.confirmationCode ? ` · ${b.confirmationCode}` : ''}${
              b.priceCents ? ` · ${formatMoney(b.priceCents)}` : ''
            }`}
          />
        ) : null}
        {stop.skippedBy.length > 0 ? (
          <Pill label={`Skipping: ${stop.skippedBy.map(store.userName).join(', ')}`} />
        ) : null}
      </View>

      {interactive ? (
        <View style={styles.rowActions}>
          {b.url && b.status !== 'booked' ? (
            <TextAction label="Book" onPress={() => WebBrowser.openBrowserAsync(b.url!)} />
          ) : null}
          {b.status === 'to_book' ? (
            <TextAction
              label="Mark booked"
              onPress={() =>
                store.updateBooking(trip.id, stop.id, { status: 'booked', paidById: me })
              }
            />
          ) : null}
          <TextAction
            label={skipping ? "I'm going" : "I'll skip this"}
            onPress={() => store.toggleSkip(trip.id, stop.id)}
          />
        </View>
      ) : null}
    </Card>
  );
}

function TextAction({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8}>
      <ThemedText type="smallBold" style={{ color: theme.tint }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function Votes({ trip, interactive }: { trip: Trip; interactive: boolean }) {
  const store = useTrips();
  const theme = useTheme();
  return (
    <>
      <SectionTitle>Group votes</SectionTitle>
      {trip.votes.map((v) => (
        <Card key={v.id} style={styles.stop}>
          <ThemedText type="smallBold">{v.question}</ThemedText>
          {v.options.map((o) => {
            const mine = o.voterIds.includes(store.currentUserId);
            return (
              <Pressable
                key={o.id}
                disabled={!interactive || v.closed}
                onPress={() => store.castVote(trip.id, v.id, o.id)}
                style={[styles.option, { borderColor: mine ? theme.tint : theme.border }]}>
                <ThemedText type="small" style={styles.flex}>
                  {o.label}
                </ThemedText>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  {o.voterIds.length}
                </ThemedText>
              </Pressable>
            );
          })}
        </Card>
      ))}
    </>
  );
}

function Costs({ trip }: { trip: Trip }) {
  const store = useTrips();
  const memberIds = trip.members.map((m) => m.userId);
  const all = [...trip.expenses, ...expensesFromBookings(trip)];
  const total = all.reduce((s, e) => s + e.amountCents, 0);
  const transfers = settleUp(balances(memberIds, all));

  return (
    <>
      <SectionTitle>Costs</SectionTitle>
      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          {formatMoney(total)} across {all.length} expenses. People who skipped a stop don't pay
          for it.
        </ThemedText>
        {transfers.length === 0 ? (
          <ThemedText type="small">Everyone is settled up.</ThemedText>
        ) : (
          transfers.map((t) => (
            <ThemedText key={`${t.fromId}-${t.toId}`} type="small">
              {store.userName(t.fromId)} owes {store.userName(t.toId)}{' '}
              <ThemedText type="smallBold">{formatMoney(t.amountCents)}</ThemedText>
            </ThemedText>
          ))
        )}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  gapTop: { marginTop: Spacing.two },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  stops: { gap: Spacing.two, marginTop: Spacing.two },
  stop: { gap: Spacing.two },
  dim: { opacity: 0.55 },
  stopHead: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  flex: { flex: 1 },
  rowActions: { flexDirection: 'row', gap: Spacing.four },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
