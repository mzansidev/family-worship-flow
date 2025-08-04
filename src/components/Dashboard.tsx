
import React from 'react';
import { BarChart3, Trophy, Calendar, Target, Award, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const Dashboard = () => {
  const stats = {
    totalDays: 23,
    currentStreak: 7,
    longestStreak: 14,
    thisMonth: 18,
    weeklyGoal: 7,
    completedThisWeek: 5
  };

  const badges = [
    { name: 'First Steps', description: 'Complete your first worship', earned: true, icon: '🌟' },
    { name: 'Consistency Champion', description: '7 day streak', earned: true, icon: '🔥' },
    { name: 'Monthly Warrior', description: '20 days in a month', earned: false, icon: '🏆' },
    { name: 'Bible Scholar', description: 'Complete a book study', earned: false, icon: '📚' },
    { name: 'Family Leader', description: '50 total worship sessions', earned: false, icon: '👨‍👩‍👧‍👦' },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2" />
            Dashboard & Profile
          </h2>
          <p className="text-blue-100">Track your family's spiritual journey</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Days"
          value={stats.totalDays}
          icon={Calendar}
          color="bg-green-500"
        />
        <StatsCard
          title="Current Streak"
          value={stats.currentStreak}
          icon={Flame}
          color="bg-orange-500"
        />
        <StatsCard
          title="Longest Streak"
          value={stats.longestStreak}
          icon={Trophy}
          color="bg-yellow-500"
        />
        <StatsCard
          title="This Month"
          value={stats.thisMonth}
          icon={Target}
          color="bg-purple-500"
        />
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Weekly Progress
          </h3>
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>This Week</span>
              <span>{stats.completedThisWeek} / {stats.weeklyGoal} days</span>
            </div>
            <Progress value={(stats.completedThisWeek / stats.weeklyGoal) * 100} className="h-3" />
          </div>
          <p className="text-sm text-gray-600">
            {stats.weeklyGoal - stats.completedThisWeek} more days to reach your weekly goal!
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-amber-600" />
            Badges & Achievements
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map((badge, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  badge.earned 
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${badge.earned ? 'text-amber-800' : 'text-gray-600'}`}>
                      {badge.name}
                    </h4>
                    <p className={`text-sm ${badge.earned ? 'text-amber-600' : 'text-gray-500'}`}>
                      {badge.description}
                    </p>
                  </div>
                  {badge.earned && (
                    <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                      Earned
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
        <div className="p-4">
          <h3 className="font-semibold text-emerald-800 mb-2">🎯 Keep Going!</h3>
          <p className="text-emerald-700 text-sm">
            You're doing great! Just 3 more days to reach your longest streak record. 
            Your family worship consistency is building lasting spiritual habits.
          </p>
        </div>
      </Card>
    </div>
  );
};

const StatsCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}> = ({ title, value, icon: Icon, color }) => {
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`${color} p-2 rounded-lg`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </Card>
  );
};
