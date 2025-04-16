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
  lastFetchTime: number | null;
}

export const useWeatherStore = create<WeatherState>(() => ({
  currentTemp: null,
  forecast: [],
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
  const pointsResponse = await fetch(
    `https://api.weather.gov/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`
  );
  const pointsData = await pointsResponse.json();
  
  // Step 3: Get forecast
  const forecastResponse = await fetch(pointsData.properties.forecast);
  const forecastData = await forecastResponse.json();
  
  // Update store with current temperature and last fetch time
  const currentPeriod = forecastData.properties.periods[0];
  
  useWeatherStore.setState({
    currentTemp: currentPeriod.temperature,
    forecast: forecastData.properties.periods,
    lastFetchTime: Date.now(),
  });
  
  return forecastData;
}
