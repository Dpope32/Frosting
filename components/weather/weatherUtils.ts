import { ColorSchemeName } from 'react-native';

// Function to get weather icon based on short forecast
export const getWeatherIcon = (shortForecast: string): string => {
  const forecastLower = shortForecast.toLowerCase();
  if (forecastLower.includes("thunderstorm")) return "⛈️";
  if (forecastLower.includes("rain") || forecastLower.includes("showers")) return "🌧️";
  if (forecastLower.includes("snow")) return "❄️";
  if (forecastLower.includes("sleet")) return "🌨️";
  if (forecastLower.includes("fog") || forecastLower.includes("haze")) return "🌫️";
  if (forecastLower.includes("cloudy")) return "☁️";
  if (forecastLower.includes("mostly sunny") || forecastLower.includes("partly cloudy")) return "🌤️"; // Or "🌥️"
  if (forecastLower.includes("sunny") || forecastLower.includes("clear")) return "☀️";
  return "❓"; // Default case
};

// Function to determine card background color
export const getCardBackground = (
  shortForecast: string,
  isDark: boolean,
  precipitation: number
): string => {
  const forecastLower = shortForecast.toLowerCase();

  const basePrecipitationColor = isDark ? "#34495e" : "#7f8c8d";
  const baseCloudyColor = isDark ? "#485461" : "#b0bec5";
  // Make the dark mode sunny color slightly lighter for better contrast
  const baseSunnyColor = isDark ? "#2a4a75" : "#87CEEB"; // Lighter dark blue
  const basePartlyColor = isDark ? "#2c3e50" : "#a4b0be";
  const baseSnowColor = isDark ? "#546e7a" : "#e0e0e0";
  const baseFogHazeColor = isDark ? "#607d8b" : "#cfd8dc";

  if (precipitation > 30 || forecastLower.includes("rain") || forecastLower.includes("showers") || forecastLower.includes("thunderstorm")) {
    return basePrecipitationColor;
  }
  if (forecastLower.includes("snow") || forecastLower.includes("sleet")) {
    return baseSnowColor;
  }
  if (forecastLower.includes("fog") || forecastLower.includes("haze")) {
    return baseFogHazeColor;
  }
  if (forecastLower.includes("mostly cloudy") || forecastLower.includes("cloudy")) {
     return baseCloudyColor;
  }
   if (forecastLower.includes("partly cloudy") || forecastLower.includes("mostly sunny")) {
     return basePartlyColor;
  }
  if (forecastLower.includes("sunny") || forecastLower.includes("clear")) {
    return baseSunnyColor;
  }
  return isDark ? "#2c3a4a" : "#b0bec5";
};

// Function to determine text color based on background
export const getTextColorForBackground = (backgroundColor: string): string => {
  // Specific override for the potentially problematic dark blue range
  // If background is dark blueish, force white text
  if (backgroundColor.startsWith("#") && backgroundColor.length >= 6) {
      const r = parseInt(backgroundColor.substring(1, 3), 16);
      const g = parseInt(backgroundColor.substring(3, 5), 16);
      const b = parseInt(backgroundColor.substring(5, 7), 16);
      // Check if it's a dark color, especially if blue is dominant
      if (r < 100 && g < 120 && b > 90) { // Heuristic for dark blues
          return "#FFFFFF"; // Force white text
      }
  }

  // Original Luminance calculation as fallback
  const hex = backgroundColor.replace("#", "");
  if (hex.length !== 6) return "#000000"; // Default for invalid hex
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Slightly adjust threshold? Maybe 0.55? Let's try 0.5 first after the override.
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

// Function to get temperature color
export const getTemperatureColor = (temp: number, isDark: boolean): string => {
  if (temp >= 90) return isDark ? "#ff8a65" : "#e65100"; // Hot - Deep Orange
  if (temp >= 80) return isDark ? "#ffb74d" : "#f57c00"; // Warm - Orange
  if (temp >= 70) return isDark ? "#fff176" : "#fbc02d"; // Mild - Yellow
  if (temp >= 60) return isDark ? "#aed581" : "#689f38"; // Comfortable - Light Green
  if (temp >= 50) return isDark ? "#90caf9" : "#1976d2"; // Cool - Light Blue
  if (temp >= 40) return isDark ? "#64b5f6" : "#0288d1"; // Chilly - Blue
  if (temp >= 30) return isDark ? "#4fc3f7" : "#0277bd"; // Cold - Lighter Blue
  return isDark ? "#81d4fa" : "#01579b"; // Very Cold - Cyan/Deep Blue
}; 