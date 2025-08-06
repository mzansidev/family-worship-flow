
-- Fix foreign key constraints to allow proper user deletion
-- Update user_profiles to have proper cascade delete
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraints with cascade delete for other user-related tables
ALTER TABLE public.user_stats
DROP CONSTRAINT IF EXISTS user_stats_user_id_fkey;

ALTER TABLE public.user_stats
ADD CONSTRAINT user_stats_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.family_members
DROP CONSTRAINT IF EXISTS family_members_user_id_fkey;

ALTER TABLE public.family_members
ADD CONSTRAINT family_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.daily_worship_entries
DROP CONSTRAINT IF EXISTS daily_worship_entries_user_id_fkey;

ALTER TABLE public.daily_worship_entries
ADD CONSTRAINT daily_worship_entries_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.worship_plans
DROP CONSTRAINT IF EXISTS worship_plans_user_id_fkey;

ALTER TABLE public.worship_plans
ADD CONSTRAINT worship_plans_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_reflections
DROP CONSTRAINT IF EXISTS user_reflections_user_id_fkey;

ALTER TABLE public.user_reflections
ADD CONSTRAINT user_reflections_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_preferences
DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

ALTER TABLE public.user_preferences
ADD CONSTRAINT user_preferences_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_notifications
DROP CONSTRAINT IF EXISTS user_notifications_user_id_fkey;

ALTER TABLE public.user_notifications
ADD CONSTRAINT user_notifications_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add cascade delete for user_principle_reads table
ALTER TABLE public.user_principle_reads
DROP CONSTRAINT IF EXISTS user_principle_reads_user_id_fkey;

ALTER TABLE public.user_principle_reads
ADD CONSTRAINT user_principle_reads_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_principle_reads
DROP CONSTRAINT IF EXISTS user_principle_reads_principle_id_fkey;

ALTER TABLE public.user_principle_reads
ADD CONSTRAINT user_principle_reads_principle_id_fkey
FOREIGN KEY (principle_id) REFERENCES public.principles_content(id) ON DELETE CASCADE;
