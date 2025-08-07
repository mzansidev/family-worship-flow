
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const fetchFamilyMembers = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching family members:', error);
        toast({
          title: 'Error',
          description: 'Failed to load family members',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setFamilyMembers(data as FamilyMember[]);
      }
    } catch (error) {
      console.error('Error in fetchFamilyMembers:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFamilyMember = async (name: string, role: string = 'participant') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .insert({
          user_id: user.id,
          name,
          role,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setFamilyMembers(prev => [...prev, data as FamilyMember]);
        toast({
          title: 'Success',
          description: `${name} has been added to your family`,
        });
      }
    } catch (error) {
      console.error('Error adding family member:', error);
      toast({
        title: 'Error',
        description: 'Failed to add family member',
        variant: 'destructive',
      });
    }
  };

  const updateFamilyMember = async (id: string, name: string, role: string) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .update({ name, role })
        .eq('id', id);

      if (error) throw error;

      setFamilyMembers(prev =>
        prev.map(member =>
          member.id === id ? { ...member, name, role } : member
        )
      );

      toast({
        title: 'Success',
        description: 'Family member updated',
      });
    } catch (error) {
      console.error('Error updating family member:', error);
      toast({
        title: 'Error',
        description: 'Failed to update family member',
        variant: 'destructive',
      });
    }
  };

  const deleteFamilyMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFamilyMembers(prev => prev.filter(member => member.id !== id));

      toast({
        title: 'Success',
        description: 'Family member removed',
      });
    } catch (error) {
      console.error('Error deleting family member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove family member',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchFamilyMembers();
  }, [user]);

  return {
    familyMembers,
    loading,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    refetch: fetchFamilyMembers,
  };
};
