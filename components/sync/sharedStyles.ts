export const baseSpacing = 8;
export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
};
export const cardRadius = 12;
export const buttonRadius = 20;
export const getColors = (isDark: boolean, primaryColor: string) => ({
  bg: isDark ? '#181A20' : '#fff',
  card: isDark ? '#23262F' : '#F7F8FA',
  border: isDark ? '#333' : '#E3E5E8',
  text: isDark ? '#fff' : '#181A20',
  subtext: isDark ? '#aaa' : '#666',
  accent: primaryColor,
  accentBg: isDark ? `${primaryColor}33` : `${primaryColor}18`,
  error: '#E74C3C',
  success: '#27AE60',
  disabled: isDark ? '#333' : '#eee',
});