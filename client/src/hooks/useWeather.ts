import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

export interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  logicState: boolean;
}

export function useWeather() {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 0,
    condition: 'Unknown',
    location: 'Unknown',
    logicState: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('GET', '/api/weather');
      const data = await response.json();
      
      setWeatherData({
        temperature: data.temperature,
        condition: data.condition,
        location: data.location,
        logicState: data.logicState
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    
    // Auto-refresh weather data every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return {
    weatherData,
    isLoading,
    error,
    refreshWeather: fetchWeather
  };
}
