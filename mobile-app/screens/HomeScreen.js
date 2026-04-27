import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, Animated, Easing, StyleSheet } from 'react-native';
import { ExpenseContext } from '../context/ExpenseContext';
import SummaryCard from '../components/SummaryCard';
import { PieChart } from 'react-native-chart-kit';
import { theme } from '../theme';

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
    color: [theme.colors.primary, theme.colors.accent, '#10b981', '#f59e0b', theme.colors.error, '#8b5cf6'][index % 6],
    legendFontColor: theme.colors.text,
    legendFontSize: 15,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Quick insight into your spending</Text>
          {!isOnline && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>Offline mode - Changes will sync when online</Text>
            </View>
          )}
          {pendingActions.length > 0 && (
            <View style={styles.accentBox}>
              <Text style={styles.accentText}>{pendingActions.length} pending action(s) to sync</Text>
            </View>
          )}
        </View>
        <SummaryCard title="Monthly Total" value={`$${summary.total.toFixed(2)}`} />
        <View style={styles.row}>
          <SummaryCard title="Top Category" value={summary.highestCategory.category} smallNote={`$${summary.highestCategory.amount.toFixed(2)}`} />
          <SummaryCard title="Expense Items" value={`${expenses.length}`} smallNote="Recent data" />
        </View>
        {chartData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            <PieChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category breakdown</Text>
          {Object.entries(summary.byCategory).length === 0 ? (
            <Text style={styles.emptyText}>No expenses yet. Add your first expense.</Text>
          ) : (
            Object.entries(summary.byCategory).map(([category, amount]) => (
              <View key={category} style={styles.listItem}>
                <Text style={styles.listCategory}>{category}</Text>
                <Text style={styles.listAmount}>${amount.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent expenses</Text>
          {expenses.slice(0, 4).map((item, index) => (
            <View
              key={item._id}
              style={styles.recentItem}
            >
              <View>
                <Text style={styles.recentTitle}>{item.category}</Text>
                <Text style={styles.recentNote}>{item.note || 'No note'}</Text>
              </View>
              <Text style={styles.recentAmount}>${item.amount.toFixed(2)}</Text>
            </View>
          ))}
          {expenses.length === 0 && <Text style={styles.emptyText}>Your dashboard will appear once you add expenses.</Text>}
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 36,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  errorBox: {
    marginTop: 8,
    backgroundColor: theme.colors.error,
    borderRadius: 8,
    padding: 8,
  },
  errorText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  accentBox: {
    marginTop: 8,
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
    padding: 8,
  },
  accentText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  section: {
    marginTop: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4b5563', // gray-600
  },
  listCategory: {
    color: theme.colors.textSecondary,
  },
  listAmount: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // secondary/50
  },
  recentTitle: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  recentNote: {
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  recentAmount: {
    color: theme.colors.primary,
    fontWeight: '800',
  }
});

export default HomeScreen;

