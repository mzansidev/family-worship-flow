
import React, { useState } from 'react';
import { BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const WeeklyWorshipPlan = () => {
  const [selectedBook, setSelectedBook] = useState('matthew');
  
  const bibleBooks = [
    { value: 'matthew', name: 'Matthew', chapters: 28 },
    { value: 'mark', name: 'Mark', chapters: 16 },
    { value: 'luke', name: 'Luke', chapters: 24 },
    { value: 'john', name: 'John', chapters: 21 },
    { value: 'psalms', name: 'Psalms', chapters: 150 },
    { value: 'proverbs', name: 'Proverbs', chapters: 31 },
  ];

  const weeklyPlan = [
    { day: 'Monday', passage: 'Matthew 1:1-17', focus: 'Jesus\' Genealogy' },
    { day: 'Tuesday', passage: 'Matthew 1:18-25', focus: 'The Birth Announced' },
    { day: 'Wednesday', passage: 'Matthew 2:1-12', focus: 'The Wise Men' },
    { day: 'Thursday', passage: 'Matthew 2:13-23', focus: 'Escape to Egypt' },
    { day: 'Friday', passage: 'Matthew 3:1-12', focus: 'John the Baptist' },
    { day: 'Sabbath', passage: 'Matthew 3:13-17', focus: 'Jesus\' Baptism - Special Study' },
    { day: 'Sunday', passage: 'Review & Application', focus: 'Family Discussion' },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <BookOpen className="w-6 h-6 mr-2" />
            Weekly Worship Plan
          </h2>
          <p className="text-purple-100">Study God's word together as a family</p>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Bible Book
          </label>
          <Select value={selectedBook} onValueChange={setSelectedBook}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bibleBooks.map((book) => (
                <SelectItem key={book.value} value={book.value}>
                  {book.name} ({book.chapters} chapters)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white">
          Start New Study
        </Button>
      </div>

      <Card className="border border-purple-200 bg-purple-50">
        <div className="p-4">
          <h3 className="font-semibold text-purple-800 mb-2">This Week's Focus</h3>
          <p className="text-purple-700">The Early Life of Jesus - Matthew Chapters 1-3</p>
          <div className="mt-3 text-sm text-purple-600">
            Week 1 of 28 • Started January 8, 2024
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {weeklyPlan.map((day, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{day.day}</h4>
                    <p className="text-sm text-gray-600 mt-1">{day.passage}</p>
                    <p className="text-xs text-purple-600 font-medium mt-1">{day.focus}</p>
                  </div>
                  {day.day === 'Sabbath' && (
                    <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                      Special
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
        <div className="p-4">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Sabbath Special Feature
          </h3>
          <p className="text-amber-700 text-sm">
            This Sabbath includes extended study time with nature object lessons, 
            missionary stories, and deeper discussion questions for the whole family.
          </p>
        </div>
      </Card>
    </div>
  );
};
