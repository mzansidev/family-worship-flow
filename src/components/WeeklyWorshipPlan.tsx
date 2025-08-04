import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, ChevronRight, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DailyPlanEditor } from './DailyPlanEditor';

export const WeeklyWorshipPlan = () => {
  const [studyType, setStudyType] = useState<'book' | 'topic'>('book');
  const [selectedBook, setSelectedBook] = useState('matthew');
  const [selectedTopic, setSelectedTopic] = useState('god-nature');
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [weeklyEntries, setWeeklyEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingDay, setEditingDay] = useState<{date: string, data?: any} | null>(null);
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

  // Enhanced topic passages with proper coverage
  const getTopicPassages = (topic: string, weekInTopic: number, dayInWeek: number) => {
    const topicPassages: { [key: string]: { [key: number]: string[] } } = {
      'creation': {
        1: [
          'Genesis 1:1-5', 'Genesis 1:6-13', 'Genesis 1:14-19', 'Genesis 1:20-25',
          'Genesis 1:26-31', 'Genesis 2:1-3', 'Psalm 104:1-9'
        ],
        2: [
          'Psalm 104:10-18', 'Psalm 104:19-23', 'Psalm 104:24-30', 'Psalm 104:31-35',
          'Romans 1:20', 'Colossians 1:16-17', 'Hebrews 11:3'
        ]
      },
      'god-nature': {
        1: [
          'Exodus 3:14', 'Psalm 90:1-2', 'Isaiah 55:8-9', 'John 4:24',
          '1 John 4:8', 'James 1:17', 'Malachi 3:6'
        ],
        2: [
          'Psalm 139:1-6', 'Psalm 139:7-12', 'Psalm 139:13-18', 'Isaiah 46:9-10',
          'Jeremiah 23:23-24', '1 Kings 8:27', 'Job 11:7-9'
        ],
        3: [
          'Isaiah 6:1-3', 'Revelation 4:8', 'Exodus 15:11', 'Psalm 99:3',
          'Isaiah 57:15', 'Habakkuk 1:13', 'Leviticus 19:2'
        ],
        4: [
          'Psalm 103:8', 'Exodus 34:6-7', 'Lamentations 3:22-23', 'Romans 2:4',
          'Ephesians 2:4-5', 'Titus 3:4-5', '1 John 3:1'
        ]
      },
      'salvation': {
        1: [
          'Romans 3:23', 'Romans 6:23', 'Ephesians 2:8-9', 'John 3:16',
          'Acts 4:12', '2 Corinthians 5:17', 'Galatians 2:20'
        ],
        2: [
          'Romans 5:8', 'Titus 3:5', '1 John 1:9', 'Romans 8:1',
          'Colossians 2:13-14', 'Hebrews 9:22', 'Romans 5:1'
        ],
        3: [
          'John 14:6', 'Acts 16:30-31', 'Romans 10:9-10', '1 Peter 1:18-19',
          'Revelation 3:20', 'John 1:12', 'Romans 8:16'
        ]
      }
    };
    
    const weekPassages = topicPassages[topic]?.[weekInTopic] || topicPassages['god-nature'][1];
    return weekPassages[dayInWeek - 1] || weekPassages[0];
  };

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
        passage = getTopicPassages(selectedTopic, weekInTopic, dayInWeek);
        focus = `${topicData?.name} - Week ${weekInTopic}, Day ${dayInWeek}`;
      }

      weekPlan.push({
        date: date.toISOString().split('T')[0],
        day: dayName,
        passage,
        focus,
        isToday,
        isPast,
        isSabbath: date.getDay() === 6
      });
    }
    
    return weekPlan;
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

  const handleDayClick = async (day: any) => {
    if (!user) return;

    // Fetch existing data for this day
    const { data: existingData } = await supabase
      .from('daily_worship_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', day.date)
      .maybeSingle();

    setEditingDay({
      date: day.date,
      data: existingData || {
        bible_reading: day.passage,
        theme: day.focus,
        opening_song: 'Be Thou My Vision (SDAH #547)',
        closing_song: 'How Great Thou Art (SDAH #86)'
      }
    });
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

  if (editingDay) {
    return (
      <DailyPlanEditor
        date={editingDay.date}
        initialData={editingDay.data}
        onBack={() => setEditingDay(null)}
      />
    );
  }

  const weekPlan = generateCurrentWeekPlan();

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <BookOpen className="w-6 h-6 mr-2" />
            Weekly Worship Plan
          </h2>
          <p className="text-purple-100">Study God's word together as a family - Click any day to customize</p>
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

      <div className="space-y-3">
        {weekPlan.map((day, index) => (
          <Card 
            key={index} 
            className={`hover:shadow-md transition-all cursor-pointer ${
              day.isToday ? 'ring-2 ring-blue-500 bg-blue-50' : 
              day.isPast ? 'bg-gray-50 opacity-75' : ''
            } hover:bg-purple-50`}
            onClick={() => handleDayClick(day)}
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
            How to Use
          </h3>
          <p className="text-amber-700 text-sm">
            Click on any day to customize the worship plan with specific songs, discussion questions, 
            and applications. Each Sabbath includes extended study materials for deeper family worship.
          </p>
        </div>
      </Card>
    </div>
  );
};
