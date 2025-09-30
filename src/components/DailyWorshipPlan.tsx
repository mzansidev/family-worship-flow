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

type ActiveFeature = 'dashboard' | 'daily' | 'weekly' | 'principles' | 'profile' | 'auth' | 'about';

export const DailyWorshipPlan = ({ onNavigate }: { onNavigate?: (feature: ActiveFeature) => void }) => {
  const [ageRange, setAgeRange] = useState('family');
  const [planSource, setPlanSource] = useState<PlanSource>('random');
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [weeklyAssignments, setWeeklyAssignments] = useState<any>({});
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

  const getRecommendedTime = (age: string) => {
    const timeRecommendations = {
      child: '10-15 minutes',
      teen: '15-20 minutes', 
      adult: '25-35 minutes',
      family: '20-30 minutes'
    };
    return timeRecommendations[age as keyof typeof timeRecommendations] || '20-30 minutes';
  };

  const getTopicalSongs = (theme: string) => {
    const songsByTheme: { [key: string]: string[] } = {
      'Prayer and Faith': [
        'What a Friend We Have in Jesus (SDAH #124)',
        'Sweet Hour of Prayer (SDAH #478)',
        'Jesus Loves Even Me (SDAH #167)',
        'A Shelter in the Time of Storm (SDAH #528)'
      ],
      'God\'s Love': [
        'Amazing Grace (SDAH #108)',
        'Love Divine (SDAH #92)',
        'Jesus Loves Me (SDAH #648)',
        'God So Loved the World (SDAH #136)'
      ],
      'Creation': [
        'This Is My Father\'s World (SDAH #61)',
        'All Creatures of Our God and King (SDAH #2)',
        'For the Beauty of the Earth (SDAH #60)',
        'How Great Thou Art (SDAH #86)'
      ],
      'Praise and Worship': [
        'Praise to the Lord (SDAH #1)',
        'Holy, Holy, Holy (SDAH #3)',
        'All People That on Earth Do Dwell (SDAH #16)',
        'O Worship the Lord (SDAH #6)'
      ],
      'Faith and Trust': [
        'A Mighty Fortress (SDAH #506)',
        'All the Way (SDAH #516)',
        'Be Thou My Vision (SDAH #547)',
        'Faith Is the Victory (SDAH #592)'
      ],
      'Salvation': [
        'Blessed Assurance (SDAH #462)',
        'Rock of Ages (SDAH #114)',
        'At Calvary (SDAH #115)',
        'I Know That My Redeemer Lives (SDAH #120)'
      ]
    };

    // Find matching theme or use general praise songs
    const themeKey = Object.keys(songsByTheme).find(key => 
      theme.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(theme.toLowerCase())
    );
    
    return songsByTheme[themeKey] || songsByTheme['Praise and Worship'];
  };

  const generateRandomPlan = () => {
    const themes = [
      'God as Our Shepherd', 'Walking in Faith', 'God\'s Love for Us',
      'Trusting in Prayer', 'Following Jesus', 'God\'s Creation',
      'Serving Others', 'God\'s Forgiveness', 'Growing in Faith',
      'Praise and Worship', 'Salvation by Grace', 'Christian Living'
    ];
    
    const passages = [
      'Psalm 23:1-6 - The Lord is My Shepherd',
      'John 3:16-17 - God\'s Love for the World', 
      'Philippians 4:13 - I Can Do All Things Through Christ',
      'Matthew 28:19-20 - The Great Commission',
      'Psalm 139:13-16 - Fearfully and Wonderfully Made',
      'Romans 8:28 - All Things Work Together for Good',
      'Ephesians 2:8-9 - Saved by Grace Through Faith',
      'Matthew 6:25-34 - Do Not Worry',
      'Isaiah 40:28-31 - They That Wait Upon the Lord'
    ];

    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const themeSongs = getTopicalSongs(randomTheme);
    
    return {
      openingSong: themeSongs[Math.floor(Math.random() * themeSongs.length)],
      bibleReading: passages[Math.floor(Math.random() * passages.length)],
      discussion: generateDiscussionQuestions(randomTheme, ageRange),
      application: `This week, look for one way God has shown you ${randomTheme.toLowerCase()}. Share it with your family during your next worship time.`,
      closingSong: themeSongs[Math.floor(Math.random() * themeSongs.length)],
      theme: randomTheme,
      recommendedTime: getRecommendedTime(ageRange)
    };
  };

  const fetchWeeklyAssignments = async () => {
    if (!user) return;
    
    console.log('[fetchWeeklyAssignments] starting fetch for user:', user.id);
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    try {
      // Get active worship plan
      const { data: activePlan } = await supabase
        .from('worship_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (activePlan) {
        console.log('[fetchWeeklyAssignments] found active plan:', activePlan.id, 'for day:', dayOfWeek);
        
        // Get assignments for today
        const { data: assignments, error: assignError } = await supabase
          .from('weekly_assignments')
          .select(`
            role,
            assigned_member_id,
            family_members!inner(name)
          `)
          .eq('worship_plan_id', activePlan.id)
          .eq('day_of_week', dayOfWeek);
        
        console.log('[fetchWeeklyAssignments] assignments query result:', { assignments, assignError });
        
        if (assignments && assignments.length > 0) {
          const assignmentsByRole = assignments.reduce((acc: any, assignment: any) => {
            acc[assignment.role] = assignment.family_members?.name || 'Unknown';
            return acc;
          }, {});
          console.log('[fetchWeeklyAssignments] processed assignments:', assignmentsByRole);
          setWeeklyAssignments(assignmentsByRole);
        } else {
          console.log('[fetchWeeklyAssignments] no assignments found for today');
          setWeeklyAssignments({});
        }
      } else {
        console.log('[fetchWeeklyAssignments] no active plan found');
        setWeeklyAssignments({});
      }
    } catch (error) {
      console.error('Error fetching weekly assignments:', error);
    }
  };

  const fetchTodaysPlan = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    console.log('[DailyWorshipPlan] fetchTodaysPlan for', { userId: user.id, today, planSource });

    try {
      // Fetch the most recent entry with role assignment data
      const { data: plans } = await supabase
        .from('daily_worship_entries')
        .select(`
          *,
          leader:family_members!daily_worship_entries_leader_id_fkey(name),
          assistant:family_members!daily_worship_entries_assistant_id_fkey(name)
        `)
        .eq('user_id', user.id as any)
        .eq('date', today as any)
        .order('created_at', { ascending: false })
        .limit(1);

      const existingPlan = plans && plans.length > 0 ? plans[0] : null;

      if (existingPlan && typeof existingPlan === 'object') {
        if (planSource === 'random') {
          const randomDerived = generateRandomPlan();
          await supabase
            .from('daily_worship_entries')
            .update({
              opening_song: randomDerived.openingSong,
              bible_reading: randomDerived.bibleReading,
              discussion_questions: randomDerived.discussion,
              application: randomDerived.application,
              closing_song: randomDerived.closingSong,
              theme: randomDerived.theme,
              worship_plan_id: null,
              updated_at: new Date().toISOString()
              // Preserve existing leader_id and assistant_id
            } as any)
            .eq('id', (existingPlan as any).id);
          const enrichedPlan = {
            ...randomDerived,
            leaderId: (existingPlan as any).leader_id,
            assistantId: (existingPlan as any).assistant_id,
            leaderName: (existingPlan as any).leader?.name,
            assistantName: (existingPlan as any).assistant?.name,
            familyMembersPresent: (existingPlan as any).family_members_present || []
          };
          setCurrentPlan(enrichedPlan);
          setIsCompleted((existingPlan as any).is_completed || false);
          return;
        } else {
          const { data: weeklyPlan } = await supabase
            .from('worship_plans')
            .select('id, study_type, book_name, topic_name, current_chapter')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .eq('plan_type', 'weekly')
            .maybeSingle();

          const weeklyDerived = await generateWeeklyPlan();
          console.log('[fetchTodaysPlan] weeklyDerived bibleReading:', weeklyDerived.bibleReading);
          const linkId = weeklyPlan ? (weeklyPlan as any).id : null;

          await supabase
            .from('daily_worship_entries')
            .update({
              opening_song: weeklyDerived.openingSong,
              bible_reading: weeklyDerived.bibleReading,
              discussion_questions: weeklyDerived.discussion,
              application: weeklyDerived.application,
              closing_song: weeklyDerived.closingSong,
              theme: weeklyDerived.theme,
              worship_plan_id: linkId,
              updated_at: new Date().toISOString()
              // Preserve existing leader_id and assistant_id
            } as any)
            .eq('id', (existingPlan as any).id);
          const enrichedPlan = {
            ...weeklyDerived,
            leaderId: (existingPlan as any).leader_id,
            assistantId: (existingPlan as any).assistant_id,
            leaderName: (existingPlan as any).leader?.name,
            assistantName: (existingPlan as any).assistant?.name,
            familyMembersPresent: (existingPlan as any).family_members_present || []
          };
          console.log('[fetchTodaysPlan] enrichedPlan bibleReading:', enrichedPlan.bibleReading);
          setCurrentPlan(enrichedPlan);
          setIsCompleted((existingPlan as any).is_completed || false);
          return;
        }
      }

      // No existing entry: generate plan based on source selection
      let newPlan;
      let worshipPlanId: string | null = null;
      if (planSource === 'weekly') {
        const { data: weeklyPlan } = await supabase
          .from('worship_plans')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .eq('plan_type', 'weekly')
          .maybeSingle();

        newPlan = await generateWeeklyPlan();
        worshipPlanId = weeklyPlan ? (weeklyPlan as any).id : null;
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
          worship_plan_id: worshipPlanId,
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
        const bookThemeSongs = getTopicalSongs('Faith and Trust');

        return {
          openingSong: bookThemeSongs[Math.floor(Math.random() * bookThemeSongs.length)],
          bibleReading: `${weeklyPlan.book_name} ${chapter}:${startVerse}-${endVerse} - ${weeklyPlan.book_name} Chapter ${chapter}`,
          discussion: generateDiscussionQuestions(`${weeklyPlan.book_name} Study`, ageRange),
          application: `This week, reflect on the lessons from ${weeklyPlan.book_name} chapter ${chapter}. Consider how these verses apply to your daily walk with God.`,
          closingSong: bookThemeSongs[Math.floor(Math.random() * bookThemeSongs.length)],
          theme: `${weeklyPlan.book_name} Chapter ${chapter} - Day ${mondayIndex + 1}`,
          recommendedTime: getRecommendedTime(ageRange)
        };
      } else {
        const topicSongs = getTopicalSongs(weeklyPlan.topic_name);
        const fullReading = getTopicalReading(weeklyPlan.topic_name, mondayIndex);
        
        return {
          openingSong: topicSongs[Math.floor(Math.random() * topicSongs.length)],
          bibleReading: fullReading,
          discussion: generateDiscussionQuestions(weeklyPlan.topic_name, ageRange),
          application: `Continue exploring ${weeklyPlan.topic_name}. Look for ways to apply today's insights throughout your week.`,
          closingSong: topicSongs[Math.floor(Math.random() * topicSongs.length)],
          theme: `${weeklyPlan.topic_name} - Day ${mondayIndex + 1}`,
          recommendedTime: getRecommendedTime(ageRange)
        };
      }
    } catch (error) {
      console.error('Error generating weekly plan:', error);
      return generateRandomPlan();
    }
  };

  const getTopicalReading = (topic: string, dayIndex: number) => {
    console.log('[getTopicalReading] topic:', topic, 'dayIndex:', dayIndex);
    
    // Normalize topic for case-insensitive matching
    const normalizedTopic = topic?.trim();
    
    const readings: { [key: string]: string[] } = {
      'The Trinity': [
        'Genesis 1:26-27 - Let Us Make Man',
        'Matthew 28:19 - Baptism in Three Names',
        'John 14:16-17 - The Comforter',
        '2 Corinthians 13:14 - Grace of Three Persons',
        'Ephesians 4:4-6 - One Spirit, One Lord, One God',
        '1 Peter 1:2 - Chosen by All Three',
        '1 John 5:7 - Three That Bear Record'
      ],
      'Salvation by Grace': [
        'Ephesians 2:8-9 - Saved by Grace Through Faith',
        'Romans 3:23-24 - All Have Sinned',
        'Romans 6:23 - The Gift of God',
        'Titus 3:5 - Not by Works of Righteousness',
        'Acts 4:12 - No Other Name',
        '2 Corinthians 5:17 - New Creation',
        'Romans 5:1 - Justified by Faith'
      ],
      'The Sabbath': [
        'Genesis 2:2-3 - God Rested',
        'Exodus 20:8-11 - Remember the Sabbath',
        'Isaiah 58:13-14 - Delight in the Sabbath',
        'Mark 2:27 - Sabbath Made for Man',
        'Luke 4:16 - Jesus\' Custom',
        'Hebrews 4:9-10 - Sabbath Rest Remains',
        'Ezekiel 20:12 - A Sign Between Us'
      ],
      'Second Coming of Christ': [
        'John 14:1-3 - I Will Come Again',
        'Acts 1:9-11 - This Same Jesus',
        '1 Thessalonians 4:16-17 - The Lord Descends',
        'Matthew 24:30 - Sign of the Son of Man',
        'Revelation 1:7 - Every Eye Shall See',
        '2 Peter 3:10 - Day of the Lord',
        'Matthew 25:31 - When the Son Comes'
      ],
      'Creation': [
        'Genesis 1:1 - In the Beginning',
        'Genesis 1:26-31 - Created in God\'s Image',
        'Psalm 19:1 - Heavens Declare Glory',
        'Colossians 1:16 - All Things Created by Him',
        'Hebrews 11:3 - By Faith We Understand',
        'Nehemiah 9:6 - Thou Hast Made Heaven',
        'Revelation 4:11 - Worthy to Receive Glory'
      ],
      'The Law of God': [
        'Exodus 20:3-17 - The Ten Commandments',
        'Matthew 5:17-19 - Not to Destroy but Fulfill',
        'Romans 7:12 - The Law is Holy',
        'Psalm 119:105 - Thy Word is a Lamp',
        'James 2:10-12 - Keep the Whole Law',
        '1 John 5:3 - His Commandments Not Grievous',
        'Ecclesiastes 12:13 - Fear God and Keep Commandments'
      ],
      'Stewardship': [
        'Malachi 3:8-10 - Will a Man Rob God',
        '1 Corinthians 4:2 - Required in Stewards',
        'Luke 16:10 - Faithful in Least',
        '2 Corinthians 9:6-7 - Cheerful Giver',
        'Matthew 6:19-21 - Treasures in Heaven',
        'Proverbs 3:9-10 - Honor the Lord',
        '1 Timothy 6:17-19 - Rich in Good Works'
      ],
      'Christian Behavior': [
        'Galatians 5:22-23 - Fruit of the Spirit',
        'Colossians 3:12-17 - Put on Christ',
        'Philippians 4:8 - Think on These Things',
        '1 Corinthians 10:31 - Do All to God\'s Glory',
        'Romans 12:1-2 - Present Your Bodies',
        '1 Peter 2:9 - A Peculiar People',
        'Ephesians 4:22-24 - Put on New Man'
      ],
      'Marriage and Family': [
        'Genesis 2:24 - One Flesh',
        'Ephesians 5:22-33 - Husbands and Wives',
        'Ephesians 6:1-4 - Children and Parents',
        'Proverbs 31:10-31 - Virtuous Woman',
        'Malachi 2:14-16 - God Hates Divorce',
        '1 Corinthians 7:3-5 - Marriage Duties',
        'Deuteronomy 6:6-9 - Teach Your Children'
      ],
      'Death and Resurrection': [
        'Ecclesiastes 9:5-6 - The Dead Know Nothing',
        'John 11:11-14 - Sleep',
        '1 Corinthians 15:51-54 - Changed in a Moment',
        '1 Thessalonians 4:13-16 - Sleep in Jesus',
        'Daniel 12:2 - Many Shall Awake',
        'Job 19:25-27 - I Know My Redeemer Lives',
        'Psalm 146:4 - His Breath Goes Forth'
      ],
      'The Heavenly Sanctuary': [
        'Hebrews 8:1-2 - A Minister of the Sanctuary',
        'Hebrews 9:11-12 - Greater and More Perfect',
        'Daniel 8:14 - Sanctuary Cleansed',
        'Leviticus 16:30 - Day of Atonement',
        'Hebrews 4:14-16 - Great High Priest',
        'Revelation 11:19 - Temple in Heaven',
        'Hebrews 7:25 - Ever Lives to Intercede'
      ],
      'Prayer and Faith': [
        'Matthew 6:5-15 - The Lord\'s Prayer',
        'James 5:13-18 - Prayer for Healing',
        'Luke 18:1-8 - Persistent Prayer',
        '1 Thessalonians 5:16-18 - Pray Without Ceasing',
        'Matthew 21:22 - Faith in Prayer',
        'Philippians 4:6-7 - Prayer and Peace',
        '1 John 5:14-15 - Confidence in Prayer'
      ],
      'The Gift of Prophecy': [
        '1 Corinthians 12:1-11 - Spiritual Gifts',
        'Ephesians 4:11-16 - Gifts for Church Building',
        '2 Peter 1:19-21 - Prophecy of Scripture',
        'Revelation 19:10 - Spirit of Prophecy',
        '1 Corinthians 14:1-5 - Desire Prophetic Gifts',
        'Numbers 12:6-8 - How God Speaks',
        'Amos 3:7 - God Reveals His Secrets'
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
    
    // Try exact match first, then case-insensitive match
    const exactMatch = readings[topic];
    if (exactMatch && exactMatch[dayIndex]) {
      console.log('[getTopicalReading] found exact match:', exactMatch[dayIndex]);
      return exactMatch[dayIndex];
    }
    
    // Try case-insensitive match
    const matchingKey = Object.keys(readings).find(key => 
      key.toLowerCase() === topic.toLowerCase()
    );
    
    if (matchingKey && readings[matchingKey] && readings[matchingKey][dayIndex]) {
      console.log('[getTopicalReading] found case-insensitive match:', readings[matchingKey][dayIndex]);
      return readings[matchingKey][dayIndex];
    }
    
    // Fallback
    console.log('[getTopicalReading] no match found, using fallback');
    return `${topic} study - Day ${dayIndex + 1}`;
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

    let newPlan;
    let worshipPlanId: string | null = null;
    if (planSource === 'weekly') {
      newPlan = await generateWeeklyPlan();
      if (user) {
        const { data: weeklyPlan } = await supabase
          .from('worship_plans')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .eq('plan_type', 'weekly')
          .maybeSingle();
        worshipPlanId = weeklyPlan ? (weeklyPlan as any).id : null;
      }
    } else {
      newPlan = generateRandomPlan();
    }

    setCurrentPlan(newPlan);

    if (user) {
      const today = new Date().toISOString().split('T')[0];

      // Safely get the latest entry for today to update or insert
      const { data: existingRows } = await supabase
        .from('daily_worship_entries')
        .select('id')
        .eq('user_id', user.id as any)
        .eq('date', today as any)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingRows && existingRows.length > 0) {
        const existingId = (existingRows[0] as any).id;
        
        // Fetch current role assignments before updating
        const { data: currentEntry } = await supabase
          .from('daily_worship_entries')
          .select('leader_id, assistant_id, family_members_present')
          .eq('id', existingId)
          .maybeSingle();
        
        await supabase
          .from('daily_worship_entries')
          .update({
            opening_song: newPlan.openingSong,
            bible_reading: newPlan.bibleReading,
            discussion_questions: newPlan.discussion,
            application: newPlan.application,
            closing_song: newPlan.closingSong,
            theme: newPlan.theme,
            worship_plan_id: worshipPlanId,
            updated_at: new Date().toISOString(),
            // Preserve existing role assignments
            leader_id: currentEntry?.leader_id,
            assistant_id: currentEntry?.assistant_id,
            family_members_present: currentEntry?.family_members_present
          } as any)
          .eq('id', existingId);
          
        // Add role info to the plan for display
        if (currentEntry) {
          const { data: memberData } = await supabase
            .from('family_members')
            .select('id, name')
            .in('id', [currentEntry.leader_id, currentEntry.assistant_id].filter(Boolean));
          
          const leaderInfo = memberData?.find(m => m.id === currentEntry.leader_id);
          const assistantInfo = memberData?.find(m => m.id === currentEntry.assistant_id);
          
          setCurrentPlan({
            ...newPlan,
            leaderId: currentEntry.leader_id,
            assistantId: currentEntry.assistant_id,
            leaderName: leaderInfo?.name,
            assistantName: assistantInfo?.name,
            familyMembersPresent: currentEntry.family_members_present || []
          });
        } else {
          setCurrentPlan(newPlan);
        }
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
            theme: newPlan.theme,
            worship_plan_id: worshipPlanId
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

  // Fetch today's plan whenever user or source changes
  useEffect(() => {
    if (user) {
      fetchTodaysPlan();
      fetchWeeklyAssignments();
    }
  }, [user, planSource]);

  // Load user preferences only on user change (avoid overwriting user's selection on change)
  useEffect(() => {
    if (!user) return;
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
  }, [user]);

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
              <SelectItem value="teen">Teens (11-19)</SelectItem>
              <SelectItem value="adult">Adults (20+)</SelectItem>
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

      {/* Time Recommendation */}
      <Card className="border-2 bg-indigo-50 border-indigo-200 shadow-sm">
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-gray-600" />
            Recommended Duration
          </h3>
          <p className="text-indigo-700 font-medium text-lg">{getRecommendedTime(ageRange)}</p>
          {ageRange === 'child' && (
            <p className="text-sm text-indigo-600 mt-2">
              Shorter sessions work best for young children. Keep it engaging with songs and interactive activities.
            </p>
          )}
          {ageRange === 'teen' && (
            <p className="text-sm text-indigo-600 mt-2">
              Perfect length for teens to engage meaningfully without losing focus. Include discussion time.
            </p>
          )}
          {ageRange === 'adult' && (
            <p className="text-sm text-indigo-600 mt-2">
              Extended time allows for deeper study, reflection, and meaningful discussion.
            </p>
          )}
          {ageRange === 'family' && (
            <p className="text-sm text-indigo-600 mt-2">
              Balanced duration suitable for all ages, with activities everyone can participate in.
            </p>
          )}
        </div>
      </Card>

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

        {/* Role Assignments */}
        <Card className="border-2 bg-emerald-50 border-emerald-200 shadow-sm">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2 text-gray-600" />
              Today's Worship Roles
            </h3>
            {Object.keys(weeklyAssignments).length > 0 ? (
              <div className="space-y-2">
                {weeklyAssignments.leader && (
                  <div className="flex items-center">
                    <span className="bg-emerald-200 text-emerald-800 px-2 py-1 rounded text-sm font-medium mr-2">
                      Leader
                    </span>
                    <span className="text-gray-700">{weeklyAssignments.leader}</span>
                  </div>
                )}
                {weeklyAssignments.assistant && (
                  <div className="flex items-center">
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm font-medium mr-2">
                      Assistant
                    </span>
                    <span className="text-gray-700">{weeklyAssignments.assistant}</span>
                  </div>
                )}
                {weeklyAssignments.presenter && (
                  <div className="flex items-center">
                    <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded text-sm font-medium mr-2">
                      Presenter
                    </span>
                    <span className="text-gray-700">{weeklyAssignments.presenter}</span>
                  </div>
                )}
                {weeklyAssignments.song_leader && (
                  <div className="flex items-center">
                    <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-sm font-medium mr-2">
                      Song Leader
                    </span>
                    <span className="text-gray-700">{weeklyAssignments.song_leader}</span>
                  </div>
                )}
                {weeklyAssignments.prayer_leader && (
                  <div className="flex items-center">
                    <span className="bg-indigo-200 text-indigo-800 px-2 py-1 rounded text-sm font-medium mr-2">
                      Prayer Leader
                    </span>
                    <span className="text-gray-700">{weeklyAssignments.prayer_leader}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-3">Roles not set</p>
                {onNavigate && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onNavigate('weekly')}
                    className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                  >
                    Set Now
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>

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
