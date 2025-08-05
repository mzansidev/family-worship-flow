
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  created_at: string;
}

export const useFamilyMembers = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFamilyMembers();
    }
  }, [user]);

  const fetchFamilyMembers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

      if (error) throw error;
      setFamilyMembers(data || []);
    } catch (error) {
      console.error('Error fetching family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFamilyMember = async (name: string, role: string = 'participant') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .insert([{ user_id: user.id, name, role }])
        .select()
        .single();

      if (error) throw error;
      await fetchFamilyMembers();
      return data;
    } catch (error) {
      console.error('Error adding family member:', error);
      throw error;
    }
  };

  const updateFamilyMember = async (id: string, updates: Partial<FamilyMember>) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchFamilyMembers();
    } catch (error) {
      console.error('Error updating family member:', error);
      throw error;
    }
  };

  const deleteFamilyMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchFamilyMembers();
    } catch (error) {
      console.error('Error deleting family member:', error);
      throw error;
    }
  };

  return {
    familyMembers,
    loading,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    refetch: fetchFamilyMembers
  };
};
