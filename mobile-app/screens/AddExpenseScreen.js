import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Animated, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExpenseContext } from '../context/ExpenseContext';
import LoadingOverlay from '../components/LoadingOverlay';
import { z } from 'zod';
import { theme } from '../theme';

const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Others'];

const expenseSchema = z.object({
  amount: z.string().min(1, 'Amount is required').transform((val) => parseFloat(val)).refine((val) => val > 0, 'Amount must be greater than zero'),
  category: z.enum(['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Others'], { required_error: 'Category is required' }),
  date: z.string().optional().refine((val) => {
    if (!val) return true; // Optional field
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false; // Basic regex check
    const d = new Date(val);
    return !isNaN(d.getTime()) && val === d.toISOString().split('T')[0]; // Valid calendar date check
  }, 'Invalid date format. Use YYYY-MM-DD and a real calendar date.'),
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{editingExpense ? 'Edit Expense' : 'Add Expense'}</Text>
        <Text style={styles.headerSubtitle}>{editingExpense ? 'Update your expense details' : 'Track a new expense quickly'}</Text>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Amount</Text>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          )}
        />
        {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}

        <Text style={styles.label}>Category</Text>
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <View style={styles.categoryContainer}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.categoryItem, value === item && styles.categoryItemActive]}
                  onPress={() => onChange(item)}
                >
                  <Text style={[styles.categoryText, value === item && styles.categoryTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Optional"
              placeholderTextColor="#94a3b8"
            />
          )}
        />
        {errors.date && <Text style={styles.errorText}>{errors.date.message}</Text>}

        <Text style={styles.label}>Note</Text>
        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.inputMultiline}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Optional note"
              placeholderTextColor="#94a3b8"
              multiline
            />
          )}
        />

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save Expense'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        {error ? <Text style={styles.serverError}>{error}</Text> : null}
      </View>
      {loading && <LoadingOverlay />}
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
  formContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
  },
  label: {
    color: theme.colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#374151', // gray-700
    color: theme.colors.text,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputMultiline: {
    backgroundColor: '#374151',
    color: theme.colors.text,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 96, // min-h-24
  },
  errorText: {
    color: theme.colors.error,
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryItemActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  categoryTextActive: {
    color: theme.colors.secondary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: theme.colors.secondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  serverError: {
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 12,
  }
});

export default AddExpenseScreen;
