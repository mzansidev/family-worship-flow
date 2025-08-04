
-- Create table for worship plans (both weekly and daily)
CREATE TABLE public.worship_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('weekly', 'daily')),
  study_type TEXT NOT NULL CHECK (study_type IN ('book', 'topic')),
  book_name TEXT,
  topic_name TEXT,
  current_week INTEGER DEFAULT 1,
  current_chapter INTEGER DEFAULT 1,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for daily worship entries
CREATE TABLE public.daily_worship_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  worship_plan_id UUID REFERENCES public.worship_plans(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  opening_song TEXT,
  bible_reading TEXT,
  discussion_questions JSONB,
  application TEXT,
  closing_song TEXT,
  theme TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user preferences
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  daily_plan_source TEXT NOT NULL DEFAULT 'random' CHECK (daily_plan_source IN ('random', 'weekly')),
  default_age_range TEXT DEFAULT 'family',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.worship_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_worship_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for worship_plans
CREATE POLICY "Users can view their own worship plans" 
  ON public.worship_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own worship plans" 
  ON public.worship_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own worship plans" 
  ON public.worship_plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own worship plans" 
  ON public.worship_plans 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for daily_worship_entries
CREATE POLICY "Users can view their own daily entries" 
  ON public.daily_worship_entries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily entries" 
  ON public.daily_worship_entries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily entries" 
  ON public.daily_worship_entries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily entries" 
  ON public.daily_worship_entries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
  ON public.user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);
