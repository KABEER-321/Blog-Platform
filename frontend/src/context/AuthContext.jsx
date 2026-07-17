import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('profile/');
      const profileData = response.data;
      setUser(profileData);
      setRole(profileData.user.is_staff ? 'Admin' : 'Customer');
      localStorage.setItem('user', JSON.stringify(profileData));
    } catch (err) {
      console.error('Error fetching profile:', err);
      logout();
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('token/', {
        username: email,
        password: password,
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      // Fetch user profile stats & details
      await fetchProfile();
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      let errorMsg = 'Invalid email or password.';
      if (err.response && err.response.data) {
        errorMsg = err.response.data.detail || errorMsg;
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setRole(null);
  };

  const updateProfile = async (name, phone, bio, profileImage) => {
    try {
      const formData = new FormData();
      
      // Parse first/last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('phone', phone);
      formData.append('bio', bio);
      
      if (profileImage instanceof File) {
        formData.append('profile_image', profileImage);
      }

      const response = await api.put('profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Refetch profile data to reload dashboard metrics
      await fetchProfile();
      return { success: true };
    } catch (err) {
      console.error('Profile update error:', err);
      return {
        success: false,
        error: 'Failed to update profile settings.',
        errors: err.response?.data
      };
    }
  };

  // Sync state on page loads
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetchProfile();
      }
      setLoading(false);
    };
    checkAuth();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, updateProfile, refreshProfile: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
