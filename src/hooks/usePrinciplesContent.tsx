
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PrincipleContent {
  id: string;
  title: string;
  content: string;
  category_id: string;
  read_time: string;
  is_new: boolean;
  created_at: string;
  updated_at: string;
}

export const usePrinciplesContent = () => {
  const [principles, setPrinciples] = useState<PrincipleContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPrinciples = async () => {
    try {
      setError('');
      const { data, error } = await supabase
        .from('principles_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching principles:', error);
        setError('Failed to load principles');
        return;
      }

      if (data && Array.isArray(data)) {
        // Type guard and filter for valid principles
        const validPrinciples = data.filter((principle): principle is any => 
          principle && typeof principle === 'object' && 
          'id' in principle && 'title' in principle && 'content' in principle
        );
        setPrinciples(validPrinciples as unknown as PrincipleContent[]);
      } else {
        setPrinciples([]);
      }
    } catch (error) {
      console.error('Error in fetchPrinciples:', error);
      setError('Failed to load principles');
    } finally {
      setLoading(false);
    }
  };

  const addPrinciple = async (principle: Omit<PrincipleContent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('principles_content')
        .insert(principle as any)
        .select()
        .single();

      if (error) throw error;

      if (data && typeof data === 'object') {
        const newPrinciple = data as unknown as PrincipleContent;
        setPrinciples(prev => [newPrinciple, ...prev]);
        return newPrinciple;
      }
    } catch (error) {
      console.error('Error adding principle:', error);
      setError('Failed to add principle');
      throw error;
    }
  };

  const updatePrinciple = async (id: string, updates: Partial<PrincipleContent>) => {
    try {
      const { data, error } = await supabase
        .from('principles_content')
        .update(updates as any)
        .eq('id', id as any)
        .select()
        .single();

      if (error) throw error;

      if (data && typeof data === 'object') {
        const updatedPrinciple = data as unknown as PrincipleContent;
        setPrinciples(prev =>
          prev.map(principle =>
            principle.id === id ? updatedPrinciple : principle
          )
        );
        return updatedPrinciple;
      }
    } catch (error) {
      console.error('Error updating principle:', error);
      setError('Failed to update principle');
      throw error;
    }
  };

  const deletePrinciple = async (id: string) => {
    try {
      const { error } = await supabase
        .from('principles_content')
        .delete()
        .eq('id', id as any);

      if (error) throw error;

      setPrinciples(prev => prev.filter(principle => principle.id !== id));
    } catch (error) {
      console.error('Error deleting principle:', error);
      setError('Failed to delete principle');
      throw error;
    }
  };

  useEffect(() => {
    fetchPrinciples();
  }, []);

  return {
    principles,
    loading,
    error,
    addPrinciple,
    updatePrinciple,
    deletePrinciple,
    refetch: fetchPrinciples
  };
};
