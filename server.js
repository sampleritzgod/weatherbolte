const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'OPENWEATHER_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-app';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Please ensure MongoDB is running and the connection string is correct.');
    process.exit(1);
  }
};

connectDB();

// Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  phone: String,
  location: String,
  bio: String,
  jobTitle: String,
  company: String,
  profilePicture: String,
  createdAt: { type: Date, default: Date.now }
});

// Add email validation
userSchema.path('email').validate(function(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}, 'Please provide a valid email address');

const User = mongoose.model('User', userSchema);

const weatherHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  city: { type: String, required: true },
  weather: { type: Object, required: true },
  date: { type: Date, default: Date.now }
});
const WeatherHistory = mongoose.model('WeatherHistory', weatherHistorySchema);

// Middleware: Auth check
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Server error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: Object.values(err.errors).map(e => e.message) 
    });
  }
  
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  
  res.status(500).json({ message: 'Internal server error' });
};

// Routes
// Auth
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      } 
    });
  } catch (err) {
    next(err);
  }
});

// Weather endpoints
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Check if API key is configured
if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your-openweather-api-key-here') {
  console.warn('⚠️  OpenWeatherMap API key not configured. Using mock data for development.');
}

// UPDATED: Now handles both city and lat/lon
app.post('/api/weather/current', authenticateToken, async (req, res, next) => {
  try {
    const { city, lat, lon } = req.body;
    if (!city && (!lat || !lon)) {
      return res.status(400).json({ message: 'City or latitude and longitude are required' });
    }

    // If API key is not configured, return mock data
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your-openweather-api-key-here') {
      const mockData = {
        name: city || 'Demo City',
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        main: { 
          temp: 22, 
          feels_like: 20, 
          temp_min: 18, 
          temp_max: 25,
          humidity: 65,
          pressure: 1013
        },
        wind: { speed: 3.5, deg: 240 },
        visibility: 10000,
        sys: { 
          sunrise: Math.floor(Date.now() / 1000) - 3600, 
          sunset: Math.floor(Date.now() / 1000) + 7200,
          country: 'US'
        },
        coord: { lat: 40.7128, lon: -74.0060 },
        timezone: -18000
      };
      
      // Save to history if it's a city-based search
      if (city) {
        const historyEntry = new WeatherHistory({
          userId: req.user.userId,
          city: mockData.name,
          weather: mockData,
        });
        await historyEntry.save().catch(err => {
          console.error('Failed to save weather history:', err);
        });
      }
      
      return res.json(mockData);
    }

    let apiUrl;
    if (city) {
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    } else {
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    }

    const response = await axios.get(apiUrl, { timeout: 10000 });
    
    // Save to history if it's a city-based search by a user
    if (city) {
      const historyEntry = new WeatherHistory({
        userId: req.user.userId,
        city: response.data.name,
        weather: response.data,
      });
      await historyEntry.save().catch(err => {
        console.error('Failed to save weather history:', err);
        // Don't fail the request if history save fails
      });
    }
    
    res.json(response.data);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: 'City not found' });
    }
    if (err.code === 'ECONNABORTED') {
      return res.status(408).json({ message: 'Weather service timeout' });
    }
    console.error('Weather API error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Error fetching weather data' });
  }
});

app.post('/api/weather/forecast', authenticateToken, async (req, res, next) => {
  try {
    const { lat, lon } = req.body;
    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    // If API key is not configured, return mock forecast data
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your-openweather-api-key-here') {
      const now = new Date();
      const mockForecast = {
        list: [
          // Today
          { dt: Math.floor(Date.now() / 1000) + 3600, main: { temp: 23, temp_min: 20, temp_max: 26 }, weather: [{ main: "Clear", icon: "01d" }], dt_txt: "2024-12-23 15:00:00" },
          { dt: Math.floor(Date.now() / 1000) + 7200, main: { temp: 21, temp_min: 18, temp_max: 24 }, weather: [{ main: "Clouds", icon: "02d" }], dt_txt: "2024-12-23 16:00:00" },
          { dt: Math.floor(Date.now() / 1000) + 10800, main: { temp: 19, temp_min: 16, temp_max: 22 }, weather: [{ main: "Rain", icon: "10n" }], dt_txt: "2024-12-23 17:00:00" },
          { dt: Math.floor(Date.now() / 1000) + 14400, main: { temp: 18, temp_min: 15, temp_max: 21 }, weather: [{ main: "Rain", icon: "10n" }], dt_txt: "2024-12-23 18:00:00" },
          // Tomorrow
          { dt: Math.floor(Date.now() / 1000) + 86400, main: { temp: 25, temp_min: 22, temp_max: 28 }, weather: [{ main: "Clear", icon: "01d" }], dt_txt: "2024-12-24 12:00:00" },
          // Day 3
          { dt: Math.floor(Date.now() / 1000) + 172800, main: { temp: 22, temp_min: 19, temp_max: 25 }, weather: [{ main: "Clouds", icon: "03d" }], dt_txt: "2024-12-25 12:00:00" },
          // Day 4
          { dt: Math.floor(Date.now() / 1000) + 259200, main: { temp: 26, temp_min: 23, temp_max: 29 }, weather: [{ main: "Clear", icon: "01d" }], dt_txt: "2024-12-26 12:00:00" },
          // Day 5
          { dt: Math.floor(Date.now() / 1000) + 345600, main: { temp: 20, temp_min: 17, temp_max: 23 }, weather: [{ main: "Rain", icon: "10d" }], dt_txt: "2024-12-27 12:00:00" }
        ]
      };
      return res.json(mockForecast);
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`,
      { timeout: 10000 }
    );
    res.json(response.data);
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      return res.status(408).json({ message: 'Weather service timeout' });
    }
    res.status(500).json({ message: 'Error fetching forecast' });
  }
});

app.post('/api/weather/air-quality', authenticateToken, async (req, res, next) => {
  try {
    const { lat, lon } = req.body;
    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`,
      { timeout: 10000 }
    );
    res.json(response.data);
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      return res.status(408).json({ message: 'Weather service timeout' });
    }
    res.status(500).json({ message: 'Error fetching air quality data' });
  }
});

app.get('/api/weather/history', authenticateToken, async (req, res, next) => {
  try {
    const history = await WeatherHistory.find({ userId: req.user.userId })
      .sort({ date: -1 })
      .limit(10);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

// Profile
app.get('/api/user/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res, next) => {
  try {
    const { username, email, firstName, lastName, phone, location, bio, jobTitle, company, profilePicture } = req.body;
    
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (bio) updateData.bio = bio;
    if (jobTitle) updateData.jobTitle = jobTitle;
    if (company) updateData.company = company;
    if (profilePicture) updateData.profilePicture = profilePicture;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    time: new Date().toISOString(), 
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// Apply error handling middleware
app.use(errorHandler);

// Catch-all & error middleware
app.use('*', (req, res) => res.status(404).json({ message: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});