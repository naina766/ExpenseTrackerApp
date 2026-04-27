import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login, error, setError, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    return () => setError('');
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Validation', 'Please provide both email and password');
      return;
    }
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert('Login failed', error || 'Please check credentials');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-secondary px-6 justify-center">
      <View className="mb-8">
        <Text className="text-text text-4xl font-extrabold">Expense Tracker</Text>
        <Text className="text-textSecondary mt-2 text-base">Sign in to manage your expenses</Text>
      </View>
      <View className="bg-surface rounded-3xl p-5 shadow-lg">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          className="bg-gray-700 text-text rounded-2xl px-4 py-4 mb-4"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          className="bg-gray-700 text-text rounded-2xl px-4 py-4 mb-4"
        />
        <TouchableOpacity className="bg-primary rounded-2xl py-4 items-center mb-4" onPress={handleSubmit} disabled={loading}>
          <Text className="text-secondary font-bold text-base">{loading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>
        <View className="flex-row justify-center">
          <Text className="text-textSecondary">Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-primary font-bold ml-1"> Register</Text>
          </TouchableOpacity>
        </View>
        {error ? <Text className="text-error text-center mt-3">{error}</Text> : null}
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

