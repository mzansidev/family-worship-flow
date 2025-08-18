
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child' | 'teen' | 'participant';
  created_at: string;
}

export const useFamilyMembers = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchMembers = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError('');
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id as any)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching family members:', error);
        setError('Failed to load family members');
        return;
      }

      if (data && Array.isArray(data)) {
        // Type guard and filter for valid members
        const validMembers = data.filter((member): member is any => 
          member && typeof member === 'object' && 
          'id' in member && 'name' in member && 'role' in member && 'created_at' in member
        );
        setMembers(validMembers.map(member => ({
          id: member.id,
          name: member.name,
          role: member.role,
          created_at: member.created_at
        })) as unknown as FamilyMember[]);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error in fetchMembers:', error);
      setError('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (name: string, role: FamilyMember['role']) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .insert({
          user_id: user.id,
          name,
          role,
        } as any)
        .select()
        .single();

      if (error) throw error;

      if (data && typeof data === 'object' && 'id' in data) {
        const newMember = {
          id: (data as any).id,
          name: (data as any).name,
          role: (data as any).role,
          created_at: (data as any).created_at
        } as FamilyMember;
        setMembers(prev => [...prev, newMember]);
        return newMember;
      }
    } catch (error) {
      console.error('Error adding family member:', error);
      setError('Failed to add family member');
      throw error;
    }
  };

  const updateMember = async (id: string, name: string, role: FamilyMember['role']) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('family_members')
        .update({ name, role } as any)
        .eq('id', id as any);

      if (error) throw error;

      setMembers(prev => 
        prev.map(member => 
          member.id === id 
            ? { ...member, name, role }
            : member
        )
      );
    } catch (error) {
      console.error('Error updating family member:', error);
      setError('Failed to update family member');
      throw error;
    }
  };

  const deleteMember = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id as any);

      if (error) throw error;

      setMembers(prev => prev.filter(member => member.id !== id));
    } catch (error) {
      console.error('Error deleting family member:', error);
      setError('Failed to delete family member');
      throw error;
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [user]);

  return {
    members,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    refetch: fetchMembers
  };
};
