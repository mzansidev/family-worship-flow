
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useUserStats = () => {
  const [stats, setStats] = useState({
    totalDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    thisMonth: 0,
    weeklyGoal: 7,
    completedThisWeek: 0,
    lastWorshipDate: null as Date | null
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id as any)
        .single();

      if (userStats && typeof userStats === 'object') {
        // Calculate this month's worship days
        const { data: monthlyEntries } = await supabase
          .from('daily_worship_entries')
          .select('date')
          .eq('user_id', user.id as any)
          .eq('is_completed', true as any)
          .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);

        // Calculate this week's completed days
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        
        const { data: weeklyEntries } = await supabase
          .from('daily_worship_entries')
          .select('date')
          .eq('user_id', user.id as any)
          .eq('is_completed', true as any)
          .gte('date', startOfWeek.toISOString().split('T')[0]);

        setStats({
          totalDays: (userStats as any).total_worship_days || 0,
          currentStreak: (userStats as any).current_streak || 0,
          longestStreak: (userStats as any).longest_streak || 0,
          thisMonth: monthlyEntries?.length || 0,
          weeklyGoal: 7,
          completedThisWeek: weeklyEntries?.length || 0,
          lastWorshipDate: (userStats as any).last_worship_date ? new Date((userStats as any).last_worship_date) : null
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (completedToday: boolean) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Update user stats
      const newTotalDays = completedToday ? stats.totalDays + 1 : stats.totalDays;
      let newCurrentStreak = stats.currentStreak;
      let newLongestStreak = stats.longestStreak;

      if (completedToday) {
        // Check if this continues a streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (stats.lastWorshipDate && 
            new Date(stats.lastWorshipDate).toDateString() === yesterday.toDateString()) {
          newCurrentStreak += 1;
        } else {
          newCurrentStreak = 1;
        }
        
        if (newCurrentStreak > newLongestStreak) {
          newLongestStreak = newCurrentStreak;
        }
      }

      await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          total_worship_days: newTotalDays,
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_worship_date: completedToday ? today : (stats.lastWorshipDate ? stats.lastWorshipDate.toISOString().split('T')[0] : null)
        } as any);

      await fetchUserStats(); // Refresh stats
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  return { stats, loading, updateStats, refetch: fetchUserStats };
};
