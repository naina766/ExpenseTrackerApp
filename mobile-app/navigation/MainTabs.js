import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ExpenseListScreen from '../screens/ExpenseListScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import SearchFilterScreen from '../screens/SearchFilterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: '#0f172a' },
      tabBarActiveTintColor: '#38bdf8',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Home: 'home',
          Expenses: 'list',
          Search: 'search',
          Add: 'add-circle',
          Profile: 'person'
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      }
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Expenses" component={ExpenseListScreen} />
    <Tab.Screen name="Search" component={SearchFilterScreen} />
    <Tab.Screen name="Add" component={AddExpenseScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default MainTabs;
