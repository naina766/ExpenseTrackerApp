import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 🔥 REQUIRED for Android (very important)
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

// Notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ✅ Improved permission handling
export const requestPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Schedule generic reminder
export const scheduleReminder = async (title, body, trigger) => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger,
    });
    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// Cancel specific reminder
export const cancelReminder = async (id) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

// Get all scheduled reminders
export const getScheduledReminders = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

// ✅ FINAL: Setup daily reminder (fixed)
export const setupDailyReminder = async () => {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return false;

  try {
    // 🔥 Cancel previous reminder (single source of truth)
    const existingId = await AsyncStorage.getItem('daily_reminder_id');
    if (existingId) {
      await cancelReminder(existingId);
    }

    // ✅ Correct trigger format
    const trigger = {
      type: 'daily',
      hour: 20,
      minute: 0,
    };

    const id = await scheduleReminder(
      '💸 Expense Reminder',
      "Don't forget to log your expenses today!",
      trigger
    );

    if (id) {
      await AsyncStorage.setItem('daily_reminder_id', id);
      console.log('Scheduled reminder ID:', id);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error setting up daily reminder:', error);
    return false;
  }
};

// Cancel daily reminder
export const cancelDailyReminder = async () => {
  try {
    const id = await AsyncStorage.getItem('daily_reminder_id');

    if (id) {
      await cancelReminder(id);
      await AsyncStorage.removeItem('daily_reminder_id');
    }
  } catch (error) {
    console.error('Error canceling daily reminder:', error);
  }
};