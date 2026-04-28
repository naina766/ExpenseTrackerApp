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

  // ✅ NETWORK LISTENER
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);

      if (online) {
        syncPendingActions();
      }
    });

    return unsubscribe;
  }, []);

  // ✅ FETCH EXPENSES (FIXED CACHE FALLBACK)
  const { data: expenses = [], isLoading: loading, error } = useQuery({
    queryKey: ['expenses'],
    enabled: !!token,
    staleTime: 1000 * 60 * 5,

    queryFn: async () => {
      try {
        const response = await api.get('/expenses');
        await AsyncStorage.setItem('cached_expenses', JSON.stringify(response.data));
        return response.data;
      } catch (err) {
        const cached = await AsyncStorage.getItem('cached_expenses');
        if (cached) return JSON.parse(cached);
        throw err;
      }
    },
  });

  // ✅ ADD MUTATION
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
// ✅ DELETE EXPENSE MUTATION (FIXED)
const deleteExpenseMutation = useMutation({
  mutationFn: async (id) => {
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
  },

  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['expenses'] });

    const previousExpenses = queryClient.getQueryData(['expenses']);

    queryClient.setQueryData(['expenses'], (old) =>
      old?.filter((item) => item._id !== id) || []
    );

    return { previousExpenses };
  },

  onError: (err, id, context) => {
    console.log("DELETE ERROR:", err.response?.data || err.message);
    queryClient.setQueryData(['expenses'], context.previousExpenses);
  },

  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  },
});

 const deleteExpense = async (id) => {
  console.log("Online:", isOnline);
  console.log("Deleting ID:", id);
  console.log("Final URL:", `/expenses/${id}`);
  // ✅ OFFLINE SUPPORT (VERY IMPORTANT)
  if (!isOnline) {
    const action = {
      type: 'DELETE',
      data: { id },
      actionId: Date.now().toString(),
    };

    setPendingActions(prev => {
      const updated = [...prev, action];
      AsyncStorage.setItem('pending_actions', JSON.stringify(updated));
      return updated;
    });

    // ✅ instantly update UI
    queryClient.setQueryData(['expenses'], (old) =>
      old?.filter(item => item._id !== id) || []
    );

    console.log("Deleted locally (offline)");
    return;
  }

  // ✅ ONLINE DELETE
  try {
    console.log("Deleting ID:", id);
    await deleteExpenseMutation.mutateAsync(id);
    console.log("Delete success");
  } catch (err) {
    console.log("Delete failed:", err.response?.data || err.message);
    throw err;
  }
};
  // const deleteExpenseMutation = useMutation({
  //   mutationFn: (id) => api.delete(`/expenses/${id}`),

  //   onMutate: async (id) => {
  //     await queryClient.cancelQueries({ queryKey: ['expenses'] });

  //     const previousExpenses = queryClient.getQueryData(['expenses']);

  //     queryClient.setQueryData(['expenses'], (old) =>
  //       old?.filter((item) => item._id !== id) || []
  //     );

  //     return { previousExpenses };
  //   },

  //   onError: (err, id, context) => {
  //     queryClient.setQueryData(['expenses'], context.previousExpenses);
  //   },

  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ['expenses'] });
  //   },
  // });

  // ✅ ADD EXPENSE (OFFLINE SAFE)
  const addExpense = async (expense) => {
    if (!isOnline) {
      const action = {
        type: 'ADD',
        data: expense,
        id: Date.now().toString(),
      };

      setPendingActions(prev => {
        const updated = [...prev, action];
        AsyncStorage.setItem('pending_actions', JSON.stringify(updated));
        return updated;
      });

      const tempExpense = {
        ...expense,
        _id: Date.now().toString(),
        isTemp: true,
      };

      queryClient.setQueryData(['expenses'], (old) => [tempExpense, ...(old || [])]);
      return;
    }

    await addExpenseMutation.mutateAsync(expense);
  };

  // ✅ UPDATE EXPENSE (OFFLINE SAFE)
  const updateExpense = async (id, expense) => {
    if (!isOnline) {
      const action = {
        type: 'UPDATE',
        data: { id, expense },
        actionId: Date.now().toString(),
      };

      setPendingActions(prev => {
        const updated = [...prev, action];
        AsyncStorage.setItem('pending_actions', JSON.stringify(updated));
        return updated;
      });

      queryClient.setQueryData(['expenses'], (old) =>
        old?.map(item => item._id === id ? { ...item, ...expense } : item) || []
      );
      return;
    }

    await updateExpenseMutation.mutateAsync({ id, expense });
  };

  // // ✅ DELETE EXPENSE (OFFLINE SAFE)
  // const deleteExpense = async (id) => {
  //   if (!isOnline) {
  //     const action = {
  //       type: 'DELETE',
  //       data: { id },
  //       actionId: Date.now().toString(),
  //     };

  //     setPendingActions(prev => {
  //       const updated = [...prev, action];
  //       AsyncStorage.setItem('pending_actions', JSON.stringify(updated));
  //       return updated;
  //     });

  //     queryClient.setQueryData(['expenses'], (old) =>
  //       old?.filter(item => item._id !== id) || []
  //     );
  //     return;
  //   }

  //  return await deleteExpenseMutation.mutateAsync(id);
  // };

  // ✅ SYNC OFFLINE ACTIONS
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
        console.error('Sync failed:', action, err);
      }
    }

    await AsyncStorage.removeItem('pending_actions');
    setPendingActions([]);

    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  };

  // ✅ SUMMARY
  const summary = useMemo(() => {
    const totals = expenses.reduce(
      (acc, expense) => {
        const category = expense.category || 'Others';

        acc.total += expense.amount;
        acc.byCategory[category] =
          (acc.byCategory[category] || 0) + expense.amount;

        return acc;
      },
      { total: 0, byCategory: {} }
    );

    const highestCategory =
      Object.entries(totals.byCategory).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

    return {
      total: totals.total,
      byCategory: totals.byCategory,
      highestCategory: {
        category: highestCategory[0],
        amount: highestCategory[1],
      },
    };
  }, [expenses]);

  // ✅ EXPORT CSV
  const exportToCSV = async () => {
    if (!expenses.length) return '';

    const csvData = expenses.map(exp => ({
      Date: new Date(exp.date).toLocaleDateString(),
      Note: exp.note,
      Amount: exp.amount,
      Category: exp.category || 'Others',
    }));

    return [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(',')),
    ].join('\n');
  };

  // ✅ EXPORT PDF (HTML)
  const exportToPDF = async () => {
    return `
      <html>
        <body>
          <h1>Expense Report</h1>
          <table border="1" cellspacing="0" cellpadding="5">
            <tr>
              <th>Date</th>
              <th>Note</th>
              <th>Amount</th>
              <th>Category</th>
            </tr>
            ${expenses.map(exp => `
              <tr>
                <td>${new Date(exp.date).toLocaleDateString()}</td>
                <td>${exp.note || ''}</td>
                <td>${exp.amount}</td>
                <td>${exp.category}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
  };

  const value = useMemo(() => ({
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
  }), [expenses, loading, error, summary, isOnline, pendingActions]);

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};