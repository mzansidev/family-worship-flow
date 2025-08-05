
-- First, let's add password change functionality and user reading tracking
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create a table to track which principles users have marked as understood
CREATE TABLE IF NOT EXISTS user_principle_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  principle_id UUID REFERENCES principles_content(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, principle_id)
);

-- Enable RLS on the new table
ALTER TABLE user_principle_reads ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own reads
CREATE POLICY "Users can manage their own principle reads" 
  ON user_principle_reads 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert the admin user (this will create the auth user and trigger the profile creation)
-- Note: In a real scenario, you'd want to hash the password properly
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  'admin-user-id-12345',
  'info@cwickcraft.com',
  crypt('QWERTY12345', gen_salt('bf')), -- This uses bcrypt hashing
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Update the admin user's profile to have admin role
INSERT INTO user_profiles (id, role, family_name) 
VALUES ('admin-user-id-12345', 'admin', 'Admin Family')
ON CONFLICT (id) DO UPDATE SET role = 'admin', family_name = 'Admin Family';
