import React, { useContext, useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { ExpenseContext } from '../context/ExpenseContext';

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
    <View className="bg-surface rounded-3xl p-5 mb-3 flex-row justify-between items-start">
      <View className="flex-1 pr-3">
        <Text className="text-primary font-extrabold text-lg">${item.amount.toFixed(2)}</Text>
        <Text className="text-text font-bold">{item.category}</Text>
        <Text className="text-textSecondary mt-1">{item.note || 'No note provided'}</Text>
      </View>
      <View className="items-end">
        <TouchableOpacity className="bg-blue-600 rounded-2xl px-3 py-2 mb-2" onPress={() => navigation.navigate('Add', { expense: item })}>
          <Text className="text-white font-bold">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-gray-600 rounded-2xl px-3 py-2" onPress={() => confirmDelete(item._id)}>
          <Text className="text-red-400 font-bold">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-secondary p-5">
      <View className="mb-5">
        <Text className="text-text text-3xl font-extrabold">Search & Filter</Text>
        <Text className="text-textSecondary mt-2">Find and manage your expenses</Text>
      </View>
      <View className="bg-surface rounded-3xl p-5 mb-5">
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search by note or category"
          placeholderTextColor="#94a3b8"
          className="bg-gray-700 text-text rounded-2xl px-4 py-3 mb-4"
        />
        <Text className="text-textSecondary mb-2">Filter by Category</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          <TouchableOpacity
            className={`bg-gray-700 px-3 py-2 rounded-2xl ${selectedCategory === '' ? 'bg-primary' : ''}`}
            onPress={() => setSelectedCategory('')}
          >
            <Text className={`font-bold ${selectedCategory === '' ? 'text-secondary' : 'text-textSecondary'}`}>All</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              className={`bg-gray-700 px-3 py-2 rounded-2xl ${selectedCategory === cat ? 'bg-primary' : ''}`}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text className={`font-bold ${selectedCategory === cat ? 'text-secondary' : 'text-textSecondary'}`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-textSecondary mb-2">Min Amount</Text>
            <TextInput
              value={minAmount}
              onChangeText={setMinAmount}
              placeholder="0"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              className="bg-gray-700 text-text rounded-2xl px-4 py-3"
            />
          </View>
          <View className="flex-1">
            <Text className="text-textSecondary mb-2">Max Amount</Text>
            <TextInput
              value={maxAmount}
              onChangeText={setMaxAmount}
              placeholder="1000"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              className="bg-gray-700 text-text rounded-2xl px-4 py-3"
            />
          </View>
        </View>
      </View>
      <Text className="text-text font-bold mb-3">Results ({filteredExpenses.length})</Text>
      {filteredExpenses.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-textSecondary text-center">No expenses match your filters.</Text>
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

export default SearchFilterScreen;