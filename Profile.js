import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Edit3, Save, X, User, Mail, Calendar, Shield, Phone, MapPin, Briefcase, Upload, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user: authUser, token } = useAuth();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError('');
        
        const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
        const response = await axios.get(`${apiBase}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = response.data;
        setUser({
          username: userData.username || 'user',
          email: userData.email || '',
          firstName: userData.firstName || userData.username?.split('_')[0] || 'User',
          lastName: userData.lastName || userData.username?.split('_')[1] || '',
          phone: userData.phone || '+1 (555) 123-4567',
          location: userData.location || 'Unknown Location',
          bio: userData.bio || 'Weather enthusiast and app user.',
          jobTitle: userData.jobTitle || 'Weather App User',
          company: userData.company || 'WeatherApp',
          createdAt: userData.createdAt || new Date().toISOString(),
          profilePicture: userData.profilePicture || null
        });
        setEditData({
          username: userData.username || 'user',
          email: userData.email || '',
          firstName: userData.firstName || userData.username?.split('_')[0] || 'User',
          lastName: userData.lastName || userData.username?.split('_')[1] || '',
          phone: userData.phone || '+1 (555) 123-4567',
          location: userData.location || 'Unknown Location',
          bio: userData.bio || 'Weather enthusiast and app user.',
          jobTitle: userData.jobTitle || 'Weather App User',
          company: userData.company || 'WeatherApp',
          profilePicture: userData.profilePicture || null
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError(err.response?.data?.message || 'Failed to fetch user profile');
        
        // Fallback to basic user data
        const fallbackUser = {
          username: authUser?.username || 'user',
          email: authUser?.email || 'user@example.com',
          firstName: authUser?.username?.split('_')[0] || 'User',
          lastName: authUser?.username?.split('_')[1] || '',
          phone: '+1 (555) 123-4567',
          location: 'Unknown Location',
          bio: 'Weather enthusiast and app user.',
          jobTitle: 'Weather App User',
          company: 'WeatherApp',
          createdAt: new Date().toISOString(),
          profilePicture: null
        };
        setUser(fallbackUser);
        setEditData(fallbackUser);
      } finally {
        setLoading(false);
      }
    };

    if (token && authUser) {
      fetchUserProfile();
    } else {
      setLoading(false);
      setError('Authentication required');
    }
  }, [token, authUser]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (isEditing) {
          setEditData({ ...editData, profilePicture: e.target.result });
        } else {
          setUser({ ...user, profilePicture: e.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setEditData({ ...user });
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
      
      // Update user profile
      await axios.put(`${apiBase}/user/profile`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser({ ...editData });
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...user });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentData = isEditing ? editData : user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your account information and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-100 border border-green-300 rounded-xl p-4 text-green-700">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              {success}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-300 rounded-xl p-4 text-red-700">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              {error}
            </div>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          {/* Cover Section */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all flex items-center gap-2"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Picture Section */}
          <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 sm:gap-6 -mt-12 sm:-mt-16">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                  {currentData.profilePicture ? (
                    <img
                      src={currentData.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                      <User size={48} className="text-white" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editData.firstName}
                        onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        value={editData.lastName}
                        onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Last Name"
                      />
                    </div>
                  ) : (
                    <h2 className="text-3xl font-bold text-gray-900">
                      {currentData.firstName} {currentData.lastName}
                    </h2>
                  )}
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>

                {isEditing ? (
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                    placeholder="Username"
                  />
                ) : (
                  <p className="text-gray-600 mb-2">@{currentData.username}</p>
                )}

                {isEditing ? (
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-700 max-w-2xl">{currentData.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
                
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Email</p>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{currentData.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Phone</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{currentData.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <MapPin size={20} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Location</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{currentData.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h3>
                
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Briefcase size={20} className="text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Job Title</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.jobTitle}
                        onChange={(e) => setEditData({ ...editData, jobTitle: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{currentData.jobTitle}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Briefcase size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Company</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.company}
                        onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{currentData.company}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Calendar size={20} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-medium text-gray-900">{formatDate(currentData.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Account Status</p>
                    <p className="font-medium text-green-600">Active & Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          {isEditing && (
            <div className="px-8 pb-8">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload size={32} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Profile Picture</h3>
                    <p className="text-gray-600 mb-4">Drag and drop your image here, or click to browse</p>
                    <label className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer inline-block">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Actions */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left">
            <h3 className="font-semibold text-gray-900 mb-1">Privacy Settings</h3>
            <p className="text-sm text-gray-600">Manage your privacy and security</p>
          </button>
          <button className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left">
            <h3 className="font-semibold text-gray-900 mb-1">Notification Preferences</h3>
            <p className="text-sm text-gray-600">Customize your notifications</p>
          </button>
          <button className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left">
            <h3 className="font-semibold text-gray-900 mb-1">Account Settings</h3>
            <p className="text-sm text-gray-600">Advanced account configuration</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;