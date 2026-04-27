import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, Animated, Easing } from 'react-native';
import { ExpenseContext } from '../context/ExpenseContext';
import SummaryCard from '../components/SummaryCard';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const { expenses, summary, isOnline, pendingActions } = useContext(ExpenseContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const chartData = Object.entries(summary.byCategory).map(([category, amount], index) => ({
    name: category,
    population: amount,
    color: ['#38bdf8', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 6],
    legendFontColor: '#ffffff',
    legendFontSize: 15,
  }));

  return (
    <ScrollView className="flex-1 bg-secondary p-5 pb-10">
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View className="mb-5">
          <Text className="text-text text-4xl font-extrabold">Dashboard</Text>
          <Text className="text-textSecondary mt-2">Quick insight into your spending</Text>
          {!isOnline && (
            <View className="mt-2 bg-error rounded-lg p-2">
              <Text className="text-text text-sm">Offline mode - Changes will sync when online</Text>
            </View>
          )}
          {pendingActions.length > 0 && (
            <View className="mt-2 bg-accent rounded-lg p-2">
              <Text className="text-text text-sm">{pendingActions.length} pending action(s) to sync</Text>
            </View>
          )}
        </View>
        <SummaryCard title="Monthly Total" value={`$${summary.total.toFixed(2)}`} />
        <View className="flex-row justify-between gap-3">
          <SummaryCard title="Top Category" value={summary.highestCategory.category} smallNote={`$${summary.highestCategory.amount.toFixed(2)}`} />
          <SummaryCard title="Expense Items" value={`${expenses.length}`} smallNote="Recent data" />
        </View>
        {chartData.length > 0 && (
          <View className="mt-5 bg-surface rounded-3xl p-5">
            <Text className="text-text text-lg font-bold mb-4">Category Breakdown</Text>
            <PieChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#111827',
                backgroundGradientFrom: '#111827',
                backgroundGradientTo: '#111827',
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>
        )}
        <View className="mt-5 bg-surface rounded-3xl p-5">
          <Text className="text-text text-lg font-bold mb-4">Category breakdown</Text>
          {Object.entries(summary.byCategory).length === 0 ? (
            <Text className="text-textSecondary mt-3">No expenses yet. Add your first expense.</Text>
          ) : (
            Object.entries(summary.byCategory).map(([category, amount]) => (
              <View key={category} className="flex-row justify-between py-3 border-b border-gray-600">
                <Text className="text-textSecondary">{category}</Text>
                <Text className="text-text font-bold">${amount.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>
        <View className="mt-5 bg-surface rounded-3xl p-5">
          <Text className="text-text text-lg font-bold mb-4">Recent expenses</Text>
          {expenses.slice(0, 4).map((item, index) => (
            <View
              key={item._id}
              className="flex-row justify-between items-center mb-4 p-3 rounded-xl bg-secondary/50"
            >
              <View>
                <Text className="text-text font-bold">{item.category}</Text>
                <Text className="text-textSecondary mt-1">{item.note || 'No note'}</Text>
              </View>
              <Text className="text-primary font-extrabold">${item.amount.toFixed(2)}</Text>
            </View>
          ))}
          {expenses.length === 0 && <Text className="text-textSecondary mt-3">Your dashboard will appear once you add expenses.</Text>}
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default HomeScreen;

