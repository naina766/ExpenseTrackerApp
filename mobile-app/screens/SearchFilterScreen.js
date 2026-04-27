import React, { useContext, useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { ExpenseContext } from '../context/ExpenseContext';
import { theme } from '../theme';

const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Others'];

const SearchFilterScreen = ({ navigation }) => {
  const { expenses, deleteExpense } = useContext(ExpenseContext);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch = searchText === '' || expense.note.toLowerCase().includes(searchText.toLowerCase()) || expense.category.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = selectedCategory === '' || expense.category === selectedCategory;
      const matchesMinAmount = minAmount === '' || expense.amount >= parseFloat(minAmount);
      const matchesMaxAmount = maxAmount === '' || expense.amount <= parseFloat(maxAmount);
      return matchesSearch && matchesCategory && matchesMinAmount && matchesMaxAmount;
    });
  }, [expenses, searchText, selectedCategory, minAmount, maxAmount]);

  const confirmDelete = (id) => {
    Alert.alert('Delete expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id) }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemContent}>
        <Text style={styles.itemAmount}>${item.amount.toFixed(2)}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <Text style={styles.itemNote}>{item.note || 'No note provided'}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('Add', { expense: item })}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item._id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search & Filter</Text>
        <Text style={styles.headerSubtitle}>Find and manage your expenses</Text>
      </View>
      <View style={styles.filterCard}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search by note or category"
          placeholderTextColor="#94a3b8"
        />
        <Text style={styles.filterLabel}>Filter by Category</Text>
        <View style={styles.categoryContainer}>
          <TouchableOpacity
            style={[styles.categoryBadge, selectedCategory === '' && styles.categoryBadgeActive]}
            onPress={() => setSelectedCategory('')}
          >
            <Text style={[styles.categoryText, selectedCategory === '' && styles.categoryTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBadge, selectedCategory === cat && styles.categoryBadgeActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.amountRow}>
          <View style={styles.amountCol}>
            <Text style={styles.filterLabel}>Min Amount</Text>
            <TextInput
              style={styles.amountInput}
              value={minAmount}
              onChangeText={setMinAmount}
              placeholder="0"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.amountCol}>
            <Text style={styles.filterLabel}>Max Amount</Text>
            <TextInput
              style={styles.amountInput}
              value={maxAmount}
              onChangeText={setMaxAmount}
              placeholder="1000"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
      <Text style={styles.resultsHeader}>Results ({filteredExpenses.length})</Text>
      {filteredExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses match your filters.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 30, // text-3xl
    fontWeight: '800',
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  filterCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24, // rounded-3xl
    padding: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#374151', // gray-700
    color: theme.colors.text,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  filterLabel: {
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  categoryBadgeActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  categoryTextActive: {
    color: theme.colors.secondary,
  },
  amountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  amountCol: {
    flex: 1,
  },
  amountInput: {
    backgroundColor: '#374151',
    color: theme.colors.text,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsHeader: {
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemContent: {
    flex: 1,
    paddingRight: 12,
  },
  itemAmount: {
    color: theme.colors.primary,
    fontWeight: '800',
    fontSize: 18, // text-lg
  },
  itemCategory: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  itemNote: {
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  editButton: {
    backgroundColor: '#2563eb', // blue-600
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#4b5563', // gray-600
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#f87171', // red-400
    fontWeight: 'bold',
  }
});

export default SearchFilterScreen;