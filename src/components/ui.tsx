import React from 'react';
import {
  Image,
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
import { PressableScale } from './PressableScale';
import { useI18n } from '../i18n/LanguageContext';
import type { Language } from '../i18n/translations';
import { colors, fonts, radii, spacing } from '../theme';

const LOGO_ASPECT = 908 / 613;

/**
 * Cleanovox wordmark + monogram. The artwork sits on white, so dark
 * headers wrap it in a rounded chip.
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
  accent: colors.textOnAccent,
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
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={[styles.pill, styles[`pill_${variant}`], disabled && styles.pillDisabled]}
    >
      {variant === 'accent' ? (
        <LinearGradient
          colors={[colors.accentStart, colors.accentEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <Text style={[styles.pillLabel, { color: pillTextColor[variant] }]}>{label}</Text>
    </PressableScale>
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
    <PressableScale onPress={onPress} style={[styles.imageCard, { height }]}>
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
    </PressableScale>
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
    <PressableScale onPress={onPress} style={styles.listRow}>
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
    </PressableScale>
  );
}

/** Labelled text input with optional leading icon, password reveal, and error. */
export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'none',
  autoComplete,
  textContentType,
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
  autoComplete?: React.ComponentProps<typeof TextInput>['autoComplete'];
  textContentType?: React.ComponentProps<typeof TextInput>['textContentType'];
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const [hidden, setHidden] = React.useState(secureTextEntry);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrap, !!error && { borderColor: '#E5484D' }]}>
        {icon ? (
          <Ionicons name={icon} size={18} color={colors.textSecondary} style={styles.inputIcon} />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={hidden}
          autoComplete={autoComplete}
          textContentType={textContentType}
          style={styles.inputField}
        />
        {secureTextEntry ? (
          <PressableScale
            onPress={() => setHidden((v) => !v)}
            hitSlop={10}
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </PressableScale>
        ) : null}
      </View>
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
          <PressableScale
            key={lang}
            onPress={() => setLanguage(lang)}
            haptic
            style={[styles.langChip, active && styles.langChipActive]}
          >
            <Text
              style={[
                styles.langLabel,
                onDark && !active && { color: colors.textOnDarkMuted },
                active && { color: colors.textOnAccent },
              ]}
            >
              {lang.toUpperCase()}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

/** Ink header with a back arrow for screens pushed on the root stack. */
export function SubpageHeader({
  title,
  onBack,
  topInset,
}: {
  title: string;
  onBack: () => void;
  topInset: number;
}) {
  return (
    <View style={[styles.subpageHeader, { paddingTop: topInset + 6 }]}>
      <PressableScale
        onPress={onBack}
        hitSlop={12}
        style={styles.subpageBack}
        accessibilityLabel="Back"
      >
        <Ionicons name="chevron-back" size={24} color={colors.textOnDark} />
      </PressableScale>
      <Text style={styles.subpageTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.subpageBack} />
    </View>
  );
}

/** Compact centered chip, used for the time slot grid. */
export function Chip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      style={styles.chip}
    >
      <Text style={styles.chipLabel}>{label}</Text>
    </PressableScale>
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
    fontSize: 30,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fonts.regular,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  pill: {
    borderRadius: radii.pill,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  pillDisabled: {
    opacity: 0.45,
  },
  pillLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    lineHeight: 22,
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
    lineHeight: 22,
    flexShrink: 1,
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
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.row,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
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
  subpageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  subpageBack: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subpageTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.textOnDark,
    fontSize: 17,
    fontFamily: fonts.bold,
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
