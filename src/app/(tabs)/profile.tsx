import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Card, Pill, SectionTitle } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { CURRENT_USER_ID, users } from '@/data/seed';
import { useTrips } from '@/data/trip-store';
import type { Interest } from '@/lib/types';

const ALL: Interest[] = [
  'history',
  'outdoors',
  'museums',
  'culinary',
  'nightlife',
  'art',
  'shopping',
  'relaxation',
];

export default function ProfileScreen() {
  const { trips, currentUserId } = useTrips();
  const me = users.find((u) => u.id === CURRENT_USER_ID)!;
  const tripCount = trips.filter((t) => t.members.some((m) => m.userId === currentUserId)).length;

  return (
    <Screen title="Profile">
      <Card>
        <ThemedText type="smallBold">@{me.handle}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {tripCount} trips
        </ThemedText>
      </Card>
      <SectionTitle>Travel preferences</SectionTitle>
      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          Used to suggest stops and draft day plans.
        </ThemedText>
        <View style={styles.pills}>
          {ALL.map((i) => (
            <Pill key={i} label={i} tone={me.interests.includes(i) ? 'tint' : 'neutral'} />
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

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
