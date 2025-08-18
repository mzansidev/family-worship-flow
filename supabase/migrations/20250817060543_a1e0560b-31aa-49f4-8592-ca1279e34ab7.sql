
-- Remove the long article that was just added
DELETE FROM principles_content WHERE title = 'The Importance of Family Worship';

-- Insert shorter, focused articles broken down by category
INSERT INTO principles_content (title, content, category_id, read_time, is_new) VALUES 

-- Getting Started category
('Why Family Worship Matters', 
'If ever there was a time when every house should be a house of prayer, it is now. Infidelity and skepticism prevail. Iniquity abounds. Yet, in this time of fearful peril, some who profess to be Christians have no family worship. They do not honor God in the home; they do not teach their children to love and fear Him.

The idea that prayer is not essential is one of Satan''s most successful devices to ruin souls. Prayer is communion with God, the Fountain of wisdom, the Source of strength, and peace, and happiness. Many have separated themselves so far from Him that they feel under condemnation in approaching Him. They cannot "come boldly unto the throne of grace." Hebrews 4:16.',
'getting-started', '2 min', true),

('Consistency in Family Worship',
'Family worship should not be governed by circumstances. You are not to pray occasionally and, when you have a large day''s work to do, neglect it. In thus doing you lead your children to look upon prayer as of no special consequence.

Fathers and mothers, however pressing your business, do not fail to gather your family around God''s altar. Ask for the guardianship of holy angels in your home. The hour of prayer should not be neglected for any consideration. Do not talk and amuse yourselves till all are too weary to enjoy the season of devotion.',
'building-consistency', '1 min', true),

-- Engaging Children category  
('Teaching Children to Respect Prayer Time',
'Your children should be educated to be kind, thoughtful of others, gentle, easy to be entreated, and, above everything else, to respect religious things and feel the importance of the claims of God. They should be taught to respect the hour of prayer; they should be required to rise in the morning so as to be present at family worship.

Children should be taught to respect and reverence the hour of prayer. It is the duty of Christian parents, morning and evening, by earnest prayer and persevering faith, to make a hedge about their children.',
'engaging-children', '1 min', true),

('Making Worship Interesting for Families',
'The father, who is the priest of his household, should conduct the morning and evening worship. There is no reason why this should not be the most interesting and enjoyable exercise of the home life, and God is dishonored when it is made dry and irksome.

Let the seasons of family worship be short and spirited. Do not let your children or any member of your family dread them because of their tediousness or lack of interest. It should be the special object of the heads of the family to make the hour of worship intensely interesting.',
'engaging-children', '1 min', true),

('Practical Tips for Engaging Worship',
'Let the father select a portion of Scripture that is interesting and easily understood; a few verses will be sufficient to furnish a lesson which may be studied and practiced through the day. Questions may be asked, a few earnest, interesting remarks made, or incident, short and to the point, may be brought in by way of illustration.

At least a few verses of spirited song may be sung, and the prayer offered should be short and pointed. The one who leads in prayer should not pray about everything, but should express his needs in simple words and praise God with thanksgiving.',
'engaging-children', '1 min', true),

-- Deepening Faith category
('True Prayer vs. Formal Prayer',
'In many cases the morning and evening worship is little more than a mere form, a dull, monotonous repetition of set phrases in which the spirit of gratitude or the sense of need finds no expression. The Lord accepts not such service.

But the petitions of a humble heart and contrite spirit He will not despise. The opening of our hearts to our heavenly Father, the acknowledgment of our entire dependence, the expression of our wants, the homage of grateful love—this is true prayer.',
'spiritual-growth', '1 min', true),

-- Building Consistency category
('Establishing Fixed Times for Worship',
'In every family there should be a fixed time for morning and evening worship. How appropriate it is for parents to gather their children about them before the fast is broken, to thank the heavenly Father for His protection during the night, and to ask Him for His help and guidance and watch care during the day!

How fitting, also, when evening comes, for parents and children to gather once more before Him and thank Him for the blessings of the day that is past! At an early hour of the evening, when we can pray unhurriedly and understandingly, we should present our supplications.',
'building-consistency', '1 min', true);
