/**
 * Cleanovox design tokens — airy white surfaces + the turquoise from the
 * category icons (`#30CCCC`), not gold or generic app-blue.
 */
export const colors = {
  ink: '#0E1414',
  inkSoft: '#141C1C',
  accent: '#30CCCC',
  accentDeep: '#1A8F8F',
  accentSoft: '#E7F8F8',
  accentStart: '#5EE0E0',
  accentEnd: '#22B8B8',
  textOnAccent: '#072424',
  success: '#3F7D4E',
  page: '#FFFFFF',
  background: '#FFFFFF',
  surface: '#F3F6F6',
  card: '#F6F8F8',
  border: '#E4EEEE',
  textPrimary: '#101616',
  textSecondary: '#5A6E6E',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255,255,255,0.8)',
  tabInactive: '#8AA0A0',
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
  card: 26,
  row: 20,
  pill: 999,
};

export const spacing = {
  screen: 22,
};

export const shadows = {
  card: {
    shadowColor: '#0E1414',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  bar: {
    shadowColor: '#0E1414',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
};
