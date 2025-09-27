-- Create table for weekly worship plan assignments
CREATE TABLE public.weekly_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worship_plan_id UUID NOT NULL,
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0-6 for Monday-Sunday
  role TEXT NOT NULL,
  assigned_member_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(worship_plan_id, day_of_week, role)
);

-- Enable Row Level Security
ALTER TABLE public.weekly_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for weekly_assignments
CREATE POLICY "Users can view their own weekly assignments" 
ON public.weekly_assignments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly assignments" 
ON public.weekly_assignments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly assignments" 
ON public.weekly_assignments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly assignments" 
ON public.weekly_assignments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_weekly_assignments_updated_at
BEFORE UPDATE ON public.weekly_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();