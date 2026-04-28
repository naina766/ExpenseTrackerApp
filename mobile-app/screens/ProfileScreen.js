import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ExpenseContext } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { setupDailyReminder, cancelDailyReminder, getScheduledReminders } from '../services/notifications';

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const { exportToCSV, exportToPDF } = useContext(ExpenseContext);

  // ✅ FIX: added colors here
  const { theme, toggleTheme, isDark, colors } = useTheme();

  const [reminderEnabled, setReminderEnabled] = useState(false);

  useEffect(() => {
    checkReminderStatus();
  }, []);

  const checkReminderStatus = async () => {
    const reminders = await getScheduledReminders();
    setReminderEnabled(reminders.length > 0);
  };

  const toggleReminder = async () => {
    if (reminderEnabled) {
      await cancelDailyReminder();
      setReminderEnabled(false);
      Alert.alert('Success', 'Daily reminder disabled');
    } else {
      const success = await setupDailyReminder();
      if (success) {
        setReminderEnabled(true);
        Alert.alert('Success', 'Daily reminder set for 8 PM');
      } else {
        Alert.alert('Error', 'Failed to set reminder. Please check permissions.');
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvData = await exportToCSV();
      const fileName = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      Alert.alert('Success', `CSV exported to ${fileUri}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      const htmlContent = await exportToPDF();
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      Alert.alert('Success', `PDF exported to ${uri}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.secondary }]}>
      
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
        <Text style={[styles.value, { color: colors.text }]}>{user?.name}</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
        <Text style={[styles.value, { color: colors.text }]}>{user?.email}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={toggleTheme}>
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Switch to {isDark ? 'Light' : 'Dark'} Mode
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={toggleReminder}>
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {reminderEnabled ? 'Disable' : 'Enable'} Daily Reminder
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Export Data</Text>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleExportCSV}>
          <Text style={[styles.buttonText, { color: colors.text }]}>Export to CSV</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleExportPDF}>
          <Text style={[styles.buttonText, { color: colors.text }]}>Export to PDF</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App Features</Text>

        <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Secure login with JWT token</Text>
        <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Add, view, edit, delete expenses</Text>
        <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Dashboard insights and category breakdown</Text>
        <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Search and filter expenses</Text>
        <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Dark/Light theme toggle</Text>
        <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Export expenses to PDF/CSV</Text>
        <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Push notifications for reminders</Text>
        <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Offline sync capabilities</Text>
      </View>

      {/* ✅ FIX: replaced accent with primary */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.primary }]}
        onPress={logout}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featureItem: {
    marginBottom: 8,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logoutButton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
});

export default ProfileScreen;