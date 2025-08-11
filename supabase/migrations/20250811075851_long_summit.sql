/*
  # Create Schools Table

  1. New Tables
    - `schools`
      - `id` (uuid, primary key)
      - `name` (text, school name)
      - `code` (text, unique school code)
      - `region` (text, school region/location)
      - `admin_email` (text, admin contact email)
      - `address` (text, school address)
      - `phone` (text, school phone)
      - `website` (text, school website)
      - `logo_url` (text, school logo)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `schools` table
    - Add policy for authenticated users to read their school data
    - Add policy for admins to update their school data
*/

CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  region text DEFAULT 'Default Region',
  admin_email text NOT NULL,
  address text,
  phone text,
  website text,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their school data"
  ON schools
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update their school data"
  ON schools
  FOR UPDATE
  TO authenticated
  USING (admin_email = auth.jwt() ->> 'email');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(code);
CREATE INDEX IF NOT EXISTS idx_schools_admin_email ON schools(admin_email);