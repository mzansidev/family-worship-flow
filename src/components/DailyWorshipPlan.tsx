import React, { useState, useEffect } from 'react';
import { RefreshCw, Music, Book, MessageCircle, Target, Users, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUserStats } from '@/hooks/useUserStats';

type PlanSource = 'random' | 'weekly';

export const DailyWorshipPlan = () => {
  const [ageRange, setAgeRange] = useState('family');
  const [planSource, setPlanSource] = useState<PlanSource>('random');
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateStats, refetch } = useUserStats();

  const generateDiscussionQuestions = (theme: string, age: string) => {
    const baseQuestions = [
      `What does today's passage teach us about ${theme.toLowerCase()}?`,
      'How can we apply this lesson in our daily lives?',
      'What are some ways we can remember this truth throughout the week?'
    ];

    const ageSpecific = {
      child: [
        'Can you draw a picture of what this story means?',
        'What would you tell a friend about God from this story?'
      ],
      teen: [
        'How does this apply to challenges you face at school?',
        'What questions does this raise for you about faith?'
      ],
      adult: [
        'How has God demonstrated this truth in your life experience?',
        'What practical steps can we take to live this out?'
      ],
      family: [
        'How can our family show others this truth about God?',
        'What is one thing each of us can do this week to practice this?'
      ]
    };

    return [...baseQuestions, ...ageSpecific[age as keyof typeof ageSpecific]];
  };

  const generateRandomPlan = () => {
    const themes = [
      'God as Our Shepherd', 'Walking in Faith', 'God\'s Love for Us',
      'Trusting in Prayer', 'Following Jesus', 'God\'s Creation',
      'Serving Others', 'God\'s Forgiveness', 'Growing in Faith'
    ];
    
    const songs = [
      'Be Thou My Vision (SDAH #547)', 'How Great Thou Art (SDAH #86)',
      'Amazing Grace (SDAH #108)', 'Jesus Loves Me (SDAH #648)',
      'This Is My Father\'s World (SDAH #61)', 'What a Friend We Have in Jesus (SDAH #124)'
    ];

    const passages = [
      'Psalm 23:1-6 - The Lord is My Shepherd',
      'John 3:16 - God\'s Love for the World',
      'Philippians 4:13 - I Can Do All Things',
      'Matthew 28:20 - Jesus Is Always With Us',
      'Psalm 139:14 - Wonderfully Made',
      'Romans 8:28 - All Things Work Together'
    ];

    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    
    return {
      openingSong: songs[Math.floor(Math.random() * songs.length)],
      bibleReading: passages[Math.floor(Math.random() * passages.length)],
      discussion: generateDiscussionQuestions(randomTheme, ageRange),
      application: `This week, look for one way God has shown you ${randomTheme.toLowerCase()}. Share it with your family during your next worship time.`,
      closingSong: songs[Math.floor(Math.random() * songs.length)],
      theme: randomTheme
    };
  };

  const fetchTodaysPlan = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    console.log('[DailyWorshipPlan] fetchTodaysPlan for', { userId: user.id, today, planSource });

    try {
      // Fetch the most recent entry (avoid maybeSingle to prevent PGRST116)
      const { data: plans, error } = await supabase
        .from('daily_worship_entries')
        .select('*')
        .eq('user_id', user.id as any)
        .eq('date', today as any)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching plan list:', error);
      }

      const existingPlan = plans && plans.length > 0 ? plans[0] : null;

      if (existingPlan && typeof existingPlan === 'object' && 'opening_song' in existingPlan) {
        console.log('[DailyWorshipPlan] using existing plan id', (existingPlan as any).id);
        setCurrentPlan({
          openingSong: (existingPlan as any).opening_song || '',
          bibleReading: (existingPlan as any).bible_reading || '',
          discussion: (existingPlan as any).discussion_questions || [],
          application: (existingPlan as any).application || '',
          closingSong: (existingPlan as any).closing_song || '',
          theme: (existingPlan as any).theme || ''
        });
        setIsCompleted((existingPlan as any).is_completed || false);
        return;
      }

      // Generate plan based on source selection
      let newPlan;
      if (planSource === 'weekly') {
        newPlan = await generateWeeklyPlan();
      } else {
        newPlan = generateRandomPlan();
      }
      
      setCurrentPlan(newPlan);

      // Save to database
      const { error: insertErr } = await supabase
        .from('daily_worship_entries')
        .insert({
          user_id: user.id,
          date: today as any,
          opening_song: newPlan.openingSong,
          bible_reading: newPlan.bibleReading,
          discussion_questions: newPlan.discussion,
          application: newPlan.application,
          closing_song: newPlan.closingSong,
          theme: newPlan.theme,
          is_completed: false
        } as any);

      if (insertErr) {
        console.error("Error inserting today's plan:", insertErr);
      }
    } catch (error) {
      console.error('Error in fetchTodaysPlan:', error);
      // As a safety, ensure UI doesn't get stuck on loading
      if (!currentPlan) {
        const fallbackPlan = generateRandomPlan();
        setCurrentPlan(fallbackPlan);
      }
    }
  };

  const generateWeeklyPlan = async () => {
    if (!user) return generateRandomPlan();

    try {
      // Get active weekly plan
      const { data: weeklyPlan, error } = await supabase
        .from('worship_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('plan_type', 'weekly')
        .maybeSingle();

      if (error || !weeklyPlan) {
        console.log('No active weekly plan found, using random');
        return generateRandomPlan();
      }

      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday=0 index

      if (weeklyPlan.study_type === 'book') {
        const chapter = weeklyPlan.current_chapter;
        const versesPerDay = 5;
        const startVerse = mondayIndex * versesPerDay + 1;
        const endVerse = startVerse + versesPerDay - 1;

        return {
          openingSong: 'Be Thou My Vision (SDAH #547)',
          bibleReading: `${weeklyPlan.book_name} ${chapter}:${startVerse}-${endVerse}`,
          discussion: generateDiscussionQuestions(`${weeklyPlan.book_name} Study`, ageRange),
          application: `This week, reflect on the lessons from ${weeklyPlan.book_name} chapter ${chapter}. Consider how these verses apply to your daily walk with God.`,
          closingSong: 'How Great Thou Art (SDAH #86)',
          theme: `${weeklyPlan.book_name} Chapter ${chapter} - Day ${mondayIndex + 1}`
        };
      } else {
        return {
          openingSong: 'Amazing Grace (SDAH #108)',
          bibleReading: getTopicalReading(weeklyPlan.topic_name, mondayIndex),
          discussion: generateDiscussionQuestions(weeklyPlan.topic_name, ageRange),
          application: `Continue exploring ${weeklyPlan.topic_name}. Look for ways to apply today's insights throughout your week.`,
          closingSong: 'What a Friend We Have in Jesus (SDAH #124)',
          theme: `${weeklyPlan.topic_name} - Day ${mondayIndex + 1}`
        };
      }
    } catch (error) {
      console.error('Error generating weekly plan:', error);
      return generateRandomPlan();
    }
  };

  const getTopicalReading = (topic: string, dayIndex: number) => {
    const readings: { [key: string]: string[] } = {
      'Prayer and Faith': [
        'Matthew 6:5-15 - The Lord\'s Prayer',
        'James 5:13-18 - Prayer for Healing',
        'Luke 18:1-8 - Persistent Prayer',
        '1 Thessalonians 5:16-18 - Pray Without Ceasing',
        'Matthew 21:22 - Faith in Prayer',
        'Philippians 4:6-7 - Prayer and Peace',
        '1 John 5:14-15 - Confidence in Prayer'
      ],
      'God\'s Love and Grace': [
        'John 3:16-21 - God\'s Love for the World',
        'Romans 5:6-11 - Grace While We Were Sinners',
        'Ephesians 2:4-10 - Saved by Grace',
        '1 John 4:7-21 - God is Love',
        'Romans 8:35-39 - Nothing Separates Us',
        'Titus 3:4-7 - God\'s Kindness and Love',
        'Psalm 103:8-14 - God\'s Compassion'
      ]
    };
    
    return readings[topic]?.[dayIndex] || `${topic} study - Day ${dayIndex + 1}`;
  };

  const handleMarkCompleted = async () => {
    if (!user || !currentPlan) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Update the daily entry as completed
      const { error } = await supabase
        .from('daily_worship_entries')
        .update({ is_completed: true } as any)
        .eq('user_id', user.id as any)
        .eq('date', today as any);

      if (error) throw error;

      setIsCompleted(true);
      
      // Update user stats - this will handle streak calculation
      await updateStats(true);
      
      // Refresh stats to get updated values
      await refetch();
      
      toast({
        title: "Congratulations! 🎉",
        description: "Today's worship session completed! Your streak and stats have been updated."
      });
    } catch (error) {
      console.error('Error marking complete:', error);
      toast({
        title: "Error",
        description: "Failed to mark as complete",
        variant: "destructive"
      });
    }
  };

  const handleGenerateNew = async () => {
    setLoading(true);
    const newPlan = generateRandomPlan();
    setCurrentPlan(newPlan);

    if (user) {
      const today = new Date().toISOString().split('T')[0];

      // Safely get the latest entry for today to update or insert
      const { data: existingRows, error: existErr } = await supabase
        .from('daily_worship_entries')
        .select('id')
        .eq('user_id', user.id as any)
        .eq('date', today as any)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!existErr && existingRows && existingRows.length > 0) {
        const existingId = (existingRows[0] as any).id;
        await supabase
          .from('daily_worship_entries')
          .update({
            opening_song: newPlan.openingSong,
            bible_reading: newPlan.bibleReading,
            discussion_questions: newPlan.discussion,
            application: newPlan.application,
            closing_song: newPlan.closingSong,
            theme: newPlan.theme,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', existingId);
      } else {
        await supabase
          .from('daily_worship_entries')
          .insert({
            user_id: user.id,
            date: today as any,
            opening_song: newPlan.openingSong,
            bible_reading: newPlan.bibleReading,
            discussion_questions: newPlan.discussion,
            application: newPlan.application,
            closing_song: newPlan.closingSong,
            theme: newPlan.theme
          } as any);
      }
    }
    
    setLoading(false);
  };

  const updateUserPreferences = async () => {
    if (!user) return;

    // Replace upsert with explicit check-then-update/insert to avoid onConflict errors
    const { data: existing, error: existErr } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id as any)
      .maybeSingle();

    if (!existErr && existing) {
      await supabase
        .from('user_preferences')
        .update({
          daily_plan_source: planSource,
          default_age_range: ageRange
        } as any)
        .eq('id', (existing as any).id);
    } else {
      await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          daily_plan_source: planSource,
          default_age_range: ageRange
        } as any);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTodaysPlan();
      // Load user preferences
      supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id as any)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!error && data && typeof data === 'object' && 'daily_plan_source' in data) {
            setPlanSource(((data as any).daily_plan_source as PlanSource) || 'random');
            setAgeRange((data as any).default_age_range || 'family');
          }
        });
    }
  }, [user, planSource]);

  useEffect(() => {
    if (user) {
      updateUserPreferences();
    }
  }, [planSource, ageRange]);

  if (!currentPlan) {
    return <div className="text-center p-8">Loading today's worship plan...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Music className="w-6 h-6 mr-2" />
                Daily Worship Plan
              </h2>
              <p className="text-emerald-100">Today's Theme: {currentPlan.theme}</p>
            </div>
            {isCompleted && (
              <div className="bg-white/20 p-2 rounded-full">
                <Check className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan Source
          </label>
          <Select value={planSource} onValueChange={(value: PlanSource) => setPlanSource(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="random">Random Plans</SelectItem>
              <SelectItem value="weekly">Follow Weekly Plan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Range
          </label>
          <Select value={ageRange} onValueChange={setAgeRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="child">Children (5-10)</SelectItem>
              <SelectItem value="teen">Teens (11-17)</SelectItem>
              <SelectItem value="adult">Adults (18+)</SelectItem>
              <SelectItem value="family">Mixed Family</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              onClick={handleGenerateNew}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {loading ? 'Generating...' : 'New Plan'}
            </Button>
            
            {!isCompleted && (
              <Button
                onClick={handleMarkCompleted}
                variant="outline"
                className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Complete
              </Button>
            )}
            
            {isCompleted && (
              <Button
                disabled
                className="bg-green-100 text-green-800 flex items-center gap-2 cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Completed
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <PlanSection
          icon={Music}
          title="Opening Song"
          content={currentPlan.openingSong}
          color="bg-blue-50 border-blue-200"
        />

        <PlanSection
          icon={Book}
          title="Bible Reading"
          content={currentPlan.bibleReading}
          color="bg-purple-50 border-purple-200"
        />

        <PlanSection
          icon={MessageCircle}
          title="Discussion Questions"
          color="bg-orange-50 border-orange-200"
        >
          <ol className="space-y-2">
            {Array.isArray(currentPlan.discussion) && currentPlan.discussion.map((question: string, index: number) => (
              <li key={index} className="flex">
                <span className="bg-orange-200 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-700">{question}</span>
              </li>
            ))}
          </ol>
        </PlanSection>

        <PlanSection
          icon={Target}
          title="Practical Application"
          content={currentPlan.application}
          color="bg-green-50 border-green-200"
        />

        <PlanSection
          icon={Music}
          title="Closing Song"
          content={currentPlan.closingSong}
          color="bg-blue-50 border-blue-200"
        />

        <PlanSection
          icon={Users}
          title="Closing Prayer"
          content="Take turns sharing one thing you're grateful for, then close with a family prayer."
          color="bg-amber-50 border-amber-200"
        />
      </div>
    </div>
  );
};

const PlanSection: React.FC<{
  icon: React.ElementType;
  title: string;
  content?: string;
  children?: React.ReactNode;
  color: string;
}> = ({ icon: Icon, title, content, children, color }) => {
  return (
    <Card className={`border-2 ${color} shadow-sm`}>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Icon className="w-5 h-5 mr-2 text-gray-600" />
          {title}
        </h3>
        {content && <p className="text-gray-700 leading-relaxed">{content}</p>}
        {children}
      </div>
    </Card>
  );
};
