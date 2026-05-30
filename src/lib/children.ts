// ============================================================
// TinySteps — Child Profile Service
// All Supabase calls for child profiles in one place
// ============================================================
import { supabase } from './supabase';
import type { ChildProfile } from '../types';

export const childService = {
  // Get all children for a parent
  getAll: async (userId: string) => {
    const { data, error } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');
    return { data, error };
  },

  // Create a new child profile
  create: async (profile: Omit<ChildProfile, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('child_profiles')
      .insert(profile)
      .select()
      .single();
    return { data, error };
  },

  // Update existing child profile
  update: async (id: string, updates: Partial<ChildProfile>) => {
    const { data, error } = await supabase
      .from('child_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Delete a child profile
  delete: async (id: string) => {
    const { error } = await supabase
      .from('child_profiles')
      .delete()
      .eq('id', id);
    return { error };
  },
};
