import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

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

export const cancelReminder = async (id) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const getScheduledReminders = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

export const setupDailyReminder = async () => {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return false;

  // Cancel existing reminders
  const existing = await getScheduledReminders();
  for (const reminder of existing) {
    await cancelReminder(reminder.identifier);
  }

  // Schedule daily reminder at 8 PM
  const trigger = {
    hour: 20,
    minute: 0,
    repeats: true,
  };

  const id = await scheduleReminder(
    'Expense Tracker Reminder',
    'Don\'t forget to log your expenses today!',
    trigger
  );

  if (id) {
    await AsyncStorage.setItem('daily_reminder_id', id);
    return true;
  }
  return false;
};

export const cancelDailyReminder = async () => {
  const id = await AsyncStorage.getItem('daily_reminder_id');
  if (id) {
    await cancelReminder(id);
    await AsyncStorage.removeItem('daily_reminder_id');
  }
};
