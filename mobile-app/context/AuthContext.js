import React, { createContext, useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import api from '../services/api';

export const AuthContext = createContext();

const isWeb = Platform.OS === 'web';

// 🔥 Universal storage helpers (fix for your error)
const Storage = {
  getItem: async (key) => {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return await AsyncStorage.getItem(key);
    }
  },

  setItem: async (key, value) => {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  },

  removeItem: async (key) => {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch {
      await AsyncStorage.removeItem(key);
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Restore Auth
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const storedToken = await Storage.getItem('expense_token');
        const storedUser = await Storage.getItem('expense_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          api.setAuthToken(storedToken);
        }
      } catch (err) {
        console.warn('Failed to restore auth', err);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  // ✅ LOGIN
  const login = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: authToken, user: authUser } = response.data;

      setUser(authUser);
      setToken(authToken);
      api.setAuthToken(authToken);

      await Storage.setItem('expense_token', authToken);
      await Storage.setItem('expense_user', JSON.stringify(authUser));

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ REGISTER
  const register = async (name, email, password) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token: authToken, user: authUser } = response.data;

      setUser(authUser);
      setToken(authToken);
      api.setAuthToken(authToken);

      await Storage.setItem('expense_token', authToken);
      await Storage.setItem('expense_user', JSON.stringify(authUser));

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Register failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    setUser(null);
    setToken(null);
    api.clearAuthToken();

    await Storage.removeItem('expense_token');
    await Storage.removeItem('expense_user');
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      login,
      register,
      logout,
      setError
    }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};