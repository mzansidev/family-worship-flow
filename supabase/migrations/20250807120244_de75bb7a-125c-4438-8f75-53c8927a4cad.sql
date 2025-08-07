
-- Create the missing user_principle_reads table
CREATE TABLE public.user_principle_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  principle_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, principle_id)
);

-- Add Row Level Security
ALTER TABLE public.user_principle_reads ENABLE ROW LEVEL SECURITY;

-- Create policies for the user_principle_reads table
CREATE POLICY "Users can view their own reads" 
  ON public.user_principle_reads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reads" 
  ON public.user_principle_reads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Fix the worship_plans table constraint that's causing the 400 error
-- First, let's check what constraints exist and potentially fix them
ALTER TABLE public.worship_plans DROP CONSTRAINT IF EXISTS worship_plans_study_type_check;

-- Add a proper constraint for study_type
ALTER TABLE public.worship_plans 
ADD CONSTRAINT worship_plans_study_type_check 
CHECK (study_type IN ('bible-book', 'topical'));

-- Add a proper constraint for plan_type
ALTER TABLE public.worship_plans DROP CONSTRAINT IF EXISTS worship_plans_plan_type_check;
ALTER TABLE public.worship_plans 
ADD CONSTRAINT worship_plans_plan_type_check 
CHECK (plan_type IN ('daily', 'weekly'));
