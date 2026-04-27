import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ExpenseContext } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { setupDailyReminder, cancelDailyReminder, getScheduledReminders } from '../services/notifications';

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
    <ScrollView className="flex-1 bg-secondary p-5">
      <View className="bg-surface rounded-3xl p-6 mb-6">
        <Text className="text-textSecondary mb-2">Name</Text>
        <Text className="text-text text-xl font-bold mb-4">{user?.name}</Text>
        <Text className="text-textSecondary mb-2">Email</Text>
        <Text className="text-text text-xl font-bold mb-4">{user?.email}</Text>
      </View>

      <View className="bg-surface rounded-3xl p-6 mb-6">
        <Text className="text-text text-xl font-bold mb-4">Settings</Text>
        <TouchableOpacity
          className="bg-primary rounded-xl p-4 mb-4"
          onPress={toggleTheme}
        >
          <Text className="text-text text-center font-bold">
            Switch to {isDark ? 'Light' : 'Dark'} Mode
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-primary rounded-xl p-4 mb-4"
          onPress={toggleReminder}
        >
          <Text className="text-text text-center font-bold">
            {reminderEnabled ? 'Disable' : 'Enable'} Daily Reminder
          </Text>
        </TouchableOpacity>
      </View>

      <View className="bg-surface rounded-3xl p-6 mb-6">
        <Text className="text-text text-xl font-bold mb-4">Export Data</Text>
        <TouchableOpacity
          className="bg-primary rounded-xl p-4 mb-4"
          onPress={handleExportCSV}
        >
          <Text className="text-text text-center font-bold">Export to CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-primary rounded-xl p-4 mb-4"
          onPress={handleExportPDF}
        >
          <Text className="text-text text-center font-bold">Export to PDF</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-surface rounded-3xl p-6 mb-6">
        <Text className="text-text text-xl font-bold mb-4">App Features</Text>
        <Text className="text-textSecondary mb-2">• Secure login with JWT token</Text>
        <Text className="text-textSecondary mb-2">• Add, view, edit, delete expenses</Text>
        <Text className="text-textSecondary mb-2">• Dashboard insights and category breakdown</Text>
        <Text className="text-textSecondary mb-2">• Search and filter expenses</Text>
        <Text className="text-textSecondary mb-2">• Dark/Light theme toggle</Text>
        <Text className="text-textSecondary mb-2">• Export expenses to PDF/CSV</Text>
        <Text className="text-textSecondary mb-2">• Push notifications for reminders</Text>
        <Text className="text-textSecondary mb-2">• Offline sync capabilities</Text>
      </View>

      <TouchableOpacity className="bg-accent rounded-xl p-4" onPress={logout}>
        <Text className="text-text text-center font-bold">Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;
