export function getWeatherIcon(shortForecast: string): string {
    const forecast = shortForecast.toLowerCase();
    if (forecast.includes("thunderstorm")) return "⚡";
    if (forecast.includes("rain") || forecast.includes("shower")) return "🌧";
    if (forecast.includes("mostly cloudy")) return "🌥";
    if (forecast.includes("partly cloudy")) return "⛅";
    if (forecast.includes("cloud")) return "☁️";
    if (forecast.includes("mostly sunny")) return "🌤";
    if (forecast.includes("partly sunny")) return "⛅";
    if (forecast.includes("sunny")) return "☀️";
    if (forecast.includes("clear")) return "🌞";
    if (forecast.includes("snow")) return "❄️";
    if (forecast.includes("wind")) return "💨";
    if (forecast.includes("fog")) return "🌫";
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
    
    // For thunderstorms, use blue with purplish tint for high precipitation, but not too dark in dark mode
    if (forecast.includes('thunderstorm')) {
      // Thunder gets deeper blue with purple undertones, lightened for dark mode
      if (isDark) {
        const baseColor = precipitation > 60 ? '#354780' : '#43568a';
        const deepColor = precipitation > 60 ? '#1f2d4d' : '#233353';
        return mixColors(baseColor, deepColor, pct * 0.7);
      } else {
        const baseColor = precipitation > 60 ? '#2d3a60' : '#3b4a6b';
        const deepColor = precipitation > 60 ? '#101426' : '#101c2c';
        return mixColors(baseColor, deepColor, pct * 0.85);
      }
    }
    
    // For rain/showers, use blue range - lightened for dark mode
    if (forecast.includes('shower') || forecast.includes('rain')) {
      if (isDark) {
        return mixColors('#43568a', '#233353', pct * 0.7); // Lighter blues for dark mode
      } else {
        return mixColors('#3b4a6b', '#101c2c', pct * 0.85); // 0=medium, 1=deep
      }
    }
    
    // For cloudy days, use gray-blue tones - lightened for dark mode
    if (forecast.includes('cloudy')) {
      if (forecast.includes('mostly cloudy')) {
        return isDark ? '#3a465d' : '#a4b0c0'; // Lighter dark mode
      }
      if (forecast.includes('partly cloudy')) {
        return isDark ? '#414c66' : '#b8c4d8'; // Lighter dark mode
      }
      return isDark ? '#3c465b' : '#b0c0d2'; // Lighter dark mode
    }
    
    // For sunny days, use vibrant blues with yellow undertones - lightened for dark mode
    if (forecast.includes('sunny')) {
      if (forecast.includes('mostly sunny')) {
        const tempFactor = temperature && temperature > 80 ? 0.2 : 0;
        return isDark ? mixColors('#275099', '#3168c4', tempFactor) : mixColors('#a7d1ff', '#81bcff', tempFactor);
      }
      if (forecast.includes('partly sunny')) {
        const tempFactor = temperature && temperature > 80 ? 0.2 : 0;
        return isDark ? mixColors('#2d57ad', '#386bd8', tempFactor) : mixColors('#9ac5f8', '#75b5ff', tempFactor);
      }
      // Full sunny - brighter blue in dark mode
      const tempFactor = temperature && temperature > 85 ? 0.3 : (temperature && temperature > 75 ? 0.15 : 0);
      return isDark ? mixColors('#1e4784', '#2c5eac', tempFactor) : mixColors('#b6e0fe', '#93c5fd', tempFactor);
    }
    
    // For clear days, use blue but not too deep in dark mode
    if (forecast.includes('clear')) {
      return isDark ? '#1d3674' : '#bfdbfe'; // Lighter dark mode
    }
    
    // For foggy conditions
    if (forecast.includes('fog')) {
      return isDark ? '#374151' : '#d1d5db';
    }
    
    // Default case - blue scaling with precipitation
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

export function getPrecipitationColor(precipitationPercent: number, isDark: boolean): string {
  if (precipitationPercent <= 0) return isDark ? '#94a3b8' : '#64748b'; // Slate colors for 0%
  if (precipitationPercent < 30) return isDark ? '#7dd3fc' : '#0284c7'; // Light blue for low chance
  if (precipitationPercent < 60) return isDark ? '#38bdf8' : '#0369a1'; // Medium blue for medium chance
  if (precipitationPercent < 80) return isDark ? '#0ea5e9' : '#0c4a6e'; // Darker blue for high chance
  return isDark ? '#0284c7' : '#0c4a6e'; // Deep blue for very high chance
}

export function getCloudCount(shortForecast: string): number {
  const forecast = shortForecast.toLowerCase();
  if (forecast.includes('clear') || forecast.includes('sunny') && !forecast.includes('partly') && !forecast.includes('mostly')) {
    return 0;
  }
  if (forecast.includes('mostly sunny') || forecast.includes('mostly clear')) {
    return 2;
  }
  if (forecast.includes('partly sunny') || forecast.includes('partly cloudy')) {
    return 4;
  }
  if (forecast.includes('mostly cloudy')) {
    return 6;
  }
  if (forecast.includes('cloudy') && !forecast.includes('partly') && !forecast.includes('mostly')) {
    return 8;
  }
  if (forecast.includes('overcast')) {
    return 10;
  }
  // Default for unspecified conditions
  return 3;
}

export function getSunIntensity(shortForecast: string, temperature: number | undefined): number {
  const forecast = shortForecast.toLowerCase();
  
  // Base intensity on weather condition
  let intensity = 0;
  if (forecast.includes('clear')) intensity = 1.0;
  else if (forecast.includes('sunny') && !forecast.includes('partly') && !forecast.includes('mostly')) intensity = 0.95;
  else if (forecast.includes('mostly sunny')) intensity = 0.8;
  else if (forecast.includes('partly sunny')) intensity = 0.6;
  else if (forecast.includes('partly cloudy')) intensity = 0.4;
  else if (forecast.includes('mostly cloudy')) intensity = 0.2;
  else intensity = 0;
  
  // Adjust for temperature if available
  if (temperature) {
    if (temperature > 90) intensity *= 1.2;
    else if (temperature > 85) intensity *= 1.15;
    else if (temperature > 80) intensity *= 1.1;
  }
  
  return Math.min(1, intensity); // Cap at 1.0 max intensity
}
