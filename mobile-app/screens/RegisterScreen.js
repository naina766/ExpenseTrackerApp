import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../theme';

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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSubtitle}>Start tracking your spending in minutes</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor="#94a3b8"
        />
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
          <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Register'}</Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}> Sign in</Text>
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

export default RegisterScreen;
