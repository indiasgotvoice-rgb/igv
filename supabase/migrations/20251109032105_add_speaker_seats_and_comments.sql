/*
  # Add Speaker Seats and Comments System

  1. New Tables
    - `speaker_seats`
      - `id` (uuid, primary key)
      - `show_id` (uuid, references shows)
      - `seat_number` (integer, 1-10)
      - `user_id` (uuid, references user_profiles, nullable)
      - `is_muted` (boolean, default false)
      - `joined_at` (timestamptz)
      - Unique constraint on (show_id, seat_number)
      - Unique constraint on (show_id, user_id) to prevent duplicate seats
    
    - `show_comments`
      - `id` (uuid, primary key)
      - `show_id` (uuid, references shows)
      - `user_id` (uuid, references user_profiles)
      - `comment_text` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Anyone can view speaker seats and comments
    - Only admins can manage speaker seats (invite/remove users)
    - Authenticated users can post comments
    - Users can delete their own comments

  3. Important Notes
    - Speaker seats are limited to 10 per show
    - Only admins can assign users to speaker seats
    - Speakers can have their microphone muted by admins
*/

-- Speaker Seats Table (10 seats per show for speakers)
CREATE TABLE IF NOT EXISTS speaker_seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id uuid REFERENCES shows(id) ON DELETE CASCADE NOT NULL,
  seat_number integer NOT NULL CHECK (seat_number >= 1 AND seat_number <= 10),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  is_muted boolean DEFAULT false NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(show_id, seat_number),
  UNIQUE(show_id, user_id)
);

-- Show Comments Table
CREATE TABLE IF NOT EXISTS show_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id uuid REFERENCES shows(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  comment_text text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_speaker_seats_show_id ON speaker_seats(show_id);
CREATE INDEX IF NOT EXISTS idx_show_comments_show_id ON show_comments(show_id);
CREATE INDEX IF NOT EXISTS idx_show_comments_created_at ON show_comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE speaker_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_comments ENABLE ROW LEVEL SECURITY;

-- Speaker Seats Policies
CREATE POLICY "Anyone can view speaker seats"
  ON speaker_seats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert speaker seats"
  ON speaker_seats FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update speaker seats"
  ON speaker_seats FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can delete speaker seats"
  ON speaker_seats FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Show Comments Policies
CREATE POLICY "Anyone can view comments"
  ON show_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can post comments"
  ON show_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON show_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any comment"
  ON show_comments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );
