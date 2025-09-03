
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
      'The Remnant Church': [
        'Revelation 12:17 - Keep Commandments',
        'Revelation 14:12 - Patience of the Saints',
        'Revelation 19:10 - Testimony of Jesus',
        'Daniel 7:25 - Times and Laws Changed',
        'Matthew 7:13-14 - Narrow Way',
        'Joel 2:32 - Call on the Lord',
        'Isaiah 8:20 - To the Law and Testimony'
      ],
      'Spiritual Gifts': [
        '1 Corinthians 12:4-11 - Varieties of Gifts',
        'Ephesians 4:11-13 - Gifts to the Church',
        'Romans 12:6-8 - According to Grace Given',
        '1 Peter 4:10-11 - Minister to One Another',
        '1 Corinthians 14:1 - Desire Spiritual Gifts',
        'Hebrews 2:4 - God Bears Witness',
        'Mark 16:17-18 - Signs Follow Believers'
      ],
      'The Gift of Prophecy': [
        'Joel 2:28-29 - I Will Pour Out My Spirit',
        'Revelation 19:10 - Testimony of Jesus',
        'Amos 3:7 - Reveals His Secret',
        'Ephesians 4:11 - He Gave Some Prophets',
        '1 Corinthians 14:3 - Edification and Comfort',
        '2 Peter 1:20-21 - Moved by Holy Spirit',
        'Numbers 12:6 - I Speak in a Vision'
      ],
      'Baptism': [
        'Matthew 28:19 - Go Teach All Nations',
        'Acts 8:35-39 - Philip and the Eunuch',
        'Romans 6:3-6 - Baptized into His Death',
        'Colossians 2:12 - Buried with Him',
        'Acts 2:38-39 - Repent and Be Baptized',
        'Galatians 3:27 - Put on Christ',
        'Mark 16:16 - He That Believes'
      ],
      'The Lord\'s Supper': [
        'Matthew 26:26-29 - This is My Body',
        '1 Corinthians 11:23-26 - Do This in Remembrance',
        'Luke 22:19-20 - New Testament in My Blood',
        'John 13:14-15 - Wash One Another\'s Feet',
        '1 Corinthians 11:27-29 - Unworthily',
        'Acts 20:7 - Breaking of Bread',
        'John 6:53-56 - Eat My Flesh and Drink My Blood'
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
      'Growing in Christ': [
        '2 Peter 3:18 - Grow in Grace and Knowledge',
        'Colossians 2:6-7 - Walk in Him',
        'Philippians 2:12-13 - Work Out Your Salvation',
        'Hebrews 5:12-14 - Use Your Senses',
        '1 Peter 2:2 - Desire the Sincere Milk',
        'Ephesians 4:15 - Speaking Truth in Love',
        'Galatians 5:16 - Walk in the Spirit'
      ],
      'Unity in the Body of Christ': [
        '1 Corinthians 12:12-13 - One Body Many Members',
        'Ephesians 4:3-6 - Unity of the Spirit',
        'John 17:20-21 - That They May Be One',
        'Romans 12:4-5 - Members One of Another',
        'Colossians 3:11 - Christ is All',
        'Galatians 3:28 - All One in Christ',
        '1 Corinthians 1:10 - Speak the Same Thing'
      ],
      'The Great Controversy': [
        'Revelation 12:7-9 - War in Heaven',
        'Isaiah 14:12-15 - How Art Thou Fallen',
        'Ezekiel 28:13-17 - Thou Wast in Eden',
        'Job 1:6-12 - Satan Presents Himself',
        'Matthew 4:1-11 - Temptation of Jesus',
        'Ephesians 6:12 - Spiritual Wickedness',
        'Revelation 20:7-9 - Final Battle'
      ],
      'The New Earth': [
        'Revelation 21:1-4 - New Heaven and Earth',
        'Isaiah 65:17-25 - New Heavens and Earth',
        '2 Peter 3:13 - New Earth Where Righteousness',
        'Revelation 22:1-5 - River of Life',
        'Isaiah 35:1-10 - Desert Shall Rejoice',
        'Revelation 7:16-17 - No More Hunger',
        'Isaiah 11:6-9 - Wolf Shall Dwell with Lamb'
      ],
      'The Millennium': [
        'Revelation 20:1-6 - Thousand Years',
        '1 Corinthians 6:2-3 - Saints Judge the World',
        'Jeremiah 4:23-27 - Without Form and Void',
        'Isaiah 24:1-6 - Earth Made Empty',
        'Revelation 20:7-15 - After the Thousand Years',
        'Zechariah 14:4-5 - His Feet Shall Stand',
        'Jude 14-15 - Behold the Lord Comes'
      ],
      'Health and Wellness': [
        '1 Corinthians 6:19-20 - Your Body is the Temple',
        'Daniel 1:8-16 - Daniel Purposed in His Heart',
        '3 John 2 - I Wish Above All Things',
        'Romans 12:1 - Present Your Bodies',
        'Genesis 1:29 - I Have Given You Every Herb',
        'Proverbs 23:20-21 - Be Not Among Winebibbers',
        '1 Corinthians 10:31 - Eat and Drink to God\'s Glory'
      ],
      'Service and Mission': [
        'Matthew 28:19-20 - Go Ye Therefore',
        'Isaiah 6:8 - Here Am I, Send Me',
        'Matthew 25:35-40 - Inasmuch as Ye Have Done',
        'Acts 1:8 - Ye Shall Be Witnesses',
        '2 Timothy 4:2 - Preach the Word',
        'Mark 16:15 - Go Into All the World',
        '1 Peter 3:15 - Ready to Give an Answer'
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
      'The Trinity': [
        'Draw or create art representing the three persons of God',
        'Discuss how each person of the Trinity works in our lives',
        'Find symbols of three-in-one in nature (water: ice/liquid/steam)',
        'Share how you\'ve experienced each person of the Trinity',
        'Create a family prayer acknowledging all three persons',
        'Study how the Trinity worked together in creation',
        'Make a Trinity diagram with Bible verses'
      ],
      'Salvation by Grace': [
        'Share testimonies of God\'s grace in your lives',
        'Create artwork depicting the gift of salvation',
        'Write thank you notes to Jesus for His sacrifice',
        'Act out the story of the thief on the cross',
        'Make a "grace jar" with daily examples of unmerited favor',
        'Discuss what "free gift" means with everyday examples',
        'Create a family altar for worship and gratitude'
      ],
      'The Sabbath': [
        'Plan special Sabbath activities for your family',
        'Create Sabbath traditions that bring joy',
        'Practice preparing for Sabbath on Friday',
        'Go on a nature walk to see God\'s creation',
        'Visit someone who might be lonely on Sabbath',
        'Have a special Sabbath meal with meaningful discussion',
        'Create a Sabbath blessing ritual for your home'
      ],
      'Second Coming of Christ': [
        'Create artwork depicting Jesus\' return',
        'Discuss what you\'re most excited about in heaven',
        'Make a timeline of prophecy showing we\'re near the end',
        'Share the gospel with someone this week',
        'Practice living as if Jesus is coming tomorrow',
        'Create a "ready" checklist for Jesus\' return',
        'Write letters to Jesus expressing your anticipation'
      ],
      'Creation': [
        'Go on a creation walk and catalog God\'s handiwork',
        'Create artwork depicting the days of creation',
        'Practice being good stewards of God\'s creation',
        'Plant something together as a family',
        'Study amazing facts about animals and nature',
        'Have a creation-themed worship service',
        'Discuss how creation points to an intelligent Creator'
      ],
      'The Law of God': [
        'Memorize the Ten Commandments together',
        'Create visual reminders of God\'s law for your home',
        'Discuss how God\'s law protects and blesses us',
        'Practice one commandment specifically this week',
        'Study how Jesus fulfilled and exemplified the law',
        'Create a family code of conduct based on God\'s law',
        'Make the commandments into a song or poem'
      ],
      'Stewardship': [
        'Create a family budget that honors God first',
        'Practice generous giving together',
        'Find ways to use your talents for God\'s service',
        'Take care of something in your community',
        'Discuss how everything belongs to God',
        'Make a gratitude list of God\'s blessings',
        'Plan a service project as faithful stewards'
      ],
      'Christian Behavior': [
        'Practice the fruits of the Spirit daily',
        'Create a family mission statement',
        'Do random acts of Christian kindness',
        'Practice forgiveness when someone hurts you',
        'Dress modestly and discuss why it matters',
        'Choose entertainment that honors God',
        'Practice speaking words that build others up'
      ],
      'Marriage and Family': [
        'Have parents share their love story and commitment',
        'Practice serving one another in the family',
        'Create family traditions that strengthen bonds',
        'Discuss the importance of commitment and faithfulness',
        'Pray together as a family daily',
        'Plan a special date for parents',
        'Write appreciation notes to each family member'
      ],
      'Death and Resurrection': [
        'Discuss what happens when someone dies',
        'Share comfort from the Bible about death',
        'Practice living with eternity in mind',
        'Visit a cemetery and discuss the hope of resurrection',
        'Act out the story of Lazarus being raised',
        'Create art depicting the resurrection morning',
        'Discuss how this hope changes how we live'
      ],
      'The Heavenly Sanctuary': [
        'Study the earthly sanctuary and its meaning',
        'Create a model of the sanctuary with its furniture',
        'Discuss how Jesus ministers for us in heaven',
        'Practice confession and accepting God\'s forgiveness',
        'Study the Day of Atonement and its significance',
        'Pray acknowledging Jesus as our High Priest',
        'Create artwork depicting the heavenly sanctuary'
      ],
      'The Remnant Church': [
        'Study the characteristics of God\'s last-day people',
        'Practice keeping God\'s commandments joyfully',
        'Share your faith with someone this week',
        'Study prophecy showing God\'s church through history',
        'Practice having the testimony of Jesus',
        'Commit to following Bible truth above tradition',
        'Pray for God\'s remnant church worldwide'
      ],
      'Spiritual Gifts': [
        'Identify and discuss each family member\'s spiritual gifts',
        'Practice using your gifts to serve others',
        'Study different spiritual gifts in the Bible',
        'Find ways to use gifts in your local church',
        'Pray for the gift of the Holy Spirit',
        'Create a gifts inventory for your family',
        'Plan a service project using your combined gifts'
      ],
      'The Gift of Prophecy': [
        'Study the biblical tests of a true prophet',
        'Read from Ellen White\'s writings together',
        'Discuss how prophecy helps guide the church',
        'Study fulfilled prophecy in the Bible',
        'Practice testing everything by Scripture',
        'Share how prophetic counsel has helped your family',
        'Create a timeline of biblical prophets'
      ],
      'Baptism': [
        'Study different baptisms in the Bible',
        'Discuss what baptism symbolizes',
        'If unbaptized, consider preparing for baptism',
        'Attend a baptismal service together',
        'Create art depicting the symbolism of baptism',
        'Share your baptismal experience if already baptized',
        'Practice living out your baptismal commitment'
      ],
      'The Lord\'s Supper': [
        'Study the symbols of communion',
        'Practice the foot-washing service at home',
        'Discuss what Jesus\' sacrifice means to you',
        'Create artwork depicting the Last Supper',
        'Practice examining yourselves before communion',
        'Discuss forgiveness and reconciliation',
        'Plan to participate meaningfully in communion'
      ],
      'Prayer and Faith': [
        'Create a family prayer journal',
        'Practice different prayer positions',
        'Set up a prayer corner in your home',
        'Share answered prayers from this week',
        'Pray for someone different each day',
        'Create prayer chains with paper links',
        'Have a prayer walk around your neighborhood'
      ],
      'Growing in Christ': [
        'Set spiritual growth goals as a family',
        'Practice daily Bible study together',
        'Share how you\'ve grown spiritually this year',
        'Create a spiritual growth chart',
        'Practice overcoming temptation together',
        'Find a mentor or be a mentor to someone',
        'Commit to developing Christian character traits'
      ],
      'Unity in the Body of Christ': [
        'Practice resolving conflicts peacefully',
        'Find ways to serve your local church together',
        'Discuss how diversity strengthens the church',
        'Practice accepting and loving different people',
        'Work on a project with other church families',
        'Pray for unity in your local church',
        'Study how the early church practiced unity'
      ],
      'The Great Controversy': [
        'Study the war between good and evil',
        'Discuss how to choose God\'s side daily',
        'Practice resisting temptation',
        'Study how Satan tries to deceive people',
        'Create a "spiritual armor" craft project',
        'Discuss how the controversy will end',
        'Practice being faithful to God despite opposition'
      ],
      'The New Earth': [
        'Create artwork depicting the New Earth',
        'Discuss what you\'re most excited about in the New Earth',
        'Practice living by New Earth principles now',
        'Care for creation as practice for the New Earth',
        'Study animals and imagine them tame',
        'Plan what you\'d like to do in the New Earth',
        'Practice peace and harmony in your family'
      ],
      'The Millennium': [
        'Study what happens during the 1000 years',
        'Discuss the judgment and God\'s justice',
        'Create a timeline of end-time events',
        'Practice making righteous judgments',
        'Study how God will finally end sin',
        'Discuss the importance of being ready',
        'Pray for loved ones who need to choose God'
      ],
      'Health and Wellness': [
        'Plan healthy meals following biblical principles',
        'Practice physical exercise as a family',
        'Study what the Bible says about caring for our bodies',
        'Try new healthy foods together',
        'Practice stress relief through prayer and trust',
        'Create a family health plan',
        'Discuss how health affects our witness'
      ],
      'Service and Mission': [
        'Plan a service project in your community',
        'Practice sharing your faith naturally',
        'Visit someone who needs encouragement',
        'Create care packages for those in need',
        'Practice the spiritual works of mercy',
        'Share Bible study materials with others',
        'Pray for missionaries around the world'
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
