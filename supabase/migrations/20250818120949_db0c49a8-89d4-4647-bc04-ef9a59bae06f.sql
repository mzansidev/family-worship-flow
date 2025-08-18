
-- First, let's check if we have the user_role enum and update it if needed
DO $$ 
BEGIN
    -- Check if the enum type exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'user');
    ELSE
        -- If it exists, check if 'admin' value is present, if not add it
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
            ALTER TYPE user_role ADD VALUE 'admin';
        END IF;
    END IF;
END $$;

-- Create the admin user in auth.users if it doesn't exist
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    'mccoyenoch@gmail.com',
    crypt('123456789', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- Update or insert the user profile with admin role
INSERT INTO user_profiles (id, role, created_at)
SELECT 
    u.id,
    'admin'::user_role,
    now()
FROM auth.users u
WHERE u.email = 'mccoyenoch@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'admin'::user_role;

-- Also ensure user_stats record exists
INSERT INTO user_stats (user_id, created_at, updated_at)
SELECT 
    u.id,
    now(),
    now()
FROM auth.users u
WHERE u.email = 'mccoyenoch@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
