export function getWeatherIcon(shortForecast: string): string {
    const forecast = shortForecast.toLowerCase();
    if (forecast.includes("thunderstorm")) return "⚡";
    if (forecast.includes("rain")) return "🌧";
    if (forecast.includes("cloud")) return "☁️";
    if (forecast.includes("sun")) return "☀️";
    if (forecast.includes("clear")) return "🌞";
    if (forecast.includes("snow")) return "❄️";
    if (forecast.includes("wind")) return "💨";
    return "🌡";
  }
  
  // Utility: lighten or darken a hex colour by a percentage
  export function adjustColor(hex: string, percent: number): string {
    // Clamp percent between -1 and 1
    const p = Math.max(-1, Math.min(1, percent));
    // Remove # if present
    const cleanHex = hex.replace('#', '');
    // Parse r g b
    const num = parseInt(cleanHex.length === 3 ? cleanHex.split('').map(c => c + c).join('') : cleanHex, 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;
  
    // Apply adjustment
    r = Math.round(r + (p < 0 ? r * p : (255 - r) * p));
    g = Math.round(g + (p < 0 ? g * p : (255 - g) * p));
    b = Math.round(b + (p < 0 ? b * p : (255 - b) * p));
  
    const toHex = (v: number) => v.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  
  // Blend two hex colours by a factor (0 -> color1, 1 -> color2)
  export function mixColors(hex1: string, hex2: string, factor: number): string {
    const clamp = (n: number) => Math.min(255, Math.max(0, n));
    const parseHex = (h: string) => {
      const clean = h.replace('#','');
      const num = parseInt(clean.length === 3 ? clean.split('').map(c=>c+c).join('') : clean, 16);
      return { r: (num>>16)&0xff, g:(num>>8)&0xff, b:num&0xff };
    };
    const c1 = parseHex(hex1);
    const c2 = parseHex(hex2);
    const r = clamp(Math.round(c1.r + (c2.r - c1.r) * factor));
    const g = clamp(Math.round(c1.g + (c2.g - c1.g) * factor));
    const b = clamp(Math.round(c1.b + (c2.b - c1.b) * factor));
    const toHex = (v: number) => v.toString(16).padStart(2,'0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  
  type TempParam = number | null | undefined;
  
  export function getCardBackground(
    shortForecast: string,
    isDark: boolean,
    precipitation = 0,
    temperature: TempParam = undefined
  ): string {
    const forecast = shortForecast.toLowerCase();
    const pct = precipitation / 100;
    // For snow, use icy blue
    if (forecast.includes('snow')) {
      return mixColors('#e0f7fa', '#90caf9', pct * 0.5); // 0=icy, 1=blue
    }
    // For thunderstorms and rain/showers, use a much darker blue
    if (forecast.includes('thunderstorm') || forecast.includes('shower') || forecast.includes('rain')) {
      // Deep storm blue for high precipitation, medium blue for low
      return mixColors('#3b4a6b', '#101c2c', pct * 0.85); // 0=medium, 1=deep
    }
    // For all other weather, use blue scaling with precipitation
    return mixColors('#b6e0fe', '#2563eb', pct * 0.85);
  }
  
  export function getTextColorForBackground(backgroundColor: string): string {
    'worklet';
  
    let r = 0, g = 0, b = 0;
  
    if (backgroundColor.startsWith('#')) {
      const hex = backgroundColor.replace('#', '');
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
    } else if (backgroundColor.startsWith('rgb')) {
      const match = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
      if (match) {
        r = parseInt(match[1], 10);
        g = parseInt(match[2], 10);
        b = parseInt(match[3], 10);
      }
    }
  
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1f2937' : '#f9fafb';
  }
  
 export function parseWindSpeed(speed: string | undefined): number {
    if (!speed) return 0;
    const match = speed.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }
  