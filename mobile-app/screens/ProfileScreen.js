import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ExpenseContext } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { setupDailyReminder, cancelDailyReminder, getScheduledReminders } from '../services/notifications';
import { theme as appTheme } from '../theme';

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const { exportToCSV, exportToPDF } = useContext(ExpenseContext);
  const { theme, toggleTheme, isDark } = useTheme();
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

      await FileSystem.writeAsStringAsync(fileUri, csvData, { encoding: FileSystem.EncodingType.UTF8 });
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
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={toggleTheme}
        >
          <Text style={styles.buttonText}>
            Switch to {isDark ? 'Light' : 'Dark'} Mode
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={toggleReminder}
        >
          <Text style={styles.buttonText}>
            {reminderEnabled ? 'Disable' : 'Enable'} Daily Reminder
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Export Data</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleExportCSV}
        >
          <Text style={styles.buttonText}>Export to CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleExportPDF}
        >
          <Text style={styles.buttonText}>Export to PDF</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>App Features</Text>
        <Text style={styles.featureItem}>• Secure login with JWT token</Text>
        <Text style={styles.featureItem}>• Add, view, edit, delete expenses</Text>
        <Text style={styles.featureItem}>• Dashboard insights and category breakdown</Text>
        <Text style={styles.featureItem}>• Search and filter expenses</Text>
        <Text style={styles.featureItem}>• Dark/Light theme toggle</Text>
        <Text style={styles.featureItem}>• Export expenses to PDF/CSV</Text>
        <Text style={styles.featureItem}>• Push notifications for reminders</Text>
        <Text style={styles.featureItem}>• Offline sync capabilities</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.secondary,
    padding: 20, // p-5
  },
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 24, // rounded-3xl
    padding: 24, // p-6
    marginBottom: 24, // mb-6
  },
  label: {
    color: appTheme.colors.textSecondary,
    marginBottom: 8, // mb-2
  },
  value: {
    color: appTheme.colors.text,
    fontSize: 20, // text-xl
    fontWeight: 'bold',
    marginBottom: 16, // mb-4
  },
  sectionTitle: {
    color: appTheme.colors.text,
    fontSize: 20, // text-xl
    fontWeight: 'bold',
    marginBottom: 16, // mb-4
  },
  featureItem: {
    color: appTheme.colors.textSecondary,
    marginBottom: 8,
  },
  button: {
    backgroundColor: appTheme.colors.primary,
    borderRadius: 12, // rounded-xl
    padding: 16, // p-4
    marginBottom: 16, // mb-4
  },
  buttonText: {
    color: appTheme.colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: appTheme.colors.accent,
    borderRadius: 12, // rounded-xl
    padding: 16, // p-4
    marginBottom: 40,
  }
});

export default ProfileScreen;
