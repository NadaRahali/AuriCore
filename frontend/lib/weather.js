/**
 * Weather Service
 * Integrates with OpenWeatherMap API for weather data
 */

const WEATHER_API_KEY = '2d0a7b8175429dda3d7ac8e4f835b1a4';
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Get current weather for a location
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<{data, error}>}
 */
export const getCurrentWeather = async (latitude, longitude) => {
  try {
    if (!latitude || !longitude) {
      return { data: null, error: { message: 'Latitude and longitude are required' } };
    }

    const url = `${WEATHER_API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        data: null, 
        error: { message: errorData.message || `Weather API error: ${response.status}` } 
      };
    }

    const weatherData = await response.json();

    // Transform to our format
    const transformed = {
      temperature: Math.round(weatherData.main?.temp || 0),
      feelsLike: Math.round(weatherData.main?.feels_like || 0),
      humidity: weatherData.main?.humidity || 0,
      pressure: weatherData.main?.pressure || 0,
      description: weatherData.weather?.[0]?.description || '',
      main: weatherData.weather?.[0]?.main || '', // Clear, Clouds, Rain, etc.
      icon: weatherData.weather?.[0]?.icon || '',
      windSpeed: weatherData.wind?.speed || 0,
      windDirection: weatherData.wind?.deg || 0,
      visibility: weatherData.visibility || 0,
      cloudiness: weatherData.clouds?.all || 0,
      sunrise: weatherData.sys?.sunrise ? new Date(weatherData.sys.sunrise * 1000).toISOString() : null,
      sunset: weatherData.sys?.sunset ? new Date(weatherData.sys.sunset * 1000).toISOString() : null,
      location: {
        name: weatherData.name || '',
        country: weatherData.sys?.country || '',
        latitude,
        longitude,
      },
      timestamp: new Date().toISOString(),
      raw: weatherData, // Keep raw data for reference
    };

    return { data: transformed, error: null };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Get weather forecast for a location
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} days - Number of days to forecast (1-5, default: 5)
 * @returns {Promise<{data, error}>}
 */
export const getWeatherForecast = async (latitude, longitude, days = 5) => {
  try {
    if (!latitude || !longitude) {
      return { data: null, error: { message: 'Latitude and longitude are required' } };
    }

    const url = `${WEATHER_API_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&cnt=${Math.min(days * 8, 40)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        data: null, 
        error: { message: errorData.message || `Weather API error: ${response.status}` } 
      };
    }

    const forecastData = await response.json();

    // Transform forecast list
    const forecast = (forecastData.list || []).map(item => ({
      date: new Date(item.dt * 1000).toISOString(),
      temperature: Math.round(item.main?.temp || 0),
      feelsLike: Math.round(item.main?.feels_like || 0),
      humidity: item.main?.humidity || 0,
      pressure: item.main?.pressure || 0,
      description: item.weather?.[0]?.description || '',
      main: item.weather?.[0]?.main || '',
      icon: item.weather?.[0]?.icon || '',
      windSpeed: item.wind?.speed || 0,
      windDirection: item.wind?.deg || 0,
      cloudiness: item.clouds?.all || 0,
      precipitation: item.rain?.['3h'] || item.snow?.['3h'] || 0,
    }));

    const transformed = {
      location: {
        name: forecastData.city?.name || '',
        country: forecastData.city?.country || '',
        latitude,
        longitude,
      },
      forecast,
      timestamp: new Date().toISOString(),
    };

    return { data: transformed, error: null };
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Get historical weather for a specific timestamp
 * Note: OpenWeatherMap free tier doesn't support historical data
 * This is a placeholder for when you upgrade to a paid plan
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {Date|string|number} timestamp - Timestamp to get weather for
 * @returns {Promise<{data, error}>}
 */
export const getWeatherAtTime = async (latitude, longitude, timestamp) => {
  try {
    // OpenWeatherMap free tier doesn't support historical data
    // This would require the One Call API 3.0 with historical data subscription
    // For now, return current weather as placeholder
    
    console.warn('Historical weather data requires OpenWeatherMap paid plan. Returning current weather as placeholder.');
    
    return await getCurrentWeather(latitude, longitude);
    
    // TODO: When you have paid plan, use this:
    // const unixTimestamp = timestamp instanceof Date 
    //   ? Math.floor(timestamp.getTime() / 1000)
    //   : typeof timestamp === 'string' 
    //     ? Math.floor(new Date(timestamp).getTime() / 1000)
    //     : timestamp;
    // 
    // const url = `${WEATHER_API_BASE_URL}/onecall/timemachine?lat=${latitude}&lon=${longitude}&dt=${unixTimestamp}&appid=${WEATHER_API_KEY}&units=metric`;
    // const response = await fetch(url);
    // ...
  } catch (error) {
    console.error('Error fetching weather at time:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Get weather icon name for Ionicons
 * Maps OpenWeatherMap icon codes to Ionicons names
 * @param {string} iconCode - OpenWeatherMap icon code (e.g., '01d', '10n')
 * @returns {string} Ionicons name
 */
export const getWeatherIconName = (iconCode) => {
  if (!iconCode) return 'partly-sunny';
  
  const iconMap = {
    // Clear sky
    '01d': 'sunny', // clear sky day
    '01n': 'moon', // clear sky night
    
    // Few clouds
    '02d': 'partly-sunny', // few clouds day
    '02n': 'cloudy-night', // few clouds night
    
    // Scattered clouds
    '03d': 'cloud',
    '03n': 'cloud',
    
    // Broken clouds
    '04d': 'cloudy',
    '04n': 'cloudy',
    
    // Shower rain
    '09d': 'rainy',
    '09n': 'rainy',
    
    // Rain
    '10d': 'rainy',
    '10n': 'rainy',
    
    // Thunderstorm
    '11d': 'thunderstorm',
    '11n': 'thunderstorm',
    
    // Snow
    '13d': 'snow',
    '13n': 'snow',
    
    // Mist
    '50d': 'cloudy',
    '50n': 'cloudy',
  };
  
  return iconMap[iconCode] || 'partly-sunny';
};

