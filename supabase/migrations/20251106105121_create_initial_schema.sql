/*
  # India's Got Voice - Initial Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `phone` (text, optional)
      - `user_type` (enum: 'viewer', 'participant', 'admin')
      - `avatar_url` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `shows`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `banner_url` (text, optional)
      - `status` (enum: 'upcoming', 'live', 'ended')
      - `scheduled_at` (timestamptz)
      - `started_at` (timestamptz, optional)
      - `ended_at` (timestamptz, optional)
      - `total_seats` (integer, default 1000)
      - `created_by` (uuid, references user_profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `participants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `show_id` (uuid, references shows)
      - `stage_name` (text)
      - `bio` (text, optional)
      - `voice_clip_url` (text)
      - `status` (enum: 'pending', 'approved', 'rejected', 'performing')
      - `performance_order` (integer, optional)
      - `total_votes` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `virtual_seats`
      - `id` (uuid, primary key)
      - `show_id` (uuid, references shows)
      - `user_id` (uuid, references user_profiles)
      - `seat_number` (integer)
      - `joined_at` (timestamptz)
    
    - `votes`
      - `id` (uuid, primary key)
      - `participant_id` (uuid, references participants)
      - `user_id` (uuid, references user_profiles)
      - `show_id` (uuid, references shows)
      - `voted_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read public data
    - Add policies for users to manage their own data
    - Add policies for admins to manage all data
*/

-- Create user types enum
CREATE TYPE user_type AS ENUM ('viewer', 'participant', 'admin');
CREATE TYPE show_status AS ENUM ('upcoming', 'live', 'ended');
CREATE TYPE participant_status AS ENUM ('pending', 'approved', 'rejected', 'performing');

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  user_type user_type DEFAULT 'viewer' NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Shows Table
CREATE TABLE IF NOT EXISTS shows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  banner_url text,
  status show_status DEFAULT 'upcoming' NOT NULL,
  scheduled_at timestamptz NOT NULL,
  started_at timestamptz,
  ended_at timestamptz,
  total_seats integer DEFAULT 1000 NOT NULL,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Participants Table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  show_id uuid REFERENCES shows(id) ON DELETE CASCADE NOT NULL,
  stage_name text NOT NULL,
  bio text,
  voice_clip_url text NOT NULL,
  status participant_status DEFAULT 'pending' NOT NULL,
  performance_order integer,
  total_votes integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, show_id)
);

-- Virtual Seats Table
CREATE TABLE IF NOT EXISTS virtual_seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id uuid REFERENCES shows(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  seat_number integer NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(show_id, seat_number),
  UNIQUE(show_id, user_id)
);

-- Votes Table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  show_id uuid REFERENCES shows(id) ON DELETE CASCADE NOT NULL,
  voted_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(participant_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shows_status ON shows(status);
CREATE INDEX IF NOT EXISTS idx_shows_scheduled_at ON shows(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_participants_show_id ON participants(show_id);
CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(status);
CREATE INDEX IF NOT EXISTS idx_virtual_seats_show_id ON virtual_seats(show_id);
CREATE INDEX IF NOT EXISTS idx_votes_participant_id ON votes(participant_id);
CREATE INDEX IF NOT EXISTS idx_votes_show_id ON votes(show_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Anyone can view user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Shows Policies
CREATE POLICY "Anyone can view shows"
  ON shows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert shows"
  ON shows FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update shows"
  ON shows FOR UPDATE
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

CREATE POLICY "Admins can delete shows"
  ON shows FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Participants Policies
CREATE POLICY "Anyone can view approved participants"
  ON participants FOR SELECT
  TO authenticated
  USING (status = 'approved' OR status = 'performing' OR user_id = auth.uid());

CREATE POLICY "Users can insert own participation"
  ON participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all participants"
  ON participants FOR ALL
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

-- Virtual Seats Policies
CREATE POLICY "Anyone can view virtual seats"
  ON virtual_seats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can take their own seat"
  ON virtual_seats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave their own seat"
  ON virtual_seats FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Votes Policies
CREATE POLICY "Users can view all votes"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own vote"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cannot update votes"
  ON votes FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Users can delete own vote"
  ON votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update participant vote count
CREATE OR REPLACE FUNCTION update_participant_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE participants
    SET total_votes = total_votes + 1
    WHERE id = NEW.participant_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE participants
    SET total_votes = total_votes - 1
    WHERE id = OLD.participant_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update vote counts
CREATE TRIGGER trigger_update_participant_votes
AFTER INSERT OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_participant_votes();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON shows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();