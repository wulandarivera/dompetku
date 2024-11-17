import React, { createContext, useContext, useReducer } from 'react';
import { authService } from '../services/authService';
import { transactionService } from '../services/transactionService';
import { planningService } from '../services/planningService';

// Initial state
const initialState = {
  user: null,
  balance: 0,
  expenses: 0,
  savings: 0,
  transactions: [],
  plannings: [],
  isLoading: false,
  error: null
};

// Action types
const ActionTypes = {
  SET_USER: 'SET_USER',
  SET_BALANCE: 'SET_BALANCE',
  SET_EXPENSES: 'SET_EXPENSES',
  SET_SAVINGS: 'SET_SAVINGS',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  SET_PLANNINGS: 'SET_PLANNINGS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  RESET_STATE: 'RESET_STATE'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };
    case ActionTypes.SET_BALANCE:
      return { ...state, balance: action.payload };
    case ActionTypes.SET_EXPENSES:
      return { ...state, expenses: action.payload };
    case ActionTypes.SET_SAVINGS:
      return { ...state, savings: action.payload };
    case ActionTypes.SET_TRANSACTIONS:
      return { ...state, transactions: action.payload };
    case ActionTypes.SET_PLANNINGS:
      return { ...state, plannings: action.payload };
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case ActionTypes.RESET_STATE:
      return initialState;
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions
  const actions = {
    setUser: (user) => dispatch({ type: ActionTypes.SET_USER, payload: user }),
    setBalance: (balance) => dispatch({ type: ActionTypes.SET_BALANCE, payload: balance }),
    setExpenses: (expenses) => dispatch({ type: ActionTypes.SET_EXPENSES, payload: expenses }),
    setSavings: (savings) => dispatch({ type: ActionTypes.SET_SAVINGS, payload: savings }),
    setTransactions: (transactions) => dispatch({ type: ActionTypes.SET_TRANSACTIONS, payload: transactions }),
    setPlannings: (plannings) => dispatch({ type: ActionTypes.SET_PLANNINGS, payload: plannings }),
    setLoading: (isLoading) => dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading }),
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    resetState: () => dispatch({ type: ActionTypes.RESET_STATE }),

    // Helper functions
    updateFinancialData: async () => {
      try {
        actions.setLoading(true);
        const user = await authService.getCurrentUser();
        if (user) {
          const [transactionsData, planningsData] = await Promise.all([
            transactionService.getTransactions(user.id),
            planningService.getPlannings(user.id)
          ]);

          let totalBalance = 0;
          let totalExpenses = 0;
          let totalSavings = 0;

          transactionsData.forEach(transaction => {
            const amount = parseFloat(transaction.amount);
            if (transaction.type === 'add') {
              totalBalance += amount;
              totalSavings += amount;
            } else {
              totalBalance -= amount;
              totalExpenses += amount;
              totalSavings = Math.max(0, totalSavings - amount);
            }
          });

          actions.setBalance(totalBalance);
          actions.setExpenses(totalExpenses);
          actions.setSavings(totalSavings);
          actions.setTransactions(transactionsData);
          actions.setPlannings(planningsData);
        }
      } catch (error) {
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    }
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 