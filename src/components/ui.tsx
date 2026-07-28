import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
  type KeyboardTypeOptions,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../i18n/LanguageContext';
import type { Language } from '../i18n/translations';
import { colors, fonts, radii, spacing } from '../theme';

const LOGO_ASPECT = 1014 / 720;

/**
 * Company logo (Eagle Watch Cleaning Services). The artwork is navy/gold on
 * transparent, so on dark surfaces it sits inside a white rounded chip.
 */
export function BrandLogo({
  height = 38,
  chip = true,
}: {
  height?: number;
  chip?: boolean;
}) {
  const logo = (
    <Image
      source={require('../../assets/images/logo.png')}
      style={{ height, width: height * LOGO_ASPECT }}
      resizeMode="contain"
    />
  );
  if (!chip) {
    return logo;
  }
  return <View style={styles.brandChip}>{logo}</View>;
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
  imageAlign = 'center',
}: {
  image: ImageSourcePropType;
  title: string;
  linkLabel: string;
  onPress: () => void;
  height?: number;
  /** 'bottom' shows the lower part of tall portrait photos instead of the center. */
  imageAlign?: 'center' | 'bottom';
}) {
  // Oversize the image and pull it up so the visible crop is the lower part.
  const imageStyle =
    imageAlign === 'bottom'
      ? [StyleSheet.absoluteFill, { height: '170%' as const, top: '-70%' as const }]
      : StyleSheet.absoluteFill;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.imageCard, { height }, pressed && { opacity: 0.92 }]}
    >
      <Image source={image} style={imageStyle} resizeMode="cover" />
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

/** Labelled text input with inline validation error, used in forms. */
export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        autoCapitalize="none"
        style={[styles.input, !!error && { borderColor: '#E5484D' }]}
      />
      {error ? <Text style={styles.inputError}>{error}</Text> : null}
    </View>
  );
}

/** EL / EN language switch. `onDark` renders it for dark surfaces. */
export function LanguageToggle({ onDark = false }: { onDark?: boolean }) {
  const { language, setLanguage } = useI18n();
  const options: Language[] = ['el', 'en'];
  return (
    <View style={[styles.langRow, onDark && styles.langRowDark]}>
      {options.map((lang) => {
        const active = language === lang;
        return (
          <Pressable
            key={lang}
            onPress={() => setLanguage(lang)}
            style={[styles.langChip, active && styles.langChipActive]}
          >
            <Text
              style={[
                styles.langLabel,
                onDark && !active && { color: colors.textOnDarkMuted },
                active && { color: colors.textOnDark },
              ]}
            >
              {lang.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
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
  brandChip: {
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.screen,
    gap: 12,
  },
  heading: {
    fontSize: 32,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fonts.regular,
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
    fontFamily: fonts.bold,
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
    fontFamily: fonts.extraBold,
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
    fontFamily: fonts.semiBold,
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
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  listRowSublabel: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.row,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  inputError: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#E5484D',
  },
  langRow: {
    flexDirection: 'row',
    gap: 4,
    padding: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
  },
  langRowDark: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  langChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
  },
  langChipActive: {
    backgroundColor: colors.accent,
  },
  langLabel: {
    fontSize: 13,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
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
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
});
