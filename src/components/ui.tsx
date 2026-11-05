/** Small shared UI pieces in a plain, iOS-settings-like style. */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Card({ style, ...props }: ViewProps) {
  const theme = useTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement }, style]}
      {...props}
    />
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
        {children}
      </ThemedText>
      {action}
    </View>
  );
}

type Tone = 'neutral' | 'tint' | 'success' | 'warning';

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const theme = useTheme();
  const color =
    tone === 'neutral' ? theme.textSecondary : tone === 'tint' ? theme.tint : theme[tone];
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <ThemedText style={[styles.pillText, { color }]}>{label}</ThemedText>
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}) {
  const theme = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary ? theme.tint : 'transparent',
          borderColor: theme.tint,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <ThemedText type="smallBold" style={{ color: primary ? '#fff' : theme.tint }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: Spacing.three, gap: Spacing.two },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  sectionTitle: { textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12 },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  pillText: { fontSize: 12, lineHeight: 18, fontWeight: 600 },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
});
