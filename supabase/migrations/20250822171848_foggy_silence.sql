/*
  # Update User ID Format for School-Role-Serial Structure

  1. Schema Updates
    - Add user_id field to users table for the new format (schoolname-role-serialno)
    - Update existing sample data to use new format
    - Add indexes for efficient lookups

  2. Security
    - Update RLS policies to work with new user ID format
    - Maintain existing security model

  3. Sample Data
    - Update existing users with new ID format
    - Ensure consistency across all tables
*/

-- Add user_id column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE users ADD COLUMN user_id text UNIQUE;
  END IF;
END $$;

-- Update existing users with new user_id format
UPDATE users SET user_id = 'greenwood-admin-001' 
WHERE email = 'admin@greenwood.edu' AND role = 'admin';

UPDATE users SET user_id = 'greenwood-teacher-001' 
WHERE email = 'sarah.johnson@greenwood.edu' AND role = 'teacher';

UPDATE users SET user_id = 'greenwood-teacher-002' 
WHERE email = 'michael.chen@greenwood.edu' AND role = 'teacher';

UPDATE users SET user_id = 'greenwood-parent-001' 
WHERE email = 'parent1@example.com' AND role = 'parent';

UPDATE users SET user_id = 'greenwood-parent-002' 
WHERE email = 'parent2@example.com' AND role = 'parent';

UPDATE users SET user_id = 'greenwood-student-001' 
WHERE email = 'alex.thompson@student.greenwood.edu' AND role = 'student';

UPDATE users SET user_id = 'greenwood-student-002' 
WHERE email = 'emma.wilson@student.greenwood.edu' AND role = 'student';

-- Create index on user_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);

-- Add constraint to ensure user_id follows the format
ALTER TABLE users ADD CONSTRAINT check_user_id_format 
CHECK (user_id ~ '^[a-z0-9]+-[a-z]+-[0-9]+$');

-- Update schools table to include the school code/ID
UPDATE schools SET code = 'greenwood' WHERE name = 'Greenwood High School';

-- Create a function to generate user IDs
CREATE OR REPLACE FUNCTION generate_user_id(school_code text, user_role text)
RETURNS text AS $$
DECLARE
  next_serial integer;
  new_user_id text;
BEGIN
  -- Get the next serial number for this school and role
  SELECT COALESCE(MAX(CAST(split_part(user_id, '-', 3) AS integer)), 0) + 1
  INTO next_serial
  FROM users 
  WHERE user_id LIKE school_code || '-' || user_role || '-%';
  
  -- Format the serial number with leading zeros
  new_user_id := school_code || '-' || user_role || '-' || LPAD(next_serial::text, 3, '0');
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;