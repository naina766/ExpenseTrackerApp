import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ExpenseContext } from '../context/ExpenseContext';
import LoadingOverlay from '../components/LoadingOverlay';

const ExpenseListScreen = ({ navigation }) => {
  const { expenses, loading, deleteExpense, error } = useContext(ExpenseContext);

  const confirmDelete = (id) => {
    Alert.alert('Delete expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id) }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.details}>
        <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.note}>{item.note || 'No note provided'}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('Add', { expense: item })}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item._id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expense History</Text>
        <Text style={styles.subtitle}>Tap delete to remove old transactions</Text>
      </View>
      {loading && <LoadingOverlay />}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {expenses.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses found. Add your first expense from the Add tab.</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
  header: { marginBottom: 20 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#94a3b8', marginTop: 6 },
  list: { paddingBottom: 40 },
  card: { backgroundColor: '#111827', borderRadius: 20, padding: 18, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  details: { flex: 1, paddingRight: 12 },
  amount: { color: '#38bdf8', fontSize: 18, fontWeight: '800' },
  category: { color: '#e2e8f0', marginTop: 6 },
  note: { color: '#94a3b8', marginTop: 4 },
  actions: { alignItems: 'flex-end', justifyContent: 'space-between' },
  editButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 8 },
  editText: { color: '#ffffff', fontWeight: '700' },
  deleteButton: { backgroundColor: '#374151', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  deleteText: { color: '#f87171', fontWeight: '700' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyText: { color: '#94a3b8', textAlign: 'center', fontSize: 16 },
  errorText: { color: '#f87171', textAlign: 'center', marginBottom: 10 }
});

export default ExpenseListScreen;
