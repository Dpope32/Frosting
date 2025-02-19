// src/stores/WeatherStore.ts
import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';

interface WeatherPeriod {
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
 // console.log('[WeatherStore] useWeatherQuery called with ZIP:', zipCode);
  
  return useQuery({
    queryKey: ['weather', zipCode],
    queryFn: async () => {
    //  console.log('[WeatherStore] queryFn executing for ZIP:', zipCode);
      
      const lastFetchTime = useWeatherStore.getState().lastFetchTime;
      const now = Date.now();
      
      if (lastFetchTime && now - lastFetchTime < ONE_HOUR) {
        console.log(' ✅Using cached data for weather, :) less than 1 hour old');
        return null;
      }
      
      if (!zipCode) {
        console.error('[WeatherStore] No ZIP code provided');
        throw new Error('No ZIP code provided');
      }

      // Step 1: Get coordinates
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${zipCode}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();
      
      if (!geoData.results?.[0]) {
        console.error('[WeatherStore] Location not found for ZIP:', zipCode);
        throw new Error('Location not found');
      }
      
      const { latitude, longitude } = geoData.results[0];
      
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
     // console.log('[WeatherStore] Setting temperature:', currentPeriod.temperature);
      
      useWeatherStore.setState({
        currentTemp: currentPeriod.temperature,
        forecast: forecastData.properties.periods,
        lastFetchTime: now,
      });
      
      return forecastData;
    },
    enabled: Boolean(zipCode),
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
