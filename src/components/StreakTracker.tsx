
import React from 'react';
import { Calendar, Flame, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const StreakTracker = () => {
  const currentStreak = 7;
  const totalDays = 23;

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Flame className="w-6 h-6 mr-2 text-orange-300" />
            Worship Streak
          </h2>
          <Trophy className="w-6 h-6 text-yellow-300" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{currentStreak}</div>
            <div className="text-blue-100 text-sm">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{totalDays}</div>
            <div className="text-blue-100 text-sm">Total Days</div>
          </div>
        </div>

        <div className="mt-4 bg-white/20 rounded-full p-1">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${(currentStreak / 30) * 100}%` }}
          />
        </div>
        <div className="text-center mt-2 text-blue-100 text-sm">
          {30 - currentStreak} days to next milestone
        </div>
      </div>
    </Card>
  );
};
