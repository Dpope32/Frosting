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

export type Colors = ReturnType<typeof getColors>;

export const getColors = (isDark: boolean, primaryColor: string) => ({
  bg: isDark ? '#181A20' : '#fff',
  card: isDark ? '#23262F' : '#F7F8FA',
  border: isDark ? '#333' : '#E3E5E8',
  text: isDark ? '#fff' : '#181A20',
  subtext: isDark ? '#aaa' : '#666',
  accent: isDark ? "rgb(0, 255, 255)" : primaryColor,
  accent2: isDark ? "rgb(0, 255, 255)" : primaryColor,
  accentBg: isDark ? `${primaryColor}33` : `${primaryColor}18`,
  gray: isDark ? '#333' : '#E3E5E8',
  error: '#E74C3C',
  success: 'rgb(34, 157, 36)',
  successBgLight: 'rgba(32, 89, 33, 0.1)',
  successBgDark: 'rgba(3, 49, 4, 0.2)',
  successBorder: 'rgba(0, 255, 4, 0.3)',
  successText: isDark ? 'rgba(57, 245, 60, 0.8)' : 'rgba(44, 187, 46, 0.8)',
  disabled: isDark ? 'rgba(231, 14, 14, 0.1)' : 'rgba(208, 18, 18, 0.1)',
  disabledBg: isDark ? 'rgba(231, 14, 14, 0.1)' : 'rgba(208, 18, 18, 0.2)',
  disabledText: isDark ? 'rgba(253, 32, 32, 0.74)' : 'rgba(208, 18, 18, 0.5)',
  disabledBorder: isDark ? 'rgba(231, 14, 14, 0.3)' : 'rgba(208, 18, 18, 0.3)',
});


