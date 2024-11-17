import { supabase } from '../config/supabase';

export const transactionService = {
  createTransaction: async (transaction) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Create transaction error:', error.message);
      throw error;
    }
  },

  getTransactions: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get transactions error:', error.message);
      throw error;
    }
  },

  updateTransaction: async (transactionId, updates) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Update transaction error:', error.message);
      throw error;
    }
  },

  deleteTransaction: async (transactionId) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Delete transaction error:', error.message);
      throw error;
    }
  }
}; 