-- Fix existing data script
-- Run this if you already have data that doesn't match the constraints

-- First, let's see what life stage values we currently have
-- SELECT DISTINCT life_stage FROM users WHERE life_stage IS NOT NULL;

-- Clean up any existing user_life_stage_history entries that might violate constraints
DELETE FROM user_life_stage_history 
WHERE life_stage NOT IN (
  'new_parent', 'young_professional', 'established_family', 'empty_nester',
  'student', 'retiree', 'single_adult', 'couple_no_children', 
  'health_conscious', 'budget_conscious'
);

-- Update users table to use standardized life stage values
UPDATE users 
SET life_stage = CASE 
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
END
WHERE life_stage IS NOT NULL 
AND life_stage NOT IN (
  'new_parent', 'young_professional', 'established_family', 'empty_nester',
  'student', 'retiree', 'single_adult', 'couple_no_children', 
  'health_conscious', 'budget_conscious'
);

-- Now re-insert the corrected history data
INSERT INTO user_life_stage_history (user_id, life_stage, confidence_score, transition_evidence, started_at)
SELECT 
  id, 
  life_stage,
  0.5 as confidence_score,
  'Initial life stage assignment (corrected)' as transition_evidence,
  created_at as started_at
FROM users 
WHERE life_stage IS NOT NULL
AND id NOT IN (SELECT DISTINCT user_id FROM user_life_stage_history)
ON CONFLICT DO NOTHING;

-- Verify the data
SELECT 'Users with non-standard life stages' as check_name, COUNT(*) as count
FROM users 
WHERE life_stage IS NOT NULL 
AND life_stage NOT IN (
  'new_parent', 'young_professional', 'established_family', 'empty_nester',
  'student', 'retiree', 'single_adult', 'couple_no_children', 
  'health_conscious', 'budget_conscious'
)

UNION ALL

SELECT 'History entries with non-standard life stages' as check_name, COUNT(*) as count
FROM user_life_stage_history 
WHERE life_stage NOT IN (
  'new_parent', 'young_professional', 'established_family', 'empty_nester',
  'student', 'retiree', 'single_adult', 'couple_no_children', 
  'health_conscious', 'budget_conscious'
);

-- Show the current distribution of life stages
SELECT 'Current life stage distribution' as info, life_stage, COUNT(*) as count
FROM users 
WHERE life_stage IS NOT NULL
GROUP BY life_stage
ORDER BY count DESC; 