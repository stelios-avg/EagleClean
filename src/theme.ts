/**
 * EagleClean design tokens — dark ink chrome, royal blue accent,
 * white content surfaces with soft rounded cards.
 */
export const colors = {
  ink: '#0B0C10',
  inkSoft: '#15171E',
  accent: '#2946F5',
  background: '#FFFFFF',
  surface: '#F5F6FA',
  border: '#E6E8F0',
  textPrimary: '#101218',
  textSecondary: '#697083',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255,255,255,0.8)',
  tabInactive: '#8A8F9E',
};

/**
 * Manrope (loaded in App.tsx). Custom fonts need one family name per weight,
 * so use fontFamily from here instead of fontWeight in styles.
 */
export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
};

export const radii = {
  card: 28,
  row: 18,
  pill: 999,
};

export const spacing = {
  screen: 20,
};
