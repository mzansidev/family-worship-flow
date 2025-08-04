
import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, ChevronRight, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const WeeklyWorshipPlan = () => {
  const [studyType, setStudyType] = useState<'book' | 'topic'>('book');
  const [selectedBook, setSelectedBook] = useState('matthew');
  const [selectedTopic, setSelectedTopic] = useState('god-nature');
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [weeklyEntries, setWeeklyEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const bibleBooks = [
    { value: 'matthew', name: 'Matthew', chapters: 28 },
    { value: 'mark', name: 'Mark', chapters: 16 },
    { value: 'luke', name: 'Luke', chapters: 24 },
    { value: 'john', name: 'John', chapters: 21 },
    { value: 'psalms', name: 'Psalms', chapters: 150 },
    { value: 'proverbs', name: 'Proverbs', chapters: 31 },
    { value: 'genesis', name: 'Genesis', chapters: 50 },
    { value: 'romans', name: 'Romans', chapters: 16 },
  ];

  const spiritualTopics = [
    { value: 'god-nature', name: 'The Nature of God', weeks: 4 },
    { value: 'salvation', name: 'Salvation & Grace', weeks: 3 },
    { value: 'scripture', name: 'Holy Scripture', weeks: 2 },
    { value: 'trinity', name: 'The Trinity', weeks: 3 },
    { value: 'creation', name: 'Creation', weeks: 2 },
    { value: 'human-nature', name: 'Human Nature', weeks: 2 },
    { value: 'great-controversy', name: 'The Great Controversy', weeks: 4 },
    { value: 'christian-living', name: 'Christian Living', weeks: 3 },
    { value: 'church', name: 'The Church', weeks: 2 },
    { value: 'prophecy', name: 'Prophecy & End Times', weeks: 4 },
    { value: 'sabbath', name: 'The Sabbath', weeks: 2 },
    { value: 'stewardship', name: 'Stewardship', weeks: 2 },
  ];

  const generateCurrentWeekPlan = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);

    const weekPlan = [];
    for (let i = 0; i < 14; i++) { // 2 weeks
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today;
      
      let passage, focus;
      if (studyType === 'book') {
        const bookData = bibleBooks.find(b => b.value === selectedBook);
        const chapter = Math.floor(i / 7) + 1;
        const section = (i % 7) + 1;
        passage = `${bookData?.name} ${chapter}:${section}-${section + 5}`;
        focus = `${bookData?.name} Study - Chapter ${chapter}`;
      } else {
        const topicData = spiritualTopics.find(t => t.value === selectedTopic);
        const weekInTopic = Math.floor(i / 7) + 1;
        const dayInWeek = (i % 7) + 1;
        passage = getTopicPassage(selectedTopic, weekInTopic, dayInWeek);
        focus = `${topicData?.name} - Week ${weekInTopic}`;
      }

      weekPlan.push({
        date: date.toISOString().split('T')[0],
        day: dayName,
        passage,
        focus,
        isToday,
        isPast,
        isSabbath: currentDay === 6
      });
    }
    
    return weekPlan;
  };

  const getTopicPassage = (topic: string, week: number, day: number) => {
    const topicPassages: { [key: string]: string[] } = {
      'god-nature': [
        'Exodus 3:14', 'Psalm 90:1-2', 'Isaiah 55:8-9', 'John 4:24', 
        '1 John 4:8', 'James 1:17', 'Malachi 3:6'
      ],
      'salvation': [
        'Romans 3:23', 'Ephesians 2:8-9', 'John 3:16', 'Romans 6:23',
        'Acts 4:12', '2 Corinthians 5:17', 'Titus 3:5'
      ],
      'scripture': [
        '2 Timothy 3:16-17', 'Psalm 119:105', 'Isaiah 55:11', 'Hebrews 4:12',
        'Matthew 4:4', 'John 17:17', '2 Peter 1:21'
      ]
    };
    
    const passages = topicPassages[topic] || ['Genesis 1:1'];
    return passages[(week - 1) * 7 + (day - 1)] || passages[0];
  };

  const createNewStudyPlan = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('worship_plans')
        .insert([{
          user_id: user.id,
          plan_type: 'weekly',
          study_type: studyType,
          book_name: studyType === 'book' ? selectedBook : null,
          topic_name: studyType === 'topic' ? selectedTopic : null,
          start_date: new Date().toISOString().split('T')[0],
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      
      setCurrentPlan(data);
      await generateWeeklyEntries(data.id);
      
      toast({
        title: "Success",
        description: "New study plan created!"
      });
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create study plan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyEntries = async (planId: string) => {
    if (!user) return;

    const weekPlan = generateCurrentWeekPlan();
    const entries = weekPlan.map(day => ({
      user_id: user.id,
      worship_plan_id: planId,
      date: day.date,
      bible_reading: day.passage,
      theme: day.focus,
      opening_song: 'Be Thou My Vision (SDAH #547)',
      closing_song: 'How Great Thou Art (SDAH #86)',
      discussion_questions: generateDiscussionQuestions(day.focus),
      application: generateApplication(day.focus)
    }));

    const { error } = await supabase
      .from('daily_worship_entries')
      .upsert(entries, { onConflict: 'user_id,date' });

    if (!error) {
      setWeeklyEntries(entries);
    }
  };

  const generateDiscussionQuestions = (theme: string) => {
    return [
      `What does today's passage teach us about ${theme.toLowerCase()}?`,
      'How can we apply this lesson in our daily lives?',
      'What questions do you have about this topic?',
      'How does this connect to other Bible stories you know?',
      'What is one thing you want to remember from today?'
    ];
  };

  const generateApplication = (theme: string) => {
    return `This week, look for ways to apply the lessons from ${theme.toLowerCase()}. Share your observations during your next family worship time.`;
  };

  useEffect(() => {
    if (user) {
      fetchCurrentPlan();
    }
  }, [user]);

  const fetchCurrentPlan = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('worship_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_type', 'weekly')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setCurrentPlan(data);
      setStudyType(data.study_type as 'book' | 'topic');
      if (data.book_name) setSelectedBook(data.book_name);
      if (data.topic_name) setSelectedTopic(data.topic_name);
      
      // Fetch weekly entries
      const { data: entries } = await supabase
        .from('daily_worship_entries')
        .select('*')
        .eq('worship_plan_id', data.id)
        .order('date');
      
      if (entries) setWeeklyEntries(entries);
    }
  };

  const weekPlan = generateCurrentWeekPlan();

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <BookOpen className="w-6 h-6 mr-2" />
            Weekly Worship Plan
          </h2>
          <p className="text-purple-100">Study God's word together as a family - Current & Next 2 Weeks</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Study Type
          </label>
          <Select value={studyType} onValueChange={(value: 'book' | 'topic') => setStudyType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="book">Bible Book</SelectItem>
              <SelectItem value="topic">Spiritual Topics</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {studyType === 'book' ? 'Choose Bible Book' : 'Choose Topic'}
          </label>
          <Select 
            value={studyType === 'book' ? selectedBook : selectedTopic} 
            onValueChange={studyType === 'book' ? setSelectedBook : setSelectedTopic}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(studyType === 'book' ? bibleBooks : spiritualTopics).map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.name} ({studyType === 'book' ? `${(item as any).chapters} chapters` : `${(item as any).weeks} weeks`})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={createNewStudyPlan} 
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {loading ? 'Creating...' : 'Start New Study'}
        </Button>
      </div>

      {currentPlan && (
        <Card className="border border-purple-200 bg-purple-50">
          <div className="p-4">
            <h3 className="font-semibold text-purple-800 mb-2">Current Study Plan</h3>
            <p className="text-purple-700">
              {studyType === 'book' 
                ? `${bibleBooks.find(b => b.value === currentPlan.book_name)?.name} Study`
                : `${spiritualTopics.find(t => t.value === currentPlan.topic_name)?.name}`
              }
            </p>
            <div className="mt-3 text-sm text-purple-600">
              Started: {new Date(currentPlan.start_date).toLocaleDateString()}
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {weekPlan.map((day, index) => (
          <Card 
            key={index} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              day.isToday ? 'ring-2 ring-blue-500 bg-blue-50' : 
              day.isPast ? 'bg-gray-50 opacity-75' : ''
            }`}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800">{day.day}</h4>
                      {day.isToday && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          Today
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{day.passage}</p>
                    <p className="text-xs text-purple-600 font-medium mt-1">{day.focus}</p>
                  </div>
                  {day.isSabbath && (
                    <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                      Sabbath
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
            Each Sabbath includes extended study time with nature object lessons, 
            missionary stories, and deeper discussion questions for the whole family.
          </p>
        </div>
      </Card>
    </div>
  );
};
