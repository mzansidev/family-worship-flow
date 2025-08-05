
-- Add family_name to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN family_name TEXT;

-- Create table for reflections
CREATE TABLE user_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  daily_entry_id UUID REFERENCES daily_worship_entries(id) ON DELETE CASCADE,
  reflection_text TEXT NOT NULL,
  bible_verse TEXT,
  worship_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for reflections
ALTER TABLE user_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reflections" 
  ON user_reflections 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reflections" 
  ON user_reflections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections" 
  ON user_reflections 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections" 
  ON user_reflections 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create table for family members
CREATE TABLE family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'participant',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for family members
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their family members" 
  ON family_members 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add responsibility assignments to daily worship entries
ALTER TABLE daily_worship_entries 
ADD COLUMN leader_id UUID REFERENCES family_members(id),
ADD COLUMN assistant_id UUID REFERENCES family_members(id);

-- Update user_profiles RLS to allow updates
CREATE POLICY "Users can update their own profile" 
  ON user_profiles 
  FOR UPDATE 
  USING (auth.uid() = id);
