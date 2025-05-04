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
  
    // Helper to pick a base then tweak depending on precipitation (rain/snow) or theme
    const tune = (baseLight: string, baseDark: string, factor = 0) =>
      isDark ? adjustColor(baseDark, factor) : adjustColor(baseLight, factor);
  
    // Util to map temperature 45F-100F -> 0-1
    const tempFactor = typeof temperature === 'number' ? Math.min(1, Math.max(0, (temperature - 45) / 55)) : 0;
  
    // Thunderstorm – deep indigo / electric purple
    if (forecast.includes('thunderstorm')) {
      // Slightly brighten as precipitation climbs (more lightning means brighter)
      const pct = precipitation / 100;
      return tune('#4F46E5', '#312E81', pct * 0.25);
    }
  
    // Rain / Showers – steel blue range, darker with higher precipitation
    if (forecast.includes('rain') || forecast.includes('shower')) {
      const pct = precipitation / 100;
      // For dark mode darken, for light mode darken a touch as well
      return tune('#93C5FD', '#1E3A8A', -pct * 0.35);
    }
  
    // Wind – teal / sky
    if (forecast.includes('wind')) {
      return tune('#A5F3FC', '#164E63');
    }
  
    // Snow – icy light blue / slate
    if (forecast.includes('snow')) {
      const pct = precipitation / 100;
      return tune('#E0F2FE', '#1E293B', -pct * 0.2);
    }
  
    // Clouds – warm grey palette
    if (forecast.includes('cloud')) {
      return tune('#E5E7EB', '#374151');
    }
  
    // Use sky blue palette for sunny variants - enhanced with temperature-based brightness
    // For temps above 50 in dark mode, make it brighter and more vibrant
    const getBaseSkyColor = () => {
      const isHighTemp = typeof temperature === 'number' && temperature >= 50;
      
      // For dark mode and high temps, use a much brighter blue
      if (isDark && isHighTemp) {
        return '#2563EB'; // A brighter, more vibrant blue for dark mode
      }
      
      // Standard colors for other cases
      return isDark ? '#1E3A8A' : '#93C5FD';
    };
    
    const baseSky = getBaseSkyColor();
  
    if (forecast.includes('mostly sunny')) {
      return isDark && typeof temperature === 'number' && temperature >= 50
        ? adjustColor(baseSky, 0.1) // brighter for high temps in dark mode
        : adjustColor(baseSky, -0.05); // standard adjustment otherwise
    }
  
    if (forecast.includes('partly sunny')) {
      return isDark && typeof temperature === 'number' && temperature >= 50
        ? adjustColor(baseSky, 0.15) // brighter for high temps in dark mode
        : adjustColor(baseSky, 0.06); // standard adjustment otherwise
    }
  
    if (forecast.includes('sun') || forecast.includes('clear')) {
      return isDark && typeof temperature === 'number' && temperature >= 50
        ? mixColors(baseSky, '#4F46E5', 0.3) // blend with indigo for a richer high-temp sky
        : baseSky;
    }
  
    // Default – subtle slate
    return isDark ? '#1E293B' : '#F3F4F6';
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
  