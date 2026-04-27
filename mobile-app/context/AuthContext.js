import React, { createContext, useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        // Try SecureStore first, fallback to AsyncStorage
        let storedToken = await SecureStore.getItemAsync('expense_token');
        if (!storedToken) {
          storedToken = await AsyncStorage.getItem('expense_token');
        }

        let storedUser = await SecureStore.getItemAsync('expense_user');
        if (!storedUser) {
          storedUser = await AsyncStorage.getItem('expense_user');
        }

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

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: authToken, user: authUser } = response.data;
      setUser(authUser);
      setToken(authToken);
      api.setAuthToken(authToken);

      // Store securely with SecureStore, backup with AsyncStorage
      await SecureStore.setItemAsync('expense_token', authToken);
      await SecureStore.setItemAsync('expense_user', JSON.stringify(authUser));
      await AsyncStorage.setItem('expense_token', authToken);
      await AsyncStorage.setItem('expense_user', JSON.stringify(authUser));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token: authToken, user: authUser } = response.data;
      setUser(authUser);
      setToken(authToken);
      api.setAuthToken(authToken);

      // Store securely with SecureStore, backup with AsyncStorage
      await SecureStore.setItemAsync('expense_token', authToken);
      await SecureStore.setItemAsync('expense_user', JSON.stringify(authUser));
      await AsyncStorage.setItem('expense_token', authToken);
      await AsyncStorage.setItem('expense_user', JSON.stringify(authUser));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Register failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    api.clearAuthToken();

    // Clear both storages
    await SecureStore.deleteItemAsync('expense_token');
    await SecureStore.deleteItemAsync('expense_user');
    await AsyncStorage.removeItem('expense_token');
    await AsyncStorage.removeItem('expense_user');
  };

  const value = useMemo(
    () => ({ user, token, loading, error, login, register, logout, setError }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
