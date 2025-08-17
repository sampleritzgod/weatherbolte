  import React, { useState, useEffect } from 'react';
  import { Search, Wind, Eye, Droplets, Gauge, MapPin, Calendar, Clock, Sunrise, Sunset, Globe, CloudRain, Star, Heart, RefreshCw, TrendingUp, TrendingDown, Activity, Compass } from 'lucide-react';

  const WeatherSearch = () => {
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [tempUnit, setTempUnit] = useState('C'); // C or F
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [uvIndex, setUvIndex] = useState(null);
    const [airQuality, setAirQuality] = useState(null);

    // Generate mock weather data based on city name
    const generateMockWeatherData = (cityName) => {
      const cityHash = cityName.toLowerCase().split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      const weatherConditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm', 'Drizzle'];
      const weatherIcons = ['01d', '02d', '10d', '13d', '11d', '09d'];
      const countries = {
        'tokyo': 'JP', 'new york': 'US', 'london': 'GB', 'paris': 'FR', 'moscow': 'RU',
        'beijing': 'CN', 'delhi': 'IN', 'mumbai': 'IN', 'sydney': 'AU', 'toronto': 'CA',
        'berlin': 'DE', 'madrid': 'ES', 'rome': 'IT', 'amsterdam': 'NL', 'vienna': 'AT'
      };
      
      const countryCodes = ['US','GB','CA','AU','DE','FR','IT','ES','JP','CN','IN','BR','RU','MX','NL','AT'];
      const country = countries[cityName.toLowerCase()] || countryCodes[Math.abs(cityHash) % countryCodes.length];
      const weatherIndex = Math.abs(cityHash) % weatherConditions.length;
      const baseTemp = 15 + (Math.abs(cityHash) % 20); // Temperature between 15-35°C
      
      return {
        name: cityName,
        sys: { 
          country: country, 
          sunrise: Date.now() / 1000 - 7200, 
          sunset: Date.now() / 1000 + 7200 
        },
        main: { 
          temp: baseTemp, 
          feels_like: baseTemp + 2, 
          temp_min: baseTemp - 3, 
          temp_max: baseTemp + 5, 
          humidity: 40 + (Math.abs(cityHash) % 40), 
          pressure: 1000 + (Math.abs(cityHash) % 50) 
        },
        weather: [{ 
          main: weatherConditions[weatherIndex], 
          description: weatherConditions[weatherIndex].toLowerCase(), 
          icon: weatherIcons[weatherIndex] 
        }],
        wind: { 
          speed: 2 + (Math.abs(cityHash) % 8), 
          deg: Math.abs(cityHash) % 360 
        },
        visibility: 5000 + (Math.abs(cityHash) % 10000),
        coord: { 
          lat: 35 + (Math.abs(cityHash) % 50), 
          lon: -120 + (Math.abs(cityHash) % 240) 
        },
        timezone: -18000 + (Math.abs(cityHash) % 36000)
      };
    };

    const generateMockForecastData = (cityName) => {
      const cityHash = cityName.toLowerCase().split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      const weatherConditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm'];
      const weatherIcons = ['01d', '02d', '10d', '13d', '11d'];
      
      // Generate hourly forecasts for 5 days (120 hours)
      const hourlyForecasts = Array.from({ length: 120 }, (_, i) => {
        const hourHash = (cityHash + i) % 1000;
        const weatherIndex = Math.abs(hourHash) % weatherConditions.length;
        const baseTemp = 15 + (Math.abs(hourHash) % 20);
        const date = new Date(Date.now() + (i * 60 * 60 * 1000)); // Hourly intervals
        
        return {
          dt: date.getTime() / 1000,
          main: { 
            temp: baseTemp, 
            temp_max: baseTemp + 5, 
            temp_min: baseTemp - 3 
          },
          weather: [{ 
            main: weatherConditions[weatherIndex], 
            description: weatherConditions[weatherIndex].toLowerCase(), 
            icon: weatherIcons[weatherIndex] 
          }],
          dt_txt: date.toISOString().replace('T', ' ').slice(0, 19)
        };
      });
      
      // Generate daily forecasts at 12:00:00 for 5 days
      const dailyForecasts = Array.from({ length: 5 }, (_, i) => {
        const dayHash = (cityHash + i) % 1000;
        const weatherIndex = Math.abs(dayHash) % weatherConditions.length;
        const baseTemp = 15 + (Math.abs(dayHash) % 20);
        
        // Create date for tomorrow + i days at 12:00:00
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        date.setHours(12, 0, 0, 0);
        
        // Format as YYYY-MM-DD HH:MM:SS
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dt_txt = `${year}-${month}-${day} 12:00:00`;
        
        return {
          dt: date.getTime() / 1000,
          main: { 
            temp: baseTemp, 
            temp_max: baseTemp + 5, 
            temp_min: baseTemp - 3 
          },
          weather: [{ 
            main: weatherConditions[weatherIndex], 
            description: weatherConditions[weatherIndex].toLowerCase(), 
            icon: weatherIcons[weatherIndex] 
          }],
          dt_txt: dt_txt
        };
      });
      
      return {
        list: [...hourlyForecasts, ...dailyForecasts]
      };
    };

    // Update local time every second when weather data is available
    useEffect(() => {
      if (typeof weatherData?.timezone !== 'number') {
        setCurrentTime(null);
        return;
      }

      const updateTime = () => {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const localTime = new Date(utc + (weatherData.timezone * 1000));
        setCurrentTime(localTime);
      };
      
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }, [weatherData?.timezone]);

    // Load favorites from memory
    useEffect(() => {
      const savedFavorites = JSON.parse(localStorage.getItem('weatherFavorites') || '[]');
      const savedHistory = JSON.parse(localStorage.getItem('weatherHistory') || '[]');
      setFavorites(savedFavorites);
      setSearchHistory(savedHistory);
    }, []);

    const convertTemp = (temp) => {
      if (tempUnit === 'F') {
        return Math.round((temp * 9/5) + 32);
      }
      return Math.round(temp);
    };

    const getWeatherIcon = (iconCode) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    const formatTime = (timestamp, timezone = 0) => {
      const date = new Date(timestamp * 1000);
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const localTime = new Date(utc + (timezone * 1000));
      return localTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    };

    const formatDateTime = (date) => {
      return {
        time: date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          second: '2-digit',
          hour12: true 
        }),
        date: date.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    };

    const getWindDirection = (deg) => {
      const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      return directions[Math.round(deg / 22.5) % 16];
    };

    const getCountryName = (countryCode) => {
      if (!countryCode) return '';
      try {
        if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames !== 'undefined') {
          const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
          const name = regionNames.of(countryCode.toUpperCase());
          if (name) return name;
        }
      } catch (e) {}
      const countries = {
        'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia',
        'DE': 'Germany', 'FR': 'France', 'IT': 'Italy', 'ES': 'Spain', 'JP': 'Japan',
        'CN': 'China', 'IN': 'India', 'BR': 'Brazil', 'RU': 'Russia', 'MX': 'Mexico',
        'NL': 'Netherlands', 'AT': 'Austria'
      };
      return countries[countryCode] || countryCode;
    };

    const addToFavorites = (cityName, country) => {
      const newFavorite = { city: cityName, country, timestamp: Date.now() };
      const updatedFavorites = [...favorites.filter(f => f.city !== cityName), newFavorite];
      setFavorites(updatedFavorites);
      localStorage.setItem('weatherFavorites', JSON.stringify(updatedFavorites));
    };

    const removeFromFavorites = (cityName) => {
      const updatedFavorites = favorites.filter(f => f.city !== cityName);
      setFavorites(updatedFavorites);
      localStorage.setItem('weatherFavorites', JSON.stringify(updatedFavorites));
    };

    const addToHistory = (cityName) => {
      const newHistory = [cityName, ...searchHistory.filter(h => h !== cityName)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('weatherHistory', JSON.stringify(newHistory));
    };

    const handleSearch = async (searchCity = city) => {
      if (!searchCity.trim()) {
        setError('Please enter a city name');
        return;
      }

      setLoading(true);
      setError('');
      
      // Simulate API call with mock data
      setTimeout(() => {
        setWeatherData(generateMockWeatherData(searchCity));
        setForecastData(generateMockForecastData(searchCity));
        addToHistory(searchCity);
        setLoading(false);
      }, 1000);
    };

    const refreshWeather = () => {
      if (weatherData) {
        handleSearch(weatherData.name);
      }
    };

    const getWeatherGradient = (weatherMain) => {
      const gradients = {
        Clear: 'from-amber-400 via-orange-500 to-red-500',
        Clouds: 'from-slate-400 via-gray-500 to-slate-600',
        Rain: 'from-blue-600 via-indigo-700 to-purple-800',
        Snow: 'from-blue-200 via-cyan-300 to-teal-400',
        Thunderstorm: 'from-gray-800 via-purple-900 to-black',
        Drizzle: 'from-gray-500 via-blue-600 to-indigo-700',
        default: 'from-purple-600 via-pink-600 to-red-500'
      };
      return gradients[weatherMain] || gradients.default;
    };

    const getUVIndex = () => Math.floor(Math.random() * 11) + 1;
    const getAirQuality = () => {
      const qualities = [
        { level: 'Good', gradient: 'from-green-400 to-green-600' },
        { level: 'Moderate', gradient: 'from-yellow-400 to-yellow-600' },
        { level: 'Unhealthy for Sensitive Groups', gradient: 'from-orange-400 to-orange-600' },
        { level: 'Unhealthy', gradient: 'from-red-400 to-red-600' }
      ];
      return qualities[Math.floor(Math.random() * qualities.length)];
    };

    const seededRandomInt = (seed, min, max) => {
      const normalized = String(seed).toLowerCase();
      let hash = 0;
      for (let i = 0; i < normalized.length; i++) {
        hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
        hash |= 0;
      }
      const x = Math.abs(Math.sin(hash) * 10000) % 1;
      return Math.floor(x * (max - min + 1)) + min;
    };

    useEffect(() => {
      if (!weatherData) {
        setUvIndex(null);
        setAirQuality(null);
        return;
      }
      const seed = weatherData.name || `${weatherData.coord?.lat},${weatherData.coord?.lon}`;
      const uv = seededRandomInt(`${seed}-uv`, 1, 11);
      setUvIndex(uv);

      const qualities = [
        { level: 'Good', gradient: 'from-green-400 to-green-600' },
        { level: 'Moderate', gradient: 'from-yellow-400 to-yellow-600' },
        { level: 'Unhealthy for Sensitive Groups', gradient: 'from-orange-400 to-orange-600' },
        { level: 'Unhealthy', gradient: 'from-red-400 to-red-600' }
      ];
      const idx = seededRandomInt(`${seed}-aq`, 0, qualities.length - 1);
      setAirQuality(qualities[idx]);
    }, [weatherData?.name, weatherData?.coord?.lat, weatherData?.coord?.lon]);

    const isFavorite = (cityName) => favorites.some(f => f.city === cityName);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 via-transparent to-transparent rounded-full animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-400/20 via-transparent to-transparent rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full animate-bounce" style={{animationDuration: '6s'}}></div>
        </div>

        <div className="relative z-10 p-3 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <CloudRain className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  WeatherPro
                </h1>
              </div>
              <p className="text-gray-300 text-lg mb-6">Advanced weather insights for anywhere in the world</p>
              
              {/* Temperature Unit Toggle */}
              <div className="flex justify-center gap-2 mb-6">
                <button
                  onClick={() => setTempUnit('C')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${tempUnit === 'C' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/20 text-gray-300 hover:bg-white/30'}`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTempUnit('F')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${tempUnit === 'F' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/20 text-gray-300 hover:bg-white/30'}`}
                >
                  °F
                </button>
              </div>
            </div>

            {/* Enhanced Search Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 mb-8 border border-white/20">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search for any city worldwide..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-white/20 focus:border-blue-400 focus:outline-none text-lg transition-all duration-300 bg-white/20 text-white placeholder-gray-300 backdrop-blur-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSearch()}
                      disabled={loading}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none flex items-center gap-2 min-w-[140px]"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          Search
                        </>
                      )}
                    </button>
                    {weatherData && (
                      <button
                        onClick={refreshWeather}
                        className="px-4 py-4 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-all duration-200 backdrop-blur-sm"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Access: Favorites and History */}
                {(favorites.length > 0 || searchHistory.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.length > 0 && (
                      <div>
                        <h4 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Favorites
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {favorites.slice(0, 3).map((fav) => (
                            <button
                              key={fav.city}
                              onClick={() => handleSearch(fav.city)}
                              className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 rounded-lg text-sm transition-all duration-200 flex items-center gap-1"
                            >
                              <Star className="w-3 h-3 fill-current" />
                              {fav.city}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {searchHistory.length > 0 && (
                      <div>
                        <h4 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Recent Searches
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {searchHistory.slice(0, 3).map((city) => (
                            <button
                              key={city}
                              onClick={() => handleSearch(city)}
                              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-all duration-200"
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 animate-pulse backdrop-blur-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Enhanced Loading Animation */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-200/30 border-t-blue-400 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
                </div>
                <p className="text-gray-300 text-xl mt-6 animate-pulse">Fetching weather data...</p>
                <div className="flex gap-1 mt-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}

            {/* Enhanced Weather Data */}
            {weatherData && (
              <div className="space-y-8 animate-fadeIn">
                {/* Main Weather Card with Glass Effect */}
                <div className={`bg-gradient-to-br ${getWeatherGradient(weatherData.weather[0].main)} rounded-3xl shadow-2xl text-white overflow-hidden relative`}>
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                  <div className="relative z-10 p-8">
                    {/* Floating particles effect */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute top-10 left-10 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
                      <div className="absolute top-20 right-20 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-16 left-16 w-3 h-3 bg-white/20 rounded-full animate-bounce"></div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                              <MapPin className="w-8 h-8" />
                            </div>
                            <div>
                              <h2 className="text-4xl font-bold mb-1">{weatherData.name}</h2>
                              <div className="flex items-center gap-2 text-lg opacity-90">
                                <Globe className="w-5 h-5" />
                                <span>{getCountryName(weatherData.sys?.country)}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => isFavorite(weatherData.name) ? removeFromFavorites(weatherData.name) : addToFavorites(weatherData.name, weatherData.sys?.country)}
                            className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all duration-200 backdrop-blur-sm"
                          >
                            <Heart className={`w-6 h-6 ${isFavorite(weatherData.name) ? 'fill-red-400 text-red-400' : ''}`} />
                          </button>
                        </div>
                        
                        {/* Enhanced Local Time Display */}
                        {currentTime && (
                          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-6 max-w-md border border-white/30">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-white/20 rounded-xl">
                                <Clock className="w-5 h-5" />
                              </div>
                              <span className="font-medium opacity-90">Local Time</span>
                            </div>
                            <p className="text-3xl font-bold mb-2">
                              {formatDateTime(currentTime).time}
                            </p>
                            <p className="text-sm opacity-80">
                              {formatDateTime(currentTime).date}
                            </p>
                          </div>
                        )}
                        
                        <p className="text-2xl opacity-90 capitalize mb-2">
                          {weatherData.weather[0].description}
                        </p>
                      </div>

                      <div className="flex flex-col items-center lg:items-end">
                        <img 
                          src={getWeatherIcon(weatherData.weather[0].icon)} 
                          alt="weather icon" 
                          className="w-32 h-32 drop-shadow-2xl mb-4"
                        />
                        <div className="text-center lg:text-right">
                          <div className="text-7xl font-bold mb-2">
                            {convertTemp(weatherData.main.temp)}°{tempUnit}
                          </div>
                          <p className="text-xl opacity-90 mb-4">
                            Feels like {convertTemp(weatherData.main.feels_like)}°{tempUnit}
                          </p>
                          <div className="flex gap-6">
                            <div className="text-center">
                              <div className="flex items-center gap-1 mb-1">
                                <TrendingUp className="w-4 h-4 text-red-400" />
                                <span className="text-sm opacity-75">High</span>
                              </div>
                              <p className="text-2xl font-bold">{convertTemp(weatherData.main.temp_max)}°</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center gap-1 mb-1">
                                <TrendingDown className="w-4 h-4 text-blue-400" />
                                <span className="text-sm opacity-75">Low</span>
                              </div>
                              <p className="text-2xl font-bold">{convertTemp(weatherData.main.temp_min)}°</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Hourly Forecast */}
                {forecastData && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-xl">
                        <Clock className="w-6 h-6" />
                      </div>
                      24-Hour Forecast
                    </h3>
                    <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
                      {forecastData.list.slice(0, 24).map((hour, index) => (
                        <div 
                          key={hour.dt} 
                          className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[110px] shadow-lg hover:shadow-xl hover:bg-white/20 transform hover:scale-105 transition-all duration-300 border border-white/10"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <p className="text-sm font-medium text-gray-300 mb-3">
                            {formatTime(hour.dt, weatherData.timezone)}
                          </p>
                          <img 
                            src={getWeatherIcon(hour.weather[0].icon)} 
                            alt="weather icon" 
                            className="w-16 h-16 mx-auto mb-3 drop-shadow-lg"
                          />
                          <p className="text-xl font-bold text-white mb-2">
                            {convertTemp(hour.main.temp)}°
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {hour.weather[0].description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Enhanced 5-Day Forecast */}
                  {forecastData && (
                    <div className="xl:col-span-2 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                          <Calendar className="w-6 h-6" />
                        </div>
                        5-Day Extended Forecast
                      </h3>
                      <div className="space-y-4">
                        {forecastData.list.filter(item => item.dt_txt?.includes("12:00:00")).slice(0, 5).map((day, index) => (
                          <div 
                            key={day.dt} 
                            className="flex items-center justify-between p-5 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-[1.02] border border-white/10 group"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex items-center gap-4">
                              <img 
                                src={getWeatherIcon(day.weather[0].icon)} 
                                alt="weather icon" 
                                className="w-16 h-16 drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                              />
                              <div>
                                <p className="font-bold text-white text-lg">
                                  {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' })}
                                </p>
                                <p className="text-sm text-gray-300 capitalize">{day.weather[0].description}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(day.dt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white text-xl">
                                <span className="text-2xl">{convertTemp(day.main.temp_max)}°</span>
                                <span className="text-gray-400 ml-3 text-lg">{convertTemp(day.main.temp_min)}°</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Weather Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white">Weather Details</h3>
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 text-sm backdrop-blur-sm"
                      >
                        {showAdvanced ? 'Basic' : 'Advanced'}
                      </button>
                    </div>
                    
                    <WeatherDetailCard 
                      icon={<Sunrise className="w-6 h-6" />}
                      title="Sunrise"
                      value={formatTime(weatherData.sys.sunrise, weatherData.timezone)}
                      gradient="from-orange-400 via-red-500 to-pink-500"
                      delay="0ms"
                    />
                    
                    <WeatherDetailCard 
                      icon={<Sunset className="w-6 h-6" />}
                      title="Sunset"
                      value={formatTime(weatherData.sys.sunset, weatherData.timezone)}
                      gradient="from-purple-400 via-pink-500 to-red-500"
                      delay="100ms"
                    />
                    
                    <WeatherDetailCard 
                      icon={<Wind className="w-6 h-6" />}
                      title="Wind"
                      value={`${getWindDirection(weatherData.wind.deg)} ${weatherData.wind.speed.toFixed(1)} m/s`}
                      gradient="from-cyan-400 via-blue-500 to-indigo-500"
                      delay="200ms"
                    />
                    
                    <WeatherDetailCard 
                      icon={<Droplets className="w-6 h-6" />}
                      title="Humidity"
                      value={`${weatherData.main.humidity}%`}
                      gradient="from-teal-400 via-blue-500 to-cyan-500"
                      delay="300ms"
                    />
                    
                    <WeatherDetailCard 
                      icon={<Eye className="w-6 h-6" />}
                      title="Visibility"
                      value={`${(weatherData.visibility / 1000).toFixed(1)} km`}
                      gradient="from-gray-400 via-gray-500 to-gray-600"
                      delay="400ms"
                    />
                    
                    <WeatherDetailCard 
                      icon={<Gauge className="w-6 h-6" />}
                      title="Pressure"
                      value={`${weatherData.main.pressure} hPa`}
                      gradient="from-indigo-400 via-purple-500 to-pink-500"
                      delay="500ms"
                    />
                    
                    <WeatherDetailCard 
                      icon={<Activity className="w-6 h-6" />}
                      title="UV Index"
                      value={uvIndex !== null ? `${uvIndex}/11` : '—'}
                      gradient="from-yellow-400 via-orange-500 to-red-500"
                      delay="600ms"
                    />
                    
                    <WeatherDetailCard 
                      icon={<Compass className="w-6 h-6" />}
                      title="Air Quality"
                      value={airQuality?.level || 'Good'}
                      gradient={airQuality?.gradient || 'from-green-400 to-green-600'}
                      delay="700ms"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out;
          }
          
          .animate-slideUp {
            animation: slideUp 0.6s ease-out forwards;
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animate-pulse {
            animation: pulse 2s ease-in-out infinite;
          }
          
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    );
  };

  const WeatherDetailCard = ({ icon, title, value, gradient, delay = "0ms" }) => (
    <div 
      className={`bg-gradient-to-r ${gradient} rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden backdrop-blur-sm border border-white/10`}
      style={{ animationDelay: delay }}
    >
      <div className="p-4 text-white relative">
        <div className="absolute top-2 right-2 opacity-20">
          {React.cloneElement(icon, { className: "w-8 h-8" })}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <p className="text-sm font-medium opacity-90">{title}</p>
          </div>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );

  export default WeatherSearch;