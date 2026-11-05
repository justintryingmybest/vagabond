import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Scrollable page with a large title, centered and width-capped on web. */
export function Screen({
  title,
  subtitle,
  children,
  inTabs = true,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  inTabs?: boolean;
}) {
  const theme = useTheme();
  // The web tab bar floats over the top of the page.
  const topPad = Platform.OS === 'web' && inTabs ? 88 : 0;
  return (
    <SafeAreaView
      edges={inTabs ? ['top'] : []}
      style={[styles.fill, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + Spacing.three, paddingBottom: BottomTabInset + Spacing.five },
        ]}>
        <View style={styles.inner}>
          {title ? (
            <ThemedText type="subtitle" style={styles.title}>
              {title}
            </ThemedText>
          ) : null}
          {subtitle ? <ThemedText themeColor="textSecondary">{subtitle}</ThemedText> : null}
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: Spacing.three, alignItems: 'center' },
  inner: { width: '100%', maxWidth: MaxContentWidth },
  title: { fontSize: 30, lineHeight: 38 },
});
