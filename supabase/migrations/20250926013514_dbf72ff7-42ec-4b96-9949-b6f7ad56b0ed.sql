-- Create function to update timestamps (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create plan_history table to store saved worship plans with progress
CREATE TABLE public.plan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  study_type TEXT NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'weekly',
  book_name TEXT,
  topic_name TEXT,
  current_week INTEGER DEFAULT 1,
  current_chapter INTEGER DEFAULT 1,
  start_date DATE NOT NULL,
  progress_data JSONB,
  total_days_completed INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.plan_history ENABLE ROW LEVEL SECURITY;

-- Create policies for plan_history
CREATE POLICY "Users can view their own plan history" 
ON public.plan_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plan history" 
ON public.plan_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan history" 
ON public.plan_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plan history" 
ON public.plan_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_plan_history_updated_at
BEFORE UPDATE ON public.plan_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();