
import React, { useState } from 'react';
import { Calendar, Book, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke',
  'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
  'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

const TOPICAL_THEMES = [
  'Prayer and Faith', 'God\'s Love and Grace', 'Christian Character', 'Family Values',
  'Stewardship', 'Second Coming', 'Health and Wellness', 'Service and Mission'
];

interface WeeklyPlanSetupProps {
  onCreatePlan: (studyType: string, selection: string) => void;
  loading: boolean;
}

export const WeeklyPlanSetup: React.FC<WeeklyPlanSetupProps> = ({ onCreatePlan, loading }) => {
  const [studyType, setStudyType] = useState('bible-book');
  const [selectedBook, setSelectedBook] = useState('Genesis');
  const [selectedTopic, setSelectedTopic] = useState('Prayer and Faith');

  const handleCreatePlan = () => {
    const selection = studyType === 'bible-book' ? selectedBook : selectedTopic;
    onCreatePlan(studyType, selection);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Weekly Worship Plan
          </h2>
          <p className="text-purple-100">Create a structured weekly worship experience with daily segments and family role assignments</p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Create Your Weekly Plan</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Study Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    studyType === 'bible-book' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'hover:border-purple-300'
                  }`}
                  onClick={() => setStudyType('bible-book')}
                >
                  <div className="flex items-center space-x-3">
                    <Book className="w-6 h-6 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Bible Book Study</h4>
                      <p className="text-sm text-gray-600">Study through a book verse by verse</p>
                      <Badge variant="secondary" className="mt-2">5-10 verses per day</Badge>
                    </div>
                  </div>
                </Card>
                
                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    studyType === 'topical' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'hover:border-purple-300'
                  }`}
                  onClick={() => setStudyType('topical')}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Topical Study</h4>
                      <p className="text-sm text-gray-600">Explore specific themes and topics</p>
                      <Badge variant="secondary" className="mt-2">10-15 minutes per day</Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {studyType === 'bible-book' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bible Book
                </label>
                <Select value={selectedBook} onValueChange={setSelectedBook}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BIBLE_BOOKS.map((book) => (
                      <SelectItem key={book} value={book}>{book}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-2">
                  Perfect for families with children - manageable 5-10 verses per day
                </p>
              </div>
            )}

            {studyType === 'topical' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Topic
                </label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPICAL_THEMES.map((topic) => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-2">
                  Focused 10-15 minute studies on important spiritual themes
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">What you'll get:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 7-day calendar with daily worship segments</li>
                <li>• Family role assignments (song leader, prayer, etc.)</li>
                <li>• Discussion questions for each day</li>
                <li>• Family activities and practical applications</li>
                <li>• Manageable portions perfect for busy families</li>
              </ul>
            </div>

            <Button 
              onClick={handleCreatePlan}
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3"
              size="lg"
            >
              {loading ? 'Creating Weekly Plan...' : 'Create Weekly Plan'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
