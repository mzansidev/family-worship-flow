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
      },
      'scripture': {
        1: [
          '2 Timothy 3:16-17', 'Psalm 119:105', 'Isaiah 55:11', 'Hebrews 4:12',
          '2 Peter 1:20-21', 'Matthew 4:4', 'Deuteronomy 8:3'
        ],
        2: [
          'Joshua 1:8', 'Psalm 119:11', 'Romans 15:4', '1 Peter 2:2',
          'Acts 17:11', 'Colossians 3:16', 'James 1:22-25'
        ]
      },
      'trinity': {
        1: [
          'Genesis 1:26', 'Matthew 28:19', '2 Corinthians 13:14', 'John 14:16-17',
          'John 15:26', '1 Peter 1:2', 'Ephesians 4:4-6'
        ],
        2: [
          'John 1:1-3', 'Philippians 2:5-11', 'Hebrews 1:1-3', 'John 10:30',
          'John 14:9', 'Colossians 1:15-17', 'John 17:5'
        ],
        3: [
          'John 14:26', 'John 16:13-14', 'Acts 5:3-4', '1 Corinthians 2:10-11',
          'Romans 8:26-27', 'Galatians 4:6', 'Ephesians 1:13-14'
        ]
      },
      'human-nature': {
        1: [
          'Genesis 1:27', 'Genesis 2:7', 'Psalm 8:4-6', 'Romans 3:23',
          'Jeremiah 17:9', 'Romans 7:18-19', 'Ecclesiastes 7:29'
        ],
        2: [
          'Romans 5:12', '1 Corinthians 15:21-22', 'Ephesians 2:1-3', 'Romans 6:23',
          'Isaiah 64:6', 'Romans 1:18-23', 'Genesis 3:1-19'
        ]
      },
      'great-controversy': {
        1: [
          'Isaiah 14:12-15', 'Ezekiel 28:12-17', 'Revelation 12:7-9', 'Job 1:6-12',
          'Luke 10:18', '2 Corinthians 11:14', '1 Peter 5:8'
        ],
        2: [
          'Genesis 3:1-15', 'Matthew 4:1-11', 'Ephesians 6:10-18', '2 Corinthians 2:11',
          '1 John 3:8', 'James 4:7', 'Romans 16:20'
        ],
        3: [
          'Revelation 12:10-12', 'Daniel 7:25', 'Revelation 13:1-10', '2 Thessalonians 2:3-12',
          'Matthew 24:21-24', 'Revelation 16:13-14', '2 Timothy 3:1-5'
        ],
        4: [
          'Revelation 20:1-6', 'Revelation 20:7-15', 'Revelation 21:1-8', '2 Peter 3:10-13',
          'Malachi 4:1-3', '1 Corinthians 15:24-28', 'Romans 8:18-25'
        ]
      },
      'christian-living': {
        1: [
          'Galatians 5:22-25', '1 Corinthians 10:31', 'Romans 12:1-2', 'Philippians 4:8',
          'Matthew 5:16', 'Ephesians 4:1', 'Colossians 3:12-17'
        ],
        2: [
          'Matthew 22:37-39', 'John 13:34-35', '1 Corinthians 13:1-13', 'Romans 12:9-21',
          'Ephesians 4:25-32', 'Galatians 6:1-10', '1 John 4:19-21'
        ],
        3: [
          'Matthew 6:19-21', 'Luke 12:15', 'Hebrews 13:5', '1 Timothy 6:6-10',
          'Philippians 4:11-13', '2 Corinthians 9:6-8', 'Malachi 3:8-12'
        ]
      },
      'church': {
        1: [
          'Matthew 16:18', 'Ephesians 2:19-22', '1 Corinthians 12:12-27', 'Romans 12:4-8',
          'Ephesians 4:11-16', 'Acts 2:42-47', 'Hebrews 10:24-25'
        ],
        2: [
          'Matthew 28:18-20', 'Acts 1:8', '2 Timothy 2:2', 'Mark 16:15-16',
          '1 Peter 2:9', 'Romans 10:14-15', 'Ephesians 3:10'
        ]
      },
      'prophecy': {
        1: [
          'Daniel 2:31-45', 'Daniel 7:1-28', 'Daniel 8:1-27', 'Daniel 9:20-27',
          'Revelation 1:1-8', '2 Peter 1:19-21', 'Amos 3:7'
        ],
        2: [
          'Matthew 24:3-14', 'Matthew 24:15-35', 'Luke 21:25-36', '2 Timothy 3:1-9',
          '2 Peter 3:1-14', '1 Thessalonians 5:1-11', 'Revelation 3:10-11'
        ],
        3: [
          '1 Thessalonians 4:13-18', '1 Corinthians 15:50-57', 'John 14:1-3', 'Acts 1:9-11',
          'Revelation 1:7', 'Matthew 24:29-31', '2 Peter 3:10'
        ],
        4: [
          'Revelation 20:1-15', 'Daniel 12:1-4', 'Revelation 21:1-27', 'Revelation 22:1-21',
          '2 Peter 3:13', 'Isaiah 65:17-25', '1 Corinthians 2:9'
        ]
      },
      'sabbath': {
        1: [
          'Genesis 2:1-3', 'Exodus 20:8-11', 'Deuteronomy 5:12-15', 'Isaiah 58:13-14',
          'Mark 2:27-28', 'Luke 4:16', 'Acts 13:14'
        ],
        2: [
          'Ezekiel 20:12', 'Ezekiel 20:20', 'Nehemiah 13:15-22', 'Isaiah 56:1-8',
          'Matthew 12:1-12', 'Hebrews 4:1-11', 'Revelation 14:7'
        ]
      },
      'stewardship': {
        1: [
          'Genesis 1:28', 'Psalm 24:1', '1 Corinthians 4:2', 'Luke 16:10-13',
          'Matthew 25:14-30', '1 Chronicles 29:14', 'Haggai 2:8'
        ],
        2: [
          'Malachi 3:8-12', '2 Corinthians 9:6-15', 'Luke 6:38', 'Acts 20:35',
          'Proverbs 3:9-10', '1 Timothy 6:17-19', 'Matthew 6:19-21'
        ]
      }
    };
    
    const weekPassages = topicPassages[topic]?.[weekInTopic] || topicPassages['god-nature'][1];
    return weekPassages[dayInWeek - 1] || weekPassages[0];
  };

  // Enhanced discussion questions for all topics
  const getTopicDiscussionQuestions = (topic: string, weekInTopic: number, dayInWeek: number) => {
    const topicQuestions: { [key: string]: { [key: number]: string[][] } } = {
      'creation': {
        1: [
          ['What does Genesis 1:1 teach us about God as Creator?', 'How does understanding God as Creator affect how we view ourselves?', 'What evidence of God\'s creative power do we see in nature today?'],
          ['How does the order of creation show God\'s wisdom?', 'What can we learn about God\'s character from His creative work?', 'How should we care for God\'s creation?'],
          ['Why did God create the sun, moon, and stars?', 'How do the heavenly bodies declare God\'s glory?', 'What does this teach us about God\'s attention to detail?'],
          ['What makes humans different from other creatures?', 'How are we made in God\'s image?', 'What responsibilities come with being image-bearers?'],
          ['What was God\'s original plan for humanity?', 'How does the blessing in Genesis 1:28 apply to us today?', 'What does it mean to have dominion over creation?'],
          ['Why did God rest on the seventh day?', 'What does this teach us about the Sabbath?', 'How can we honor God\'s example of rest?'],
          ['How does Psalm 104 expand our understanding of creation?', 'What aspects of God\'s character are revealed in creation?', 'How should creation inspire our worship?']
        ],
        2: [
          ['How does nature reveal God\'s invisible qualities?', 'What can we learn about God from the water cycle?', 'How does God provide for His creatures?'],
          ['How do the seasons show God\'s faithfulness?', 'What does the regularity of day and night teach us?', 'How does God\'s timing in nature encourage us?'],
          ['How does the diversity in creation reflect God\'s creativity?', 'What does the balance in ecosystems teach us?', 'How does God sustain all life?'],
          ['How should understanding creation affect our worship?', 'What is our role as stewards of creation?', 'How can we better appreciate God\'s creative works?'],
          ['How does Romans 1:20 challenge those who deny God?', 'What makes the design in nature so obvious?', 'How can creation be a witness to unbelievers?'],
          ['How does Christ\'s role in creation affect our relationship with Him?', 'What does it mean that all things were made through Jesus?', 'How does this truth comfort us?'],
          ['How does faith help us understand creation?', 'Why is the Genesis account important for our faith?', 'How does creation point to God\'s power?']
        ]
      },
      'god-nature': {
        1: [
          ['What does the name "I AM" reveal about God?', 'How does God\'s self-existence comfort us?', 'What makes God different from all creation?'],
          ['What does it mean that God is eternal?', 'How does God\'s eternal nature affect His promises?', 'How should God\'s timelessness change our perspective?'],
          ['How are God\'s thoughts different from ours?', 'Why can\'t we fully understand God\'s ways?', 'How should this humble us in our relationship with God?'],
          ['What does it mean that God is Spirit?', 'How does God\'s spiritual nature affect how we worship?', 'What does this teach us about idolatry?'],
          ['How does understanding God as love change everything?', 'What is the difference between God\'s love and human love?', 'How does God\'s love motivate our obedience?'],
          ['What does it mean that God doesn\'t change?', 'How is God\'s unchanging nature a source of comfort?', 'What does this teach us about God\'s promises?'],
          ['How does God\'s unchanging nature relate to His faithfulness?', 'Why is it important that God cannot lie?', 'How does this affect our trust in Him?']
        ],
        2: [
          ['What does it mean that God knows everything?', 'How should God\'s omniscience comfort the believer?', 'How does God\'s knowledge of our thoughts affect our lives?'],
          ['How is God present everywhere?', 'What comfort does God\'s omnipresence bring?', 'How does knowing God is always with us change our behavior?'],
          ['What does Psalm 139:13-18 teach about how God sees us?', 'How does God\'s intimate knowledge of us affect our self-worth?', 'What does this passage teach about the unborn?'],
          ['How does God\'s foreknowledge relate to our free will?', 'What comfort does God\'s sovereignty bring?', 'How does knowing the end from the beginning help us trust God?'],
          ['How can God fill heaven and earth?', 'What does this teach us about God\'s greatness?', 'How should this affect our reverence for God?'],
          ['Why can\'t any building contain God?', 'How does this relate to temple worship?', 'What does this teach us about God\'s transcendence?'],
          ['How is God beyond our complete understanding?', 'Why is it good that God is greater than we can comprehend?', 'How should this lead us to worship?']
        ],
        3: [
          ['What does Isaiah\'s vision teach us about God\'s holiness?', 'How should God\'s holiness affect our approach to Him?', 'What was Isaiah\'s response to seeing God\'s glory?'],
          ['Why do the creatures never stop saying "Holy, holy, holy"?', 'What does the repetition emphasize?', 'How should this inspire our worship?'],
          ['How is God\'s holiness different from human goodness?', 'What makes God incomparable?', 'How does God\'s uniqueness call us to exclusive devotion?'],
          ['What does God\'s holiness require of His people?', 'How can sinful people approach a holy God?', 'What does "be holy as I am holy" mean for us?'],
          ['How does God dwell with both the high and lowly?', 'What does this teach about God\'s grace?', 'How does God\'s holiness actually bring hope?'],
          ['How pure are God\'s eyes?', 'Why can\'t God look upon sin?', 'How does this make the cross more meaningful?'],
          ['What does it mean to be holy?', 'How can we grow in holiness?', 'What role does God\'s Spirit play in our sanctification?']
        ],
        4: [
          ['How does Psalm 103:8 describe God\'s character?', 'What is the difference between being slow to anger and never getting angry?', 'How does God\'s patience give us hope?'],
          ['What do we learn about God from Exodus 34:6-7?', 'How do mercy and justice work together in God?', 'What does "abounding in love" mean?'],
          ['How are God\'s mercies new every morning?', 'What hope does this give us for each day?', 'How should this affect our morning prayers?'],
          ['What is the purpose of God\'s kindness?', 'How does God\'s goodness lead to repentance?', 'How have you experienced God\'s kindness?'],
          ['How great is God\'s love for us?', 'What moved God to make us His children?', 'How should being called children of God affect our identity?'],
          ['How does God\'s grace appear to all people?', 'What does this teach us about God\'s universal love?', 'How should this motivate our evangelism?'],
          ['How great is the Father\'s love for us?', 'What does it mean to be called children of God?', 'How does this love transform our relationships with others?']
        ]
      },
      'salvation': {
        1: [
          ['What does "all have sinned" mean for humanity?', 'How does understanding our sinfulness help us appreciate salvation?', 'Why is it important that this includes everyone?'],
          ['What is the wage of sin versus God\'s gift?', 'How does this contrast show God\'s grace?', 'What makes eternal life a gift rather than a reward?'],
          ['How are we saved according to Ephesians 2:8-9?', 'What role do good works play in salvation?', 'Why is it important that salvation is not by works?'],
          ['What motivated God to give His Son?', 'How does God\'s love solve our sin problem?', 'What does "whoever believes" tell us about salvation?'],
          ['Why is Jesus the only way to salvation?', 'What makes His name so powerful?', 'How does this exclusivity show God\'s provision?'],
          ['What does it mean to be a new creation?', 'How complete is this transformation?', 'What evidences should we see of this new life?'],
          ['How are we crucified with Christ?', 'What does it mean that Christ lives in us?', 'How does this change our daily living?']
        ],
        2: [
          ['How does Romans 5:8 demonstrate God\'s love?', 'What is significant about the timing of Christ\'s death?', 'How does this prove God\'s love is unconditional?'],
          ['How does God\'s grace save us?', 'What is the role of the Holy Spirit in our washing and renewal?', 'How complete is this spiritual cleansing?'],
          ['What does it mean to confess our sins?', 'How faithful is God to forgive?', 'What does cleansing from all unrighteousness include?'],
          ['What does "no condemnation" mean for believers?', 'How does this freedom affect our relationship with God?', 'What assurance does this give us?'],
          ['How complete is God\'s forgiveness?', 'What does it mean that our debt is canceled?', 'How should this affect our forgiveness of others?'],
          ['Why is bloodshed necessary for forgiveness?', 'How does Christ\'s sacrifice fulfill this requirement?', 'What makes His blood sufficient?'],
          ['How do we have peace with God?', 'What was required to establish this peace?', 'How should this peace affect our anxiety?']
        ],
        3: [
          ['How is Jesus the way, truth, and life?', 'What makes Him the exclusive path to the Father?', 'How does this challenge modern pluralism?'],
          ['What must we do to be saved?', 'How simple is the gospel message?', 'What does believing in Jesus include?'],
          ['What does confession and belief involve?', 'How public should our faith be?', 'What role does the heart play in salvation?'],
          ['How were we redeemed?', 'What did Christ\'s blood purchase for us?', 'How precious is the blood of Christ?'],
          ['How does Jesus knock on the door of our hearts?', 'What does opening the door represent?', 'What fellowship does He promise?'],
          ['What does it mean to receive Christ?', 'How do we become children of God?', 'What power is given to those who receive Him?'],
          ['How does the Spirit testify with our spirit?', 'What assurance does this give?', 'How can we know we are God\'s children?']
        ]
      }
    };

    const weekQuestions = topicQuestions[topic]?.[weekInTopic] || topicQuestions['god-nature'][1];
    return weekQuestions[dayInWeek - 1] || weekQuestions[0];
  };

  // Generic book study questions
  const getBookStudyQuestions = (bookName: string, chapter: number) => {
    return [
      `What is the main theme or message of ${bookName} chapter ${chapter}?`,
      'What does this passage teach us about God\'s character?',
      'How can we apply the lessons from this passage to our daily lives?'
    ];
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
      
      let passage, focus, discussionQuestions;
      if (studyType === 'book') {
        const bookData = bibleBooks.find(b => b.value === selectedBook);
        const chapter = Math.floor(i / 7) + 1;
        const section = (i % 7) + 1;
        passage = `${bookData?.name} ${chapter}:${section}-${section + 5}`;
        focus = `${bookData?.name} Study - Chapter ${chapter}`;
        discussionQuestions = getBookStudyQuestions(bookData?.name || 'Bible', chapter);
      } else {
        const topicData = spiritualTopics.find(t => t.value === selectedTopic);
        const weekInTopic = Math.floor(i / 7) + 1;
        const dayInWeek = (i % 7) + 1;
        passage = getTopicPassages(selectedTopic, weekInTopic, dayInWeek);
        focus = `${topicData?.name} - Week ${weekInTopic}, Day ${dayInWeek}`;
        discussionQuestions = getTopicDiscussionQuestions(selectedTopic, weekInTopic, dayInWeek);
      }

      weekPlan.push({
        date: date.toISOString().split('T')[0],
        day: dayName,
        passage,
        focus,
        discussionQuestions,
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
        .insert({
          user_id: user.id,
          plan_type: 'weekly',
          study_type: studyType,
          book_name: studyType === 'book' ? selectedBook : null,
          topic_name: studyType === 'topic' ? selectedTopic : null,
          start_date: new Date().toISOString().split('T')[0],
          is_active: true
        } as any)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setCurrentPlan(data);
        await generateWeeklyEntries(data.id);
        
        toast({
          title: "Success",
          description: "New study plan created!"
        });
      }
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
      discussion_questions: day.discussionQuestions,
      application: generateApplication(day.focus),
      is_completed: false
    }));

    const { error } = await supabase
      .from('daily_worship_entries')
      .upsert(entries as any, { onConflict: 'user_id,date' });

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
      .eq('user_id', user.id as any)
      .eq('date', day.date)
      .maybeSingle();

    setEditingDay({
      date: day.date,
      data: existingData || {
        bible_reading: day.passage,
        theme: day.focus,
        opening_song: 'Be Thou My Vision (SDAH #547)',
        closing_song: 'How Great Thou Art (SDAH #86)',
        discussion_questions: day.discussionQuestions
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
      .eq('user_id', user.id as any)
      .eq('plan_type', 'weekly' as any)
      .eq('is_active', true as any)
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
        {weekPlan.map((day, index) => {
          const existingEntry = weeklyEntries.find(entry => entry.date === day.date);
          const isCompleted = existingEntry?.is_completed;
          
          return (
            <Card 
              key={index} 
              className={`hover:shadow-md transition-all cursor-pointer ${
                day.isToday ? 'ring-2 ring-blue-500 bg-blue-50' : 
                day.isPast ? 'bg-gray-50 opacity-75' : ''
              } ${isCompleted ? 'bg-green-50 border-green-200' : ''} hover:bg-purple-50`}
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
                        {isCompleted && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            ✓ Completed
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
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
        <div className="p-4">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            How to Use
          </h3>
          <p className="text-amber-700 text-sm">
            Click on any day to customize the worship plan with specific songs, discussion questions, 
            and applications. Each plan includes comprehensive discussion questions that you can expand upon. 
            Book studies start with 3 generic questions and allow you to add more custom ones.
          </p>
        </div>
      </Card>
    </div>
  );
};
