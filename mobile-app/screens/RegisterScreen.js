import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const { register, error, setError, loading } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    return () => setError('');
  }, []);

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert('Validation', 'Please fill in all fields');
      return;
    }
    try {
      await register(name, email, password);
    } catch (err) {
      Alert.alert('Register failed', error || 'Unable to create account');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-secondary px-6 justify-center">
      <View className="mb-8">
        <Text className="text-text text-4xl font-extrabold">Create Account</Text>
        <Text className="text-textSecondary mt-2 text-base">Start tracking your spending in minutes</Text>
      </View>
      <View className="bg-surface rounded-3xl p-5 shadow-lg">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor="#94a3b8"
          className="bg-gray-700 text-text rounded-2xl px-4 py-4 mb-4"
        />
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
          <Text className="text-secondary font-bold text-base">{loading ? 'Creating account...' : 'Register'}</Text>
        </TouchableOpacity>
        <View className="flex-row justify-center">
          <Text className="text-textSecondary">Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-primary font-bold ml-1"> Sign in</Text>
          </TouchableOpacity>
        </View>
        {error ? <Text className="text-error text-center mt-3">{error}</Text> : null}
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
