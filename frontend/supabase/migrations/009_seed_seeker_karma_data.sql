-- ============================================
-- SEED DUMMY KARMA DATA FOR JOB SEEKERS
-- ============================================
-- Creates realistic sessions, feedback, and karma progression for seekers

-- ============================================
-- USER 1: SHAYAN ABBAS (Active user - Growth Seeker level)
-- ============================================

-- Create sessions for Shayan with various coaches
INSERT INTO public.sessions (coach_id, seeker_id, session_type, session_date, duration_minutes, status, notes)
VALUES
  -- Session 1: Sara Dehdashti (Career Sage) - Resume & Interview
  (
    (SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    'Resume & Interview',
    NOW() - INTERVAL '45 days',
    60,
    'completed',
    'Worked on CV structure and formatting for tech roles'
  ),
  -- Session 2: Mustafa Aal-Sahek (Mentor Legend) - Job Search Strategy
  (
    (SELECT id FROM coaches WHERE email = 'mustafa@startuprefugees.com'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    'Job Search Strategy',
    NOW() - INTERVAL '38 days',
    60,
    'completed',
    'Discussed LinkedIn optimization and networking strategies'
  ),
  -- Session 3: Oleksandr Puzyrnyy (Career Alchemist) - Resume & Interview
  (
    (SELECT id FROM coaches WHERE email = 'oleksandr@startuprefugees.com'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    'Resume & Interview',
    NOW() - INTERVAL '30 days',
    60,
    'completed',
    'Mock interview practice for software developer position'
  ),
  -- Session 4: Sara Shirazi (Guiding Light) - Confidence Building
  (
    (SELECT id FROM coaches WHERE email = 'sara.shirazi@startuprefugees.com'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    'Confidence Building',
    NOW() - INTERVAL '22 days',
    60,
    'completed',
    'Building confidence for interviews and networking events'
  ),
  -- Session 5: Marina Berzina (Career Alchemist) - Career Transition
  (
    (SELECT id FROM coaches WHERE email = 'marina@startuprefugees.com'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    'Career Transition',
    NOW() - INTERVAL '15 days',
    60,
    'completed',
    'Exploring tech career paths and skill development needs'
  ),
  -- Session 6: Mustafa (Mentor Legend) - Follow-up
  (
    (SELECT id FROM coaches WHERE email = 'mustafa@startuprefugees.com'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    'Job Search Strategy',
    NOW() - INTERVAL '8 days',
    60,
    'completed',
    'Follow-up on job applications and interview prep'
  ),
  -- Session 7: Upcoming session
  (
    (SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    'Interview Preparation',
    NOW() + INTERVAL '3 days',
    60,
    'scheduled',
    'Final interview preparation for target companies'
  );

-- Add feedback for Shayan's completed sessions
INSERT INTO public.session_feedback (session_id, seeker_id, coach_id, vibe, reflection, impact_karma_awarded, connection_karma_awarded, wisdom_karma_awarded, engagement_xp_awarded)
VALUES
  -- Session 1 feedback: Breakthrough moment with Sara
  (
    (SELECT id FROM sessions WHERE seeker_id = 'ee076086-a712-4faf-b34b-3ba44a5005d1' AND coach_id = (SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com') AND status = 'completed' ORDER BY session_date LIMIT 1),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    (SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com'),
    'breakthrough',
    'Sara helped me completely restructure my CV - it looks professional now!',
    25, 5, 10, 5
  ),
  -- Session 2 feedback: Made me focus with Mustafa
  (
    (SELECT id FROM sessions WHERE seeker_id = 'ee076086-a712-4faf-b34b-3ba44a5005d1' AND coach_id = (SELECT id FROM coaches WHERE email = 'mustafa@startuprefugees.com') AND status = 'completed' ORDER BY session_date LIMIT 1),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    (SELECT id FROM coaches WHERE email = 'mustafa@startuprefugees.com'),
    'focus',
    'Clear action plan for LinkedIn and networking. Mustafa is very practical!',
    15, 5, 0, 5
  ),
  -- Session 3 feedback: Breakthrough with Oleksandr
  (
    (SELECT id FROM sessions WHERE seeker_id = 'ee076086-a712-4faf-b34b-3ba44a5005d1' AND coach_id = (SELECT id FROM coaches WHERE email = 'oleksandr@startuprefugees.com') AND status = 'completed'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    (SELECT id FROM coaches WHERE email = 'oleksandr@startuprefugees.com'),
    'breakthrough',
    'Mock interview was tough but so valuable. I feel much more prepared now.',
    25, 5, 10, 5
  ),
  -- Session 4 feedback: Felt encouraging with Sara Shirazi
  (
    (SELECT id FROM sessions WHERE seeker_id = 'ee076086-a712-4faf-b34b-3ba44a5005d1' AND coach_id = (SELECT id FROM coaches WHERE email = 'sara.shirazi@startuprefugees.com') AND status = 'completed'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    (SELECT id FROM coaches WHERE email = 'sara.shirazi@startuprefugees.com'),
    'encouraging',
    'Sara really boosted my confidence. I feel ready to tackle interviews now!',
    0, 15, 0, 5
  ),
  -- Session 5 feedback: Made me focus with Marina
  (
    (SELECT id FROM sessions WHERE seeker_id = 'ee076086-a712-4faf-b34b-3ba44a5005d1' AND coach_id = (SELECT id FROM coaches WHERE email = 'marina@startuprefugees.com') AND status = 'completed'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    (SELECT id FROM coaches WHERE email = 'marina@startuprefugees.com'),
    'focus',
    'Marina helped me clarify my career direction in tech.',
    15, 5, 0, 5
  ),
  -- Session 6 feedback: Felt encouraging with Mustafa (follow-up)
  (
    (SELECT id FROM sessions WHERE seeker_id = 'ee076086-a712-4faf-b34b-3ba44a5005d1' AND coach_id = (SELECT id FROM coaches WHERE email = 'mustafa@startuprefugees.com') AND status = 'completed' ORDER BY session_date DESC LIMIT 1),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    (SELECT id FROM coaches WHERE email = 'mustafa@startuprefugees.com'),
    'encouraging',
    'Great follow-up session. Mustafa keeps me accountable and motivated!',
    0, 15, 0, 5
  );

-- Update Shayan's interested services (from wizard step 2)
UPDATE public.user_profiles
SET interested_services = ARRAY['jobseeker_advisor', 'skill_developer']
WHERE user_id = 'ee076086-a712-4faf-b34b-3ba44a5005d1';

-- ============================================
-- USER 2: NADA RAHALI (New user - Active Learner level)
-- ============================================

-- Create sessions for Nada with coaches
INSERT INTO public.sessions (coach_id, seeker_id, session_type, session_date, duration_minutes, status, notes)
VALUES
  -- Session 1: Rima Depo (Career Alchemist) - Initial consultation
  (
    (SELECT id FROM coaches WHERE email = 'rima@startuprefugees.com'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    'Resume & Interview',
    NOW() - INTERVAL '5 days',
    60,
    'completed',
    'First session - career assessment and CV review'
  ),
  -- Session 2: Alina Plorina (Guiding Light) - Follow-up scheduled
  (
    (SELECT id FROM coaches WHERE email = 'alina@startuprefugees.com'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    'Job Search Strategy',
    NOW() + INTERVAL '2 days',
    60,
    'scheduled',
    'Job search strategy and networking tips'
  );

-- Add feedback for Nada's completed session
INSERT INTO public.session_feedback (session_id, seeker_id, coach_id, vibe, reflection, impact_karma_awarded, connection_karma_awarded, wisdom_karma_awarded, engagement_xp_awarded)
VALUES
  -- Session 1 feedback: Felt encouraging with Rima
  (
    (SELECT id FROM sessions WHERE seeker_id = '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a' AND coach_id = (SELECT id FROM coaches WHERE email = 'rima@startuprefugees.com') AND status = 'completed'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    (SELECT id FROM coaches WHERE email = 'rima@startuprefugees.com'),
    'encouraging',
    'Rima was very supportive and gave me confidence to start my job search!',
    0, 15, 0, 5
  );

-- ============================================
-- VERIFY RESULTS
-- ============================================

-- Check seeker karma (should be auto-calculated by triggers)
SELECT 
  up.full_name,
  up.seeker_karma,
  up.seeker_level,
  up.sessions_attended,
  up.reflections_given,
  up.referrals_made,
  up.interested_services
FROM user_profiles up
WHERE up.user_id IN ('ee076086-a712-4faf-b34b-3ba44a5005d1', '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a')
ORDER BY up.seeker_karma DESC;

-- Expected results:
-- Shayan: 
--   - 6 completed sessions × 20 karma = 120 karma (from attendance)
--   - 6 feedback submissions × 10 karma = 60 karma (from giving feedback)
--   - 6 reflections × 5 karma = 30 karma (reflection bonus)
--   - Total: 210 karma → 🚀 GROWTH SEEKER (200+ needed for Pro Networker)
--
-- Nada:
--   - 1 completed session × 20 karma = 20 karma
--   - 1 feedback submission × 10 karma = 10 karma
--   - 1 reflection × 5 karma = 5 karma
--   - Total: 35 karma → 🌱 NEW SEEKER (50 needed for Active Learner)

-- View all sessions with feedback status
SELECT 
  s.session_date,
  c.name as coach_name,
  up.full_name as seeker_name,
  s.session_type,
  s.status,
  CASE 
    WHEN sf.id IS NOT NULL THEN '✅ Feedback given'
    WHEN s.status = 'completed' THEN '⏳ Pending feedback'
    ELSE '📅 Scheduled'
  END as feedback_status,
  sf.vibe,
  sf.reflection
FROM sessions s
JOIN coaches c ON c.id = s.coach_id
JOIN user_profiles up ON up.user_id = s.seeker_id
LEFT JOIN session_feedback sf ON sf.session_id = s.id
WHERE s.seeker_id IN ('ee076086-a712-4faf-b34b-3ba44a5005d1', '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a')
ORDER BY s.session_date DESC;

-- Check karma awarded to coaches from feedback
SELECT 
  c.name as coach_name,
  c.type,
  COUNT(sf.id) as feedback_received,
  SUM(sf.impact_karma_awarded) as total_impact_awarded,
  SUM(sf.connection_karma_awarded) as total_connection_awarded,
  SUM(sf.wisdom_karma_awarded) as total_wisdom_awarded,
  SUM(sf.engagement_xp_awarded) as total_engagement_awarded
FROM coaches c
LEFT JOIN session_feedback sf ON sf.coach_id = c.id
WHERE sf.seeker_id IN ('ee076086-a712-4faf-b34b-3ba44a5005d1', '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a')
GROUP BY c.id, c.name, c.type
ORDER BY COUNT(sf.id) DESC;

-- Summary statistics
SELECT 
  'Total Sessions' as metric,
  COUNT(*) as value
FROM sessions
WHERE seeker_id IN ('ee076086-a712-4faf-b34b-3ba44a5005d1', '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a')
UNION ALL
SELECT 
  'Completed Sessions',
  COUNT(*)
FROM sessions
WHERE seeker_id IN ('ee076086-a712-4faf-b34b-3ba44a5005d1', '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a')
  AND status = 'completed'
UNION ALL
SELECT 
  'Scheduled Sessions',
  COUNT(*)
FROM sessions
WHERE seeker_id IN ('ee076086-a712-4faf-b34b-3ba44a5005d1', '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a')
  AND status = 'scheduled'
UNION ALL
SELECT 
  'Total Feedback Given',
  COUNT(*)
FROM session_feedback
WHERE seeker_id IN ('ee076086-a712-4faf-b34b-3ba44a5005d1', '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a')
UNION ALL
SELECT 
  'Total Seeker Karma',
  SUM(seeker_karma)
FROM user_profiles
WHERE user_id IN ('ee076086-a712-4faf-b34b-3ba44a5005d1', '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a');

-- Check level progression
SELECT 
  up.full_name,
  up.seeker_karma,
  up.seeker_level,
  CASE 
    WHEN up.seeker_karma >= 200 THEN '⭐ Pro Networker (200+)'
    WHEN up.seeker_karma >= 100 THEN '🚀 Growth Seeker (100-199)'
    WHEN up.seeker_karma >= 50 THEN '📚 Active Learner (50-99)'
    ELSE '🌱 New Seeker (0-49)'
  END as level_description,
  CASE
    WHEN up.seeker_karma < 50 THEN 50 - up.seeker_karma
    WHEN up.seeker_karma < 100 THEN 100 - up.seeker_karma
    WHEN up.seeker_karma < 200 THEN 200 - up.seeker_karma
    ELSE 0
  END as karma_to_next_level
FROM user_profiles up
WHERE up.user_id IN ('ee076086-a712-4faf-b34b-3ba44a5005d1', '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a')
ORDER BY up.seeker_karma DESC;

