import { supabase } from '../config/supabase';

export const planningService = {
  createPlanning: async (planning) => {
    try {
      const { data, error } = await supabase
        .from('plannings')
        .insert([planning])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Create planning error:', error.message);
      throw error;
    }
  },

  getPlannings: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('plannings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get plannings error:', error.message);
      throw error;
    }
  },

  updatePlanning: async (planningId, updates) => {
    try {
      const { data, error } = await supabase
        .from('plannings')
        .update(updates)
        .eq('id', planningId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Update planning error:', error.message);
      throw error;
    }
  },

  deletePlanning: async (planningId) => {
    try {
      const { error } = await supabase
        .from('plannings')
        .delete()
        .eq('id', planningId);

      if (error) throw error;
    } catch (error) {
      console.error('Delete planning error:', error.message);
      throw error;
    }
  },

  updatePlanningProgress: async (planningId, amount) => {
    try {
      const { data: currentPlanning, error: getError } = await supabase
        .from('plannings')
        .select('current_amount')
        .eq('id', planningId)
        .single();

      if (getError) throw getError;

      const newAmount = currentPlanning.current_amount + amount;

      const { data, error: updateError } = await supabase
        .from('plannings')
        .update({ current_amount: newAmount })
        .eq('id', planningId)
        .select();

      if (updateError) throw updateError;
      return data[0];
    } catch (error) {
      console.error('Update planning progress error:', error.message);
      throw error;
    }
  },

  completePlanning: async (planningId) => {
    try {
      const { error } = await supabase
        .from('plannings')
        .update({ 
          status: 'completed',
          current_amount: 0
        })
        .eq('id', planningId);

      if (error) throw error;
    } catch (error) {
      console.error('Complete planning error:', error.message);
      throw error;
    }
  },
}; 