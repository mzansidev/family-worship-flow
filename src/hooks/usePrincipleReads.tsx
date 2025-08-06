
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const usePrincipleReads = () => {
  const [readPrinciples, setReadPrinciples] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchReadPrinciples();
    }
  }, [user]);

  const fetchReadPrinciples = async () => {
    if (!user) return;

    try {
      // Use raw SQL query to access the user_principle_reads table
      const { data, error } = await supabase
        .rpc('get_user_principle_reads', { p_user_id: user.id });

      if (error) {
        console.error('Error fetching read principles:', error);
        // If the function doesn't exist, fallback to empty set
        setReadPrinciples(new Set());
      } else {
        const readIds = new Set(data?.map((item: any) => item.principle_id) || []);
        setReadPrinciples(readIds);
      }
    } catch (error) {
      console.error('Error fetching read principles:', error);
      setReadPrinciples(new Set());
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (principleId: string) => {
    if (!user) return;

    try {
      // Use raw SQL query to insert the read record
      const { error } = await supabase
        .rpc('mark_principle_as_read', { 
          p_user_id: user.id, 
          p_principle_id: principleId 
        });

      if (error) {
        console.error('Error marking principle as read:', error);
        throw error;
      }
      
      setReadPrinciples(prev => new Set([...prev, principleId]));
    } catch (error) {
      console.error('Error marking principle as read:', error);
      throw error;
    }
  };

  const getUnreadCount = (principleIds: string[]) => {
    return principleIds.filter(id => !readPrinciples.has(id)).length;
  };

  return {
    readPrinciples,
    loading,
    markAsRead,
    getUnreadCount,
    refetch: fetchReadPrinciples
  };
};
