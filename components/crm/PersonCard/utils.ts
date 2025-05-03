import type { Person } from '@/types/people';

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]}-${match[3]}`;
  }
  return phone;
};

const generateColors = (count: number): string[] => {
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * (360 / count)) % 360;
    return `hsl(${hue}, 65%, 55%)`;
  });
};

const colors = generateColors(24);

export const getColorForPerson = (id: string | undefined): string => {
  if (!id) return colors[0];
  const hash = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((b | (g << 8) | (r << 16)) | 0)
    .toString(16)
    .padStart(6, '0')}`;
};

export const getDarkerHslColor = (hslColor: string): string => {
  const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hslColor;
  const hue = parseInt(match[1], 10);
  const saturation = parseInt(match[2], 10);
  const lightness = parseInt(match[3], 10);
  // Reduce lightness to create darker color
  return `hsl(${hue}, ${saturation}%, ${Math.max(10, lightness - 80)}%)`;
}; 