import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cloud, Sun, CloudRain, Thermometer, Droplets, Wind, Eye, 
  TrendingUp, MapPin, Search, History, User,
  CloudSnow, Zap, Gauge
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Weather Icons Component
const WeatherIcon = ({ condition, size = 48 }) => {
  const iconMap = {
    'Clear': Sun,
    'Clouds': Cloud,
    'Rain': CloudRain,
    'Snow': CloudSnow,
    'Thunderstorm': Zap,
    'Drizzle': CloudRain,
    'Mist': Cloud,
    'Fog': Cloud
  };
  
  const IconComponent = iconMap[condition] || Cloud;
  return <IconComponent size={size} className="text-current" />;
};

// Top Navigation Bar - Removed to avoid double navbar with App.js

// Main Weather Card
const MainWeatherCard = ({ weather, time, user }) => (
  <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
    <div className="absolute inset-0 bg-black/10"></div>
    <div className="relative z-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div className="mb-4 lg:mb-0 w-full lg:w-auto">
          <p className="text-blue-100 text-xs sm:text-sm font-medium">
            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 mb-3 sm:mb-4">
            Welcome back, {user?.username}!
          </h2>
          <div className="flex items-center space-x-2 text-blue-100">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-sm sm:text-lg">{weather.location}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 sm:space-x-6 w-full lg:w-auto justify-between lg:justify-end">
          <div className="text-center">
            <WeatherIcon condition={weather.condition} size={48} className="sm:w-16 sm:h-16" />
            <p className="text-blue-100 text-xs sm:text-sm mt-1 sm:mt-2 capitalize">
              {weather.condition.toLowerCase()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold">
              {weather.temperature}°
            </div>
            <p className="text-blue-100 text-xs sm:text-sm">
              Feels like {weather.feelsLike}°C
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Metric Card
const MetricCard = ({ metric }) => (
  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${metric.gradient}`}>
        {React.cloneElement(metric.icon, { className: "h-5 w-5 sm:h-6 sm:w-6 text-white" })}
      </div>
      <div className="text-right">
        <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
          {metric.value}
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          {metric.label}
        </div>
      </div>
    </div>
    <div className="flex items-center text-xs sm:text-sm">
      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
      <span className="text-green-600 font-medium">{metric.trend}</span>
      <span className="text-gray-500 ml-1 hidden sm:inline">vs yesterday</span>
      <span className="text-gray-500 ml-1 sm:hidden">vs yesterday</span>
    </div>
  </div>
);

// Feature Card
const FeatureCard = ({ feature }) => (
  <div className={`relative rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${feature.gradient} overflow-hidden`}>
    <div className="absolute inset-0 bg-black/10"></div>
    <div className="relative z-10">
      <div className="mb-3 sm:mb-4">
        {React.cloneElement(feature.icon, { className: "h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" })}
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-2">{feature.title}</h3>
      <p className="text-white/90 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
        {feature.description}
      </p>
      <button 
        onClick={feature.action}
        className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl py-2 sm:py-3 px-3 sm:px-4 font-medium transition-all duration-200 hover:scale-105 text-sm sm:text-base"
      >
        Explore Now
      </button>
    </div>
  </div>
);

// Recent Activity Card
const RecentActivityCard = ({ activities }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Searches</h3>
    <div className="space-y-4">
      {activities.map((activity, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <WeatherIcon condition="Clear" size={20} />
            </div>
            <div>
              <div className="font-medium text-gray-900">{activity.city}</div>
              <div className="text-sm text-gray-500">{activity.time}</div>
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {activity.temp}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Weather Insights Card
const WeatherInsightsCard = () => (
  <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
    <div className="absolute inset-0 bg-black/10"></div>
    <div className="relative z-10">
      <div className="mb-4">
        <Gauge className="h-12 w-12" />
      </div>
      <h3 className="text-xl font-bold mb-2">Weather Insights</h3>
      <p className="text-white/90 text-sm mb-4">
        Get personalized weather insights and recommendations based on your location and preferences.
      </p>
      <div className="bg-white/20 rounded-xl p-3">
        <div className="text-sm font-medium">Today's Tip</div>
        <div className="text-xs text-white/80 mt-1">
          Perfect weather for outdoor activities! UV index is moderate.
        </div>
      </div>
    </div>
  </div>
);

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="relative">
      <div className="h-16 w-16 border-4 border-blue-200 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 h-16 w-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
      <Cloud className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-500" />
    </div>
  </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentWeather, setCurrentWeather] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock weather data fetch
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        // Simulate API call - reduced from 1500ms to 300ms for better performance
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setCurrentWeather({
          location: 'Vāghodia, Gujarat',
          temperature: 27,
          condition: 'Clouds',
          humidity: 78,
          windSpeed: 5.07,
          visibility: 10.0,
          feelsLike: 29,
          pressure: 1013,
          uvIndex: 6
        });
        setLocationError('');
      } catch (error) {
        console.error('Weather data fetch error:', error);
        setLocationError('Could not fetch weather data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);



  const weatherMetrics = currentWeather ? [
    {
      icon: <Thermometer className="h-6 w-6 text-white" />,
      label: 'Feels Like',
      value: `${currentWeather.feelsLike}°C`,
      trend: '+2°C',
      gradient: 'from-red-400 to-red-600'
    },
    {
      icon: <Droplets className="h-6 w-6 text-white" />,
      label: 'Humidity',
      value: `${currentWeather.humidity}%`,
      trend: '-5%',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      icon: <Wind className="h-6 w-6 text-white" />,
      label: 'Wind Speed',
      value: `${currentWeather.windSpeed} m/s`,
      trend: '+1.2 m/s',
      gradient: 'from-green-400 to-green-600'
    },
    {
      icon: <Eye className="h-6 w-6 text-white" />,
      label: 'Visibility',
      value: `${currentWeather.visibility} km`,
      trend: 'Clear',
      gradient: 'from-purple-400 to-purple-600'
    }
  ] : [];

  const features = [
    {
      title: 'Weather Search',
      description: 'Search for real-time weather conditions and forecasts for any city worldwide with detailed meteorological data.',
      icon: <Search className="h-12 w-12" />,
      action: () => navigate('/search'),
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      title: 'Weather History',
      description: 'Access your complete weather search history with detailed patterns and trends over time.',
      icon: <History className="h-12 w-12" />,
      action: () => navigate('/history'),
      gradient: 'from-purple-500 to-purple-700'
    },
    {
      title: 'User Profile',
      description: 'Customize your weather preferences, manage locations, and personalize your dashboard experience.',
      icon: <User className="h-12 w-12" />,
      action: () => navigate('/profile'),
      gradient: 'from-indigo-500 to-indigo-700'
    }
  ];

  const recentActivity = [
    { city: 'New York, NY', time: '2 minutes ago', temp: '18°C' },
    { city: 'London, UK', time: '1 hour ago', temp: '12°C' },
    { city: 'Tokyo, JP', time: '3 hours ago', temp: '25°C' },
    { city: 'Sydney, AU', time: '1 day ago', temp: '22°C' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {locationError && (
          <div className="mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{locationError}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : currentWeather ? (
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Main Weather Section */}
            <MainWeatherCard 
              user={user} 
              weather={currentWeather} 
              time={currentTime} 
            />

            {/* Weather Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {weatherMetrics.map((metric, i) => (
                <MetricCard key={i} metric={metric} />
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {/* Main Content */}
              <div className="xl:col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {features.map((feature, i) => (
                    <FeatureCard key={i} feature={feature} />
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="xl:col-span-1 space-y-4 sm:space-y-6">
                <RecentActivityCard activities={recentActivity} />
                <WeatherInsightsCard />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <Cloud className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">Unable to load weather data</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;