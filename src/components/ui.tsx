import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme';

/** Wordmark used in the dark navigation headers. */
export function BrandTitle({ size = 20 }: { size?: number }) {
  return (
    <View style={styles.brandRow}>
      <Ionicons name="sparkles" size={size - 2} color={colors.textOnDark} />
      <Text style={[styles.brandText, { fontSize: size }]}>EagleClean</Text>
    </View>
  );
}

export function ScreenContainer({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.container, style]}>{children}</View>;
}

export function Heading({
  children,
  onDark = false,
}: {
  children: React.ReactNode;
  onDark?: boolean;
}) {
  return (
    <Text style={[styles.heading, onDark && { color: colors.textOnDark }]}>
      {children}
    </Text>
  );
}

export function Subtitle({
  children,
  onDark = false,
}: {
  children: React.ReactNode;
  onDark?: boolean;
}) {
  return (
    <Text style={[styles.subtitle, onDark && { color: colors.textOnDarkMuted }]}>
      {children}
    </Text>
  );
}

type PillVariant = 'light' | 'dark' | 'accent' | 'ghost' | 'outline';

const pillTextColor: Record<PillVariant, string> = {
  light: colors.textPrimary,
  dark: colors.textOnDark,
  accent: colors.textOnDark,
  ghost: colors.textOnDark,
  outline: colors.textPrimary,
};

export function PillButton({
  label,
  onPress,
  variant = 'accent',
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: PillVariant;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pill,
        styles[`pill_${variant}`],
        (pressed || disabled) && { opacity: 0.75 },
      ]}
    >
      <Text style={[styles.pillLabel, { color: pillTextColor[variant] }]}>{label}</Text>
    </Pressable>
  );
}

/** Large photo card with a text overlay, like the "Services" cards. */
export function ImageCard({
  image,
  title,
  linkLabel,
  onPress,
  height = 360,
}: {
  image: ImageSourcePropType;
  title: string;
  linkLabel: string;
  onPress: () => void;
  height?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.imageCard, { height }, pressed && { opacity: 0.92 }]}
    >
      <Image source={image} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.72)']}
        style={styles.imageCardGradient}
      />
      <View style={styles.imageCardContent}>
        <Text style={styles.imageCardTitle}>{title}</Text>
        <View style={styles.imageCardLinkRow}>
          <Text style={styles.imageCardLink}>{linkLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textOnDark} />
        </View>
      </View>
    </Pressable>
  );
}

/** Tappable white row card with optional icon, used for lists of options. */
export function ListRow({
  label,
  sublabel,
  icon,
  onPress,
}: {
  label: string;
  sublabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.listRow, pressed && { backgroundColor: colors.surface }]}
    >
      {icon && (
        <View style={styles.listRowIcon}>
          <Ionicons name={icon} size={20} color={colors.accent} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.listRowLabel}>{label}</Text>
        {sublabel ? <Text style={styles.listRowSublabel}>{sublabel}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

/** Compact centered chip, used for the time slot grid. */
export function Chip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && { backgroundColor: colors.surface }]}
    >
      <Text style={styles.chipLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  brandText: {
    color: colors.textOnDark,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.screen,
    gap: 12,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  pill: {
    borderRadius: radii.pill,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  pill_light: { backgroundColor: colors.background },
  pill_dark: { backgroundColor: colors.ink },
  pill_accent: { backgroundColor: colors.accent },
  pill_ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  pill_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pillLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  imageCard: {
    borderRadius: radii.card,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  imageCardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  imageCardContent: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 22,
    gap: 10,
  },
  imageCardTitle: {
    color: colors.textOnDark,
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 32,
  },
  imageCardLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageCardLink: {
    color: colors.textOnDark,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.background,
    borderRadius: radii.row,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  listRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRowLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  listRowSublabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chip: {
    flex: 1,
    borderRadius: radii.row,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  chipLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
