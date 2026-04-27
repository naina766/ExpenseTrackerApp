import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Animated } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExpenseContext } from '../context/ExpenseContext';
import LoadingOverlay from '../components/LoadingOverlay';
import { z } from 'zod';

const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Others'];

const expenseSchema = z.object({
  amount: z.string().min(1, 'Amount is required').transform((val) => parseFloat(val)).refine((val) => val > 0, 'Amount must be greater than zero'),
  category: z.enum(['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Others'], { required_error: 'Category is required' }),
  date: z.string().optional(),
  note: z.string().optional(),
});


const AddExpenseScreen = ({ route, navigation }) => {
  const { addExpense, updateExpense, loading, error } = useContext(ExpenseContext);
  const editingExpense = route.params?.expense;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: '',
      category: 'Food',
      date: '',
      note: '',
    },
  });

  const handlePressIn = () => {
    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (editingExpense) {
      setValue('amount', editingExpense.amount.toString());
      setValue('category', editingExpense.category);
      setValue('date', editingExpense.date ? editingExpense.date.split('T')[0] : '');
      setValue('note', editingExpense.note || '');
    }
  }, [editingExpense, setValue]);

  const onSubmit = async (data) => {
    try {
      const expenseData = {
        amount: data.amount,
        category: data.category,
        note: data.note,
      };
      if (data.date) expenseData.date = data.date;

      if (editingExpense) {
        await updateExpense(editingExpense._id, expenseData);
        Alert.alert('Success', 'Expense updated successfully');
        navigation.goBack();
      } else {
        await addExpense(expenseData);
        reset();
        Alert.alert('Success', 'Expense added successfully');
      }
    } catch (err) {
      Alert.alert('Error', error || 'Unable to save expense');
    }
  };

  return (
    <ScrollView className="flex-1 bg-secondary" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View className="mb-5">
        <Text className="text-text text-4xl font-extrabold">{editingExpense ? 'Edit Expense' : 'Add Expense'}</Text>
        <Text className="text-textSecondary mt-2">{editingExpense ? 'Update your expense details' : 'Track a new expense quickly'}</Text>
      </View>
      <View className="bg-surface rounded-3xl p-5">
        <Text className="text-textSecondary mb-2 mt-3">Amount</Text>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              className="bg-gray-700 text-text rounded-2xl px-4 py-4"
            />
          )}
        />
        {errors.amount && <Text className="text-error mt-1">{errors.amount.message}</Text>}

        <Text className="text-textSecondary mb-2 mt-3">Category</Text>
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row flex-wrap gap-3">
              {categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  className={`bg-gray-700 px-4 py-3 rounded-2xl mb-3 ${value === item ? 'bg-primary' : ''}`}
                  onPress={() => onChange(item)}
                >
                  <Text className={`font-bold ${value === item ? 'text-secondary' : 'text-textSecondary'}`}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        {errors.category && <Text className="text-error mt-1">{errors.category.message}</Text>}

        <Text className="text-textSecondary mb-2 mt-3">Date (YYYY-MM-DD)</Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Optional"
              placeholderTextColor="#94a3b8"
              className="bg-gray-700 text-text rounded-2xl px-4 py-4"
            />
          )}
        />

        <Text className="text-textSecondary mb-2 mt-3">Note</Text>
        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Optional note"
              placeholderTextColor="#94a3b8"
              className="bg-gray-700 text-text rounded-2xl px-4 py-4 min-h-24"
              multiline
            />
          )}
        />

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 items-center mt-5"
            onPress={handleSubmit(onSubmit)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={loading}
          >
            <Text className="text-secondary font-bold text-base">
              {loading ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save Expense'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        {error ? <Text className="text-error text-center mt-3">{error}</Text> : null}
      </View>
      {loading && <LoadingOverlay />}
    </ScrollView>
  );
};

export default AddExpenseScreen;
