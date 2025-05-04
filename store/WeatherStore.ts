// src/stores/WeatherStore.ts
import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import { validateZipCode, FALLBACK_ZIP_CODES } from '../utils/zipCodeValidator';

export interface WeatherPeriod {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  detailedForecast: string;
  icon: string;
  windSpeed: string;
  windDirection: string;
  probabilityOfPrecipitation: {
    value: number | null;
    unitCode: string;
  };
}

interface WeatherState {
  currentTemp: number | null;
  forecast: WeatherPeriod[];
  hourlyForecast?: WeatherPeriod[];
  lastFetchTime: number | null;
}

export const useWeatherStore = create<WeatherState>(() => ({
  currentTemp: null,
  forecast: [],
  hourlyForecast: [],
  lastFetchTime: null,
}));

const ONE_HOUR = 1000 * 60 * 60;

export const useWeatherQuery = (zipCode: string | null | undefined) => {
  // Validate the ZIP code
  const zipValidation = validateZipCode(zipCode);
  
  // If invalid, use a fallback ZIP code (Dallas)
  const validZipCode = zipValidation.isValid ? zipCode : FALLBACK_ZIP_CODES.DEFAULT;
  
  return useQuery({
    queryKey: ['weather', validZipCode],
    queryFn: async () => {
      const lastFetchTime = useWeatherStore.getState().lastFetchTime;
      const now = Date.now();
      
      if (lastFetchTime && now - lastFetchTime < ONE_HOUR) {
        return null;
      }
      
      if (!validZipCode) {
        console.error('[WeatherStore] No ZIP code provided');
        throw new Error('No ZIP code provided');
      }

      try {
        // Step 1: Get coordinates
        const geoResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${validZipCode}&count=1&language=en&format=json`
        );
        const geoData = await geoResponse.json();

        if (!geoData.results?.[0]) {
          console.warn(`[WeatherStore] Location not found for ZIP: ${validZipCode}, falling back to Dallas`);
          // If location not found, try with Dallas ZIP code
          const fallbackResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${FALLBACK_ZIP_CODES.DEFAULT}&count=1&language=en&format=json`
          );
          const fallbackData = await fallbackResponse.json();
          
          if (!fallbackData.results?.[0]) {
            throw new Error('Location not found even with fallback ZIP');
          }
          return await fetchForecastWithCoordinates(fallbackData.results[0]);
        }
        return await fetchForecastWithCoordinates(geoData.results[0]);
        
      } catch (error) {
        console.error('[WeatherStore] Error fetching weather:', error);
        throw error;
      }
      
    },
    enabled: Boolean(validZipCode),
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Helper function to fetch forecast data with given coordinates
 */
async function fetchForecastWithCoordinates(location: { latitude: number; longitude: number }) {
  const { latitude, longitude } = location;

  // Step 2: Get NWS grid points
  const pointsUrl = `https://api.weather.gov/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const pointsResponse = await fetch(pointsUrl);
  const pointsData = await pointsResponse.json();

  // Fetch and log hourly forecast data for inspection
  if (pointsData.properties && pointsData.properties.forecastHourly) {
    try {
      const hourlyUrl = pointsData.properties.forecastHourly;
      const hourlyResponse = await fetch(hourlyUrl);
      const hourlyData = await hourlyResponse.json();

      
      // Store hourly periods in state
      if (hourlyData.properties && Array.isArray(hourlyData.properties.periods)) {

        // Save all hourly periods
        useWeatherStore.setState({ hourlyForecast: hourlyData.properties.periods });
      }
    } catch (error) {
      console.error('[WeatherStore] Error fetching hourly forecast:', error);
    }
  }

  // Step 3: Get forecast
  if (!pointsData.properties || !pointsData.properties.forecast) {
    console.error('[WeatherStore] pointsData missing properties or forecast URL:', pointsData);
    throw new Error('NWS grid points response missing forecast URL');
  }
  const forecastUrl = pointsData.properties.forecast;
  const forecastResponse = await fetch(forecastUrl);
  const forecastData = await forecastResponse.json();

  // Handle "Forecast Grid Expired" error by falling back to Dallas if not already
  if (
    forecastData &&
    forecastData.status === 503 &&
    forecastData.title === "Forecast Grid Expired"
  ) {
    console.warn('[WeatherStore] Forecast grid expired for location:', location);
    // Dallas fallback coordinates
    const dallas = { latitude: 32.7767, longitude: -96.7970 };
    // If already using fallback, throw error
    if (
      Math.abs(location.latitude - dallas.latitude) < 0.01 &&
      Math.abs(location.longitude - dallas.longitude) < 0.01
    ) {
      throw new Error('Forecast grid expired for fallback location (Dallas)');
    }
    return await fetchForecastWithCoordinates(dallas);
  }

  if (!forecastData.properties || !forecastData.properties.periods) {
    console.error('[WeatherStore] forecastData missing properties or periods:', forecastData);
    throw new Error('Forecast data missing periods');
  }

  // Update store with current temperature and last fetch time
  const currentPeriod = forecastData.properties.periods[0];

  useWeatherStore.setState({
    currentTemp: currentPeriod.temperature,
    forecast: forecastData.properties.periods,
    lastFetchTime: Date.now(),
  });

  return forecastData;
}
