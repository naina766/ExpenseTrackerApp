import React, { createContext, useEffect, useMemo, useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { AuthContext } from './AuthContext';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (state.isConnected) {
        syncPendingActions();
      }
    });
    return unsubscribe;
  }, []);

  // React Query for fetching expenses
  const { data: expenses = [], isLoading: loading, error } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const response = await api.get('/expenses');
      await AsyncStorage.setItem('cached_expenses', JSON.stringify(response.data));
      return response.data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: async () => {
      // Load from cache if offline
      if (!isOnline) {
        const cached = await AsyncStorage.getItem('cached_expenses');
        if (cached) {
          return JSON.parse(cached);
        }
      }
    },
  });

  // Mutations for CRUD operations
  const addExpenseMutation = useMutation({
    mutationFn: (expense) => api.post('/expenses', expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, expense }) => api.put(`/expenses/${id}`, expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const addExpense = async (expense) => {
    if (!isOnline) {
      // Queue action for later
      const action = { type: 'ADD', data: expense, id: Date.now().toString() };
      setPendingActions(prev => [...prev, action]);
      await AsyncStorage.setItem('pending_actions', JSON.stringify([...pendingActions, action]));
      // Add to local state immediately
      queryClient.setQueryData(['expenses'], (old) => [expense, ...(old || [])]);
      return;
    }

    try {
      await addExpenseMutation.mutateAsync(expense);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateExpense = async (id, expense) => {
    if (!isOnline) {
      const action = { type: 'UPDATE', data: { id, expense }, actionId: Date.now().toString() };
      setPendingActions(prev => [...prev, action]);
      await AsyncStorage.setItem('pending_actions', JSON.stringify([...pendingActions, action]));
      queryClient.setQueryData(['expenses'], (old) =>
        old?.map(item => item._id === id ? { ...item, ...expense } : item) || []
      );
      return;
    }

    try {
      await updateExpenseMutation.mutateAsync({ id, expense });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteExpense = async (id) => {
    if (!isOnline) {
      const action = { type: 'DELETE', data: { id }, actionId: Date.now().toString() };
      setPendingActions(prev => [...prev, action]);
      await AsyncStorage.setItem('pending_actions', JSON.stringify([...pendingActions, action]));
      queryClient.setQueryData(['expenses'], (old) => old?.filter(item => item._id !== id) || []);
      return;
    }

    try {
      await deleteExpenseMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const syncPendingActions = async () => {
    const actions = await AsyncStorage.getItem('pending_actions');
    if (!actions) return;

    const parsedActions = JSON.parse(actions);
    for (const action of parsedActions) {
      try {
        switch (action.type) {
          case 'ADD':
            await api.post('/expenses', action.data);
            break;
          case 'UPDATE':
            await api.put(`/expenses/${action.data.id}`, action.data.expense);
            break;
          case 'DELETE':
            await api.delete(`/expenses/${action.data.id}`);
            break;
        }
      } catch (err) {
        console.error('Failed to sync action:', action, err);
      }
    }

    await AsyncStorage.removeItem('pending_actions');
    setPendingActions([]);
    // Refetch expenses to get server state
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  };

  const summary = useMemo(() => {
    const totals = expenses.reduce(
      (acc, expense) => {
        const category = expense.category || 'Others';
        acc.total += expense.amount;
        acc.byCategory[category] = (acc.byCategory[category] || 0) + expense.amount;
        return acc;
      },
      { total: 0, byCategory: {} }
    );

    const highestCategory = Object.entries(totals.byCategory).sort((a, b) => b[1] - a[1])[0] || ['None', 0];
    return {
      total: totals.total,
      byCategory: totals.byCategory,
      highestCategory: { category: highestCategory[0], amount: highestCategory[1] }
    };
  }, [expenses]);

  const exportToCSV = async () => {
    const csvData = expenses.map(exp => ({
      Date: new Date(exp.date).toLocaleDateString(),
      Description: exp.description,
      Amount: exp.amount,
      Category: exp.category || 'Others'
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    return csvString;
  };

  const exportToPDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Expense Report</h1>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map(exp => `
                <tr>
                  <td>${new Date(exp.date).toLocaleDateString()}</td>
                  <td>${exp.description}</td>
                  <td>$${exp.amount}</td>
                  <td>${exp.category || 'Others'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    return htmlContent;
  };

  const value = useMemo(
    () => ({
      expenses,
      loading,
      error,
      addExpense,
      updateExpense,
      deleteExpense,
      summary,
      exportToCSV,
      exportToPDF,
      isOnline,
      pendingActions,
      setError: () => {} // Keep for compatibility
    }),
    [expenses, loading, error, summary, isOnline, pendingActions]
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};
