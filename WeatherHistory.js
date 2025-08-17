import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  Clock, 
  MapPin, 
  Thermometer, 
  Wind, 
  Droplets, 
  Eye, 
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  CloudDrizzle,
  History,
  Search,
  TrendingUp,
  Activity
} from 'lucide-react';

const WeatherHistory = () => {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, city, temperature

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError('');
        
        const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
        const response = await axios.get(`${apiBase}/weather/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setHistory(response.data);
        setFilteredHistory(response.data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError(err.response?.data?.message || 'Failed to fetch weather history');
        
        // Fallback to mock data for demonstration
        const mockHistory = [
          {
            city: "London",
            date: "2024-01-15T10:30:00Z",
            weather: {
              weather: [{ main: "Clear", description: "clear sky", icon: "01d" }],
              main: { temp: 18, feels_like: 16, humidity: 65, pressure: 1013 },
              wind: { speed: 3.5, deg: 240 },
              visibility: 10000
            }
          },
          {
            city: "New York",
            date: "2024-01-14T15:45:00Z",
            weather: {
              weather: [{ main: "Rain", description: "light rain", icon: "10d" }],
              main: { temp: 12, feels_like: 10, humidity: 85, pressure: 1008 },
              wind: { speed: 4.2, deg: 180 },
              visibility: 8000
            }
          }
        ];
        setHistory(mockHistory);
        setFilteredHistory(mockHistory);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchHistory();
    } else {
      setLoading(false);
      setError('Authentication required');
    }
  }, [token]);

  useEffect(() => {
    let filtered = history.filter(item =>
      item.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'city':
          return a.city.localeCompare(b.city);
        case 'temperature':
          return b.weather.main.temp - a.weather.main.temp;
        case 'date':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    setFilteredHistory(filtered);
  }, [history, searchTerm, sortBy]);

  const getWeatherIcon = (weatherMain) => {
    const iconProps = { className: "w-8 h-8" };
    switch (weatherMain?.toLowerCase()) {
      case 'clear':
        return <Sun {...iconProps} className="w-8 h-8 text-yellow-500" />;
      case 'clouds':
        return <Cloud {...iconProps} className="w-8 h-8 text-gray-500" />;
      case 'rain':
        return <CloudRain {...iconProps} className="w-8 h-8 text-blue-500" />;
      case 'drizzle':
        return <CloudDrizzle {...iconProps} className="w-8 h-8 text-blue-400" />;
      case 'snow':
        return <CloudSnow {...iconProps} className="w-8 h-8 text-blue-300" />;
      case 'thunderstorm':
        return <Zap {...iconProps} className="w-8 h-8 text-purple-500" />;
      default:
        return <Sun {...iconProps} className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getWeatherGradient = (weatherMain) => {
    const gradients = {
      Clear: 'from-yellow-400 to-orange-500',
      Clouds: 'from-gray-400 to-gray-600',
      Rain: 'from-blue-500 to-blue-700',
      Drizzle: 'from-blue-400 to-blue-600',
      Snow: 'from-blue-200 to-blue-400',
      Thunderstorm: 'from-purple-600 to-purple-800',
      default: 'from-blue-400 to-purple-500'
    };
    return gradients[weatherMain] || gradients.default;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      short: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };



  const getSearchStats = () => {
    const totalSearches = history.length;
    const uniqueCities = new Set(history.map(item => item.city)).size;
    const avgTemp = history.length > 0 
      ? Math.round(history.reduce((sum, item) => sum + item.weather.main.temp, 0) / history.length)
      : 0;
    
    return { totalSearches, uniqueCities, avgTemp };
  };

  const stats = getSearchStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-lg">Loading weather history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Weather History
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg">Your weather search journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Searches</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.totalSearches}</p>
              </div>
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm font-medium">Cities Explored</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.uniqueCities}</p>
              </div>
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs sm:text-sm font-medium">Avg Temperature</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.avgTemp}°C</p>
              </div>
              <Thermometer className="w-6 h-6 sm:w-8 sm:h-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white/80 transition-all duration-200"
              />
            </div>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white/80 transition-all duration-200 cursor-pointer min-w-[150px]"
            >
              <option value="date">Sort by Date</option>
              <option value="city">Sort by City</option>
              <option value="temperature">Sort by Temperature</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 rounded-2xl p-4 mb-8 text-red-700">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              {error}
            </div>
          </div>
        )}

        {/* History Content */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-12 text-center border border-white/20">
            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              {searchTerm ? 'No matching searches found' : 'No weather searches yet'}
            </h3>
            <p className="text-gray-500 text-lg">
              {searchTerm 
                ? 'Try adjusting your search term' 
                : 'Start searching for weather to see your history here'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHistory.map((item, index) => {
              const weatherMain = item.weather?.weather?.[0]?.main;
              const dateInfo = formatDate(item.date);
              
              return (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden border border-white/20 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Header with gradient */}
                  <div className={`bg-gradient-to-r ${getWeatherGradient(weatherMain)} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-2 right-2 opacity-20">
                      {getWeatherIcon(weatherMain)}
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          {item.city}
                        </h3>
                        {getWeatherIcon(weatherMain)}
                      </div>
                      
                      <p className="text-lg opacity-90 capitalize mb-4">
                        {item.weather?.weather?.[0]?.description}
                      </p>
                      
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">
                          {Math.round(item.weather?.main?.temp)}°C
                        </span>
                        <span className="text-lg opacity-80">
                          feels {Math.round(item.weather?.main?.feels_like)}°
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Date */}
                    <div className="flex items-center gap-2 mb-4 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{dateInfo.relative}</span>
                      <span className="text-xs text-gray-400">• {dateInfo.short}</span>
                    </div>

                    {/* Weather Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 mb-1">Humidity</p>
                        <p className="font-bold text-blue-700">{item.weather?.main?.humidity}%</p>
                      </div>
                      
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <Wind className="w-5 h-5 text-green-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 mb-1">Wind</p>
                        <p className="font-bold text-green-700">{item.weather?.wind?.speed} m/s</p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-xl p-3 text-center">
                        <TrendingUp className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 mb-1">Pressure</p>
                        <p className="font-bold text-purple-700">{item.weather?.main?.pressure} hPa</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <Eye className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 mb-1">Visibility</p>
                        <p className="font-bold text-gray-700">{(item.weather?.visibility / 1000).toFixed(1)} km</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .grid > div {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default WeatherHistory;