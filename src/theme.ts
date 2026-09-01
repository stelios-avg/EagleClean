/**
 * Cleanovox design tokens — ink + the exact turquoise from the
 * category icons (`#30CCCC`), not gold or generic app-blue.
 */
export const colors = {
  ink: '#0E1414',
  inkSoft: '#141C1C',
  accent: '#30CCCC',
  accentDeep: '#1A8F8F',
  accentSoft: '#D4F4F4',
  accentStart: '#5EE0E0',
  accentEnd: '#22B8B8',
  textOnAccent: '#072424',
  success: '#3F7D4E',
  page: '#F3FAFA',
  background: '#F7FCFC',
  surface: '#E6F3F3',
  border: '#CDE6E6',
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
  card: 28,
  row: 18,
  pill: 999,
};

export const spacing = {
  screen: 20,
};
