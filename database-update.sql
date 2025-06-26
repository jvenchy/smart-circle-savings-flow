-- Update users table to include new life stage classification fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS primary_life_stage text,
ADD COLUMN IF NOT EXISTS secondary_life_stages text[],
ADD COLUMN IF NOT EXISTS stage_confidence_score numeric(3,2) CHECK (stage_confidence_score >= 0 AND stage_confidence_score <= 1),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create trigger to automatically update updated_at column for users
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- Create user_life_stage_history table
CREATE TABLE IF NOT EXISTS user_life_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  life_stage text NOT NULL,
  confidence_score numeric(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  transition_evidence text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_life_stage CHECK (life_stage IN (
    'new_parent', 'young_professional', 'established_family', 'empty_nester',
    'student', 'retiree', 'single_adult', 'couple_no_children', 
    'health_conscious', 'budget_conscious'
  )),
  
  -- Ensure ended_at is after started_at
  CONSTRAINT valid_date_range CHECK (ended_at IS NULL OR ended_at >= started_at)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_life_stage_history_user_id ON user_life_stage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_life_stage_history_life_stage ON user_life_stage_history(life_stage);
CREATE INDEX IF NOT EXISTS idx_user_life_stage_history_started_at ON user_life_stage_history(started_at);
CREATE INDEX IF NOT EXISTS idx_user_life_stage_history_ended_at ON user_life_stage_history(ended_at);
CREATE INDEX IF NOT EXISTS idx_user_life_stage_history_active ON user_life_stage_history(user_id, life_stage) WHERE ended_at IS NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE user_life_stage_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_life_stage_history
-- Policy to allow users to see only their own history
CREATE POLICY "Users can view own life stage history" ON user_life_stage_history
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own history (for applications)
CREATE POLICY "Users can insert own life stage history" ON user_life_stage_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own history (for closing stages)
CREATE POLICY "Users can update own life stage history" ON user_life_stage_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Create a helpful view for current life stages
CREATE OR REPLACE VIEW user_current_life_stages AS
SELECT 
  u.id as user_id,
  u.email,
  u.full_name,
  u.primary_life_stage,
  u.secondary_life_stages,
  u.stage_confidence_score,
  u.life_stage as legacy_life_stage,
  h.started_at as current_stage_started,
  h.transition_evidence as last_transition_evidence
FROM users u
LEFT JOIN user_life_stage_history h ON u.id = h.user_id 
  AND h.life_stage = COALESCE(u.primary_life_stage, u.life_stage)
  AND h.ended_at IS NULL;

-- Map existing life stage values to standardized ones
-- Update existing users with initial life stage history
INSERT INTO user_life_stage_history (user_id, life_stage, confidence_score, transition_evidence, started_at)
SELECT 
  id, 
  CASE 
    WHEN life_stage = 'Parent' THEN 'new_parent'
    WHEN life_stage = 'Young Professional' THEN 'young_professional'
    WHEN life_stage = 'Family' THEN 'established_family'
    WHEN life_stage = 'Empty Nester' THEN 'empty_nester'
    WHEN life_stage = 'Student' THEN 'student'
    WHEN life_stage = 'Retiree' THEN 'retiree'
    WHEN life_stage = 'Single' THEN 'single_adult'
    WHEN life_stage = 'Couple' THEN 'couple_no_children'
    WHEN life_stage = 'Health Conscious' THEN 'health_conscious'
    WHEN life_stage = 'Budget Conscious' THEN 'budget_conscious'
    WHEN life_stage ILIKE '%parent%' THEN 'new_parent'
    WHEN life_stage ILIKE '%professional%' THEN 'young_professional'
    WHEN life_stage ILIKE '%family%' THEN 'established_family'
    WHEN life_stage ILIKE '%single%' THEN 'single_adult'
    WHEN life_stage ILIKE '%couple%' THEN 'couple_no_children'
    ELSE 'new_parent'  -- Default fallback
  END as life_stage,
  0.5 as confidence_score,
  'Initial life stage assignment (mapped from: ' || COALESCE(life_stage, 'unknown') || ')' as transition_evidence,
  created_at as started_at
FROM users 
WHERE life_stage IS NOT NULL
ON CONFLICT DO NOTHING;

-- Comment explaining the schema
-- 
-- USAGE NOTES:
-- 1. primary_life_stage: The main life stage classification from AI
-- 2. secondary_life_stages: Array of additional applicable life stages  
-- 3. stage_confidence_score: AI confidence score (0.0 to 1.0)
-- 4. user_life_stage_history: Tracks all life stage transitions over time
-- 5. ended_at NULL means the life stage is currently active
-- 6. transition_evidence: Stores the AI reasoning for the classification 