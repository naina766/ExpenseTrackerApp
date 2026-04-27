import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../theme';

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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expense Tracker</Text>
        <Text style={styles.headerSubtitle}>Sign in to manage your expenses</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}> Register</Text>
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 24, // px-6
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32, // mb-8
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 36, // text-4xl
    fontWeight: '800',
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
    marginTop: 8,
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24, // rounded-3xl
    padding: 20, // p-5
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  input: {
    backgroundColor: '#374151', // bg-gray-700
    color: theme.colors.text,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: theme.colors.secondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: theme.colors.textSecondary,
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 12,
  }
});

export default LoginScreen;
