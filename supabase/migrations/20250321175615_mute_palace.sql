/*
  # Initial Schema Setup for Fitness App

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Matches Supabase auth.users id
      - `email` (text) - User's email
      - `username` (text) - User's display name
      - `weight_goal` (numeric) - Target weight in kg
      - `current_weight` (numeric) - Current weight in kg
      - `height` (numeric) - Height in cm
      - `daily_calorie_goal` (integer) - Daily calorie target
      - `created_at` (timestamp) - Account creation date
      - `updated_at` (timestamp) - Last profile update

    - `meals`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to users table
      - `name` (text) - Meal name
      - `calories` (integer) - Calories in meal
      - `protein` (numeric) - Protein content in grams
      - `carbs` (numeric) - Carbohydrate content in grams
      - `fat` (numeric) - Fat content in grams
      - `meal_type` (text) - breakfast/lunch/dinner/snack
      - `date` (date) - Date of meal
      - `created_at` (timestamp)

    - `exercises`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to users table
      - `name` (text) - Exercise name
      - `duration` (integer) - Duration in minutes
      - `calories_burned` (integer) - Estimated calories burned
      - `exercise_type` (text) - Type of exercise
      - `date` (date) - Date of exercise
      - `created_at` (timestamp)

    - `weight_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to users table
      - `weight` (numeric) - Weight in kg
      - `date` (date) - Date of weight entry
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text,
  username text,
  weight_goal numeric,
  current_weight numeric,
  height numeric,
  daily_calorie_goal integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Meals table
CREATE TABLE meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  calories integer NOT NULL,
  protein numeric,
  carbs numeric,
  fat numeric,
  meal_type text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meals"
  ON meals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Exercises table
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration integer NOT NULL,
  calories_burned integer NOT NULL,
  exercise_type text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exercises"
  ON exercises
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Weight logs table
CREATE TABLE weight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  weight numeric NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own weight logs"
  ON weight_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();