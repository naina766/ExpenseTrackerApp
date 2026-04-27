import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { ThemeProvider } from './context/ThemeContext';
import { QueryProvider } from './context/QueryProvider';
import AuthStack from './navigation/AuthStack';
import MainTabs from './navigation/MainTabs';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const AppRoutes = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return user ? <MainTabs /> : <AuthStack />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <ExpenseProvider>
              <NavigationContainer>
                <StatusBar style="light" />
                <AppRoutes />
              </NavigationContainer>
            </ExpenseProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
// import { View, Text } from "react-native";

// export default function App() {
//   return (
//     <View className='flex-1 justify-center items-center'>
//       <Text className='text-3xl font-bold text-slate-100'>Minimal App Working ✅</Text>
//     </View>
//   );
// }