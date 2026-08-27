export async function getLiveWeather(lat, lon) {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    return {
      temp: data.main.temp,
      condition: data.weather[0].main,
      windSpeed: data.wind.speed
    };
  } catch (error) {
    console.error("Failed to fetch live weather data", error);
    return null;
  }
}