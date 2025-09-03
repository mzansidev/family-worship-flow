
import React from 'react';
import { Book, Heart, MessageCircle, Play, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface WeeklyPlanContentProps {
  plan: any;
  selectedDay: number;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const WeeklyPlanContent: React.FC<WeeklyPlanContentProps> = ({ plan, selectedDay }) => {
  const generateDailyContent = (dayIndex: number) => {
    if (!plan) return null;

    const dayName = DAYS_OF_WEEK[dayIndex];
    const isBibleBook = plan.study_type === 'book' || plan.study_type === 'bible-book';

    if (isBibleBook) {
      const book = plan.book_name;
      const currentChapter = plan.current_chapter || 1;
      const versesPerDay = 5; // Manageable for families with children
      const startVerse = dayIndex * versesPerDay + 1;
      const endVerse = startVerse + versesPerDay - 1;

      return {
        title: `${book} Chapter ${currentChapter}`,
        reading: `${book} ${currentChapter}:${startVerse}-${endVerse}`,
        theme: `Key lessons from ${book} Chapter ${currentChapter}`,
        discussion: [
          `What stands out to you in ${book} ${currentChapter}:${startVerse}-${endVerse}?`,
          'How can we apply this passage in our daily lives?',
          'What does this teach us about God\'s character?',
          'How can we pray about what we\'ve learned today?'
        ],
        activity: `Family activity: Act out or draw a scene from today's reading`,
        duration: '10-15 minutes'
      };
    } else {
      const topic = plan.topic_name;
      return {
        title: `${topic} - Day ${dayIndex + 1}`,
        reading: getTopicalReading(topic, dayIndex),
        theme: `Understanding ${topic} - Part ${dayIndex + 1}`,
        discussion: getTopicalQuestions(topic, dayIndex),
        activity: getTopicalActivity(topic, dayIndex),
        duration: '10-15 minutes'
      };
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

  const getTopicalQuestions = (topic: string, dayIndex: number) => [
    `What does today's passage teach us about ${topic.toLowerCase()}?`,
    'How can we apply this in our family life?',
    'What practical steps can we take this week?',
    'How can we share this truth with others?'
  ];

  const getTopicalActivity = (topic: string, dayIndex: number) => {
    const activities: { [key: string]: string[] } = {
      'Prayer and Faith': [
        'Create a family prayer journal',
        'Practice different prayer positions',
        'Set up a prayer corner in your home',
        'Share answered prayers from this week',
        'Pray for someone different each day',
        'Create prayer chains with paper links',
        'Have a prayer walk around your neighborhood'
      ],
      'God\'s Love and Grace': [
        'Write love notes to family members',
        'Do random acts of kindness',
        'Create artwork showing God\'s love',
        'Share testimonies of God\'s grace',
        'Make a gratitude jar',
        'Perform acts of service together',
        'Create a family blessing tree'
      ]
    };
    
    return activities[topic]?.[dayIndex] || `${topic} activity - Day ${dayIndex + 1}`;
  };

  if (selectedDay === -1) {
    return (
      <Card className="p-6 text-center">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Select a day from the calendar to view the worship plan content</p>
      </Card>
    );
  }

  const content = generateDailyContent(selectedDay);
  if (!content) return null;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">{content.title}</h2>
          <p className="text-purple-100">
            {DAYS_OF_WEEK[selectedDay]} • Estimated time: {content.duration}
          </p>
        </div>
      </Card>

      <div className="space-y-4">
        <ContentSection
          icon={Book}
          title="Today's Reading"
          content={content.reading}
          color="bg-blue-50 border-blue-200"
        />

        <ContentSection
          icon={Heart}
          title="Theme Focus"
          content={content.theme}
          color="bg-pink-50 border-pink-200"
        />

        <ContentSection
          icon={MessageCircle}
          title="Discussion Questions"
          color="bg-green-50 border-green-200"
        >
          <ol className="space-y-2">
            {content.discussion.map((question: string, index: number) => (
              <li key={index} className="flex">
                <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-700">{question}</span>
              </li>
            ))}
          </ol>
        </ContentSection>

        <ContentSection
          icon={Play}
          title="Family Activity"
          content={content.activity}
          color="bg-amber-50 border-amber-200"
        />
      </div>
    </div>
  );
};

const ContentSection: React.FC<{
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
