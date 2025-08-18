
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Book, Play, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';

interface WeeklyPlanCalendarProps {
  plan: any;
  onDaySelect: (day: number) => void;
  selectedDay: number;
  onUpdateAssignment: (day: number, role: string, memberId: string) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WORSHIP_ROLES = [
  { key: 'song_leader', label: 'Song Leader', icon: Play },
  { key: 'scripture_reader', label: 'Scripture Reader', icon: Book },
  { key: 'prayer_leader', label: 'Prayer Leader', icon: Users },
  { key: 'discussion_leader', label: 'Discussion Leader', icon: Clock }
];

export const WeeklyPlanCalendar: React.FC<WeeklyPlanCalendarProps> = ({
  plan,
  onDaySelect,
  selectedDay,
  onUpdateAssignment
}) => {
  const { members } = useFamilyMembers();
  const [assignments, setAssignments] = useState<{ [key: string]: { [role: string]: string } }>({});

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    return DAYS_OF_WEEK.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  };

  const weekDates = getCurrentWeekDates();

  const handleAssignmentChange = (dayIndex: number, role: string, memberId: string) => {
    const newAssignments = {
      ...assignments,
      [dayIndex]: {
        ...assignments[dayIndex],
        [role]: memberId === 'unassigned' ? '' : memberId
      }
    };
    setAssignments(newAssignments);
    onUpdateAssignment(dayIndex, role, memberId === 'unassigned' ? '' : memberId);
  };

  const getMemberName = (memberId: string) => {
    if (!memberId) return null;
    const member = members.find(m => m.id === memberId);
    return member ? member.name : null;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS_OF_WEEK.map((day, index) => {
          const date = weekDates[index];
          const isSelected = selectedDay === index;
          const dayAssignments = assignments[index] || {};
          
          return (
            <Card 
              key={day}
              className={`p-4 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'hover:border-purple-300 hover:shadow-sm'
              }`}
              onClick={() => onDaySelect(index)}
            >
              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-800">{day}</h3>
                  <p className="text-sm text-gray-600">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>

                <div className="space-y-2">
                  {WORSHIP_ROLES.map(role => {
                    const assignedMemberId = dayAssignments[role.key];
                    const assignedName = getMemberName(assignedMemberId);
                    
                    return (
                      <div key={role.key} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <role.icon className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-600">{role.label}:</span>
                        </div>
                        {assignedName ? (
                          <Badge variant="secondary" className="text-xs">
                            {assignedName}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedDay !== -1 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            Assign Roles for {DAYS_OF_WEEK[selectedDay]}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WORSHIP_ROLES.map(role => (
              <div key={role.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <role.icon className="w-4 h-4 mr-2" />
                  {role.label}
                </label>
                <Select
                  value={assignments[selectedDay]?.[role.key] || 'unassigned'}
                  onValueChange={(value) => handleAssignmentChange(selectedDay, role.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select family member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
