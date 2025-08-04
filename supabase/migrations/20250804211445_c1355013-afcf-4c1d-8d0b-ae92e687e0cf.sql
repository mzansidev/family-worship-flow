
-- Add tables for proper dashboard tracking
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  total_worship_days INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_worship_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add table for principles library content (admin manageable)
CREATE TABLE public.principles_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  read_time TEXT NOT NULL,
  is_new BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add table for user notifications
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add user roles for admin functionality
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.principles_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_stats
CREATE POLICY "Users can view their own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for principles_content (public read, admin write)
CREATE POLICY "Anyone can read principles" ON public.principles_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage principles" ON public.principles_content FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS policies for user_notifications
CREATE POLICY "Users can view their notifications" ON public.user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.user_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can create notifications" ON public.user_notifications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS policies for user_profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role)
  VALUES (new.id, 'user');
  
  INSERT INTO public.user_stats (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

-- Trigger to create profile and stats on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update daily_worship_entries to have more detailed structure
ALTER TABLE public.daily_worship_entries 
ADD COLUMN IF NOT EXISTS reflection_notes TEXT,
ADD COLUMN IF NOT EXISTS family_members_present TEXT[];

-- Insert sample principles content
INSERT INTO public.principles_content (category_id, title, content, read_time) VALUES
('getting-started', 'Why Family Worship Matters', 'Family worship creates lasting spiritual bonds and helps children develop a personal relationship with God. Research shows that families who pray together stay together and children from faith-centered homes are more likely to maintain their faith into adulthood.', '3 min'),
('getting-started', 'Setting Up Your First Family Worship', 'Choose a consistent time that works for your family, create a welcoming atmosphere, and keep it simple. Start with just 10-15 minutes and gradually build the habit.', '5 min'),
('getting-started', 'Creating the Right Environment', 'Find a quiet space, minimize distractions, have Bibles and materials ready, and create a sense of reverence while keeping it comfortable for all ages.', '4 min'),
('engaging-children', 'Making Worship Fun for Young Children', 'Use visual aids, songs, simple stories, and hands-on activities. Let children participate through prayer, reading, or sharing what they learned.', '6 min'),
('engaging-children', 'Age-Appropriate Discussion Techniques', 'Ask open-ended questions, use examples from daily life, encourage questions, and adapt your language to each child''s understanding level.', '4 min'),
('building-consistency', 'Overcoming the Consistency Challenge', 'Start small, be flexible, don''t aim for perfection, and remember that something is better than nothing. Consistency matters more than length.', '7 min'),
('spiritual-growth', 'Moving Beyond Surface-Level Discussions', 'Ask deeper questions, share personal experiences, explore practical applications, and encourage family members to express doubts and questions safely.', '8 min');
