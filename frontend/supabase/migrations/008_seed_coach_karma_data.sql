-- ============================================
-- SEED DUMMY KARMA DATA FOR COACHES
-- ============================================
-- This gives each coach varied karma levels to showcase the gamification system

-- 🌈 CAREER SAGE (900-1000) - Top performer
UPDATE coaches 
SET 
  impact_karma = 380,
  connection_karma = 240,
  wisdom_karma = 190,
  engagement_xp = 145,
  streak_weeks = 28,
  streak_active = true,
  total_sessions = 156,
  last_session_date = NOW() - INTERVAL '2 days'
WHERE email = 'sara@startuprefugees.com';

-- 🔥 MENTOR LEGEND (700-899) - High achievers
UPDATE coaches 
SET 
  impact_karma = 320,
  connection_karma = 210,
  wisdom_karma = 165,
  engagement_xp = 130,
  streak_weeks = 18,
  streak_active = true,
  total_sessions = 112,
  last_session_date = NOW() - INTERVAL '1 day'
WHERE email = 'mustafa@startuprefugees.com';

UPDATE coaches 
SET 
  impact_karma = 290,
  connection_karma = 195,
  wisdom_karma = 170,
  engagement_xp = 125,
  streak_weeks = 15,
  streak_active = true,
  total_sessions = 98,
  last_session_date = NOW() - INTERVAL '3 days'
WHERE email = 'georgios@startuprefugees.com';

-- 🌿 CAREER ALCHEMIST (400-699) - Solid mid-level
UPDATE coaches 
SET 
  impact_karma = 245,
  connection_karma = 180,
  wisdom_karma = 140,
  engagement_xp = 95,
  streak_weeks = 12,
  streak_active = true,
  total_sessions = 76,
  last_session_date = NOW() - INTERVAL '4 days'
WHERE email = 'oleksandr@startuprefugees.com';

UPDATE coaches 
SET 
  impact_karma = 220,
  connection_karma = 160,
  wisdom_karma = 125,
  engagement_xp = 88,
  streak_weeks = 8,
  streak_active = false,
  total_sessions = 65,
  last_session_date = NOW() - INTERVAL '10 days'
WHERE email = 'rima@startuprefugees.com';

UPDATE coaches 
SET 
  impact_karma = 185,
  connection_karma = 145,
  wisdom_karma = 110,
  engagement_xp = 80,
  streak_weeks = 6,
  streak_active = true,
  total_sessions = 54,
  last_session_date = NOW() - INTERVAL '2 days'
WHERE email = 'mia@startuprefugees.com';

UPDATE coaches 
SET 
  impact_karma = 195,
  connection_karma = 135,
  wisdom_karma = 105,
  engagement_xp = 75,
  streak_weeks = 5,
  streak_active = true,
  total_sessions = 48,
  last_session_date = NOW() - INTERVAL '1 day'
WHERE email = 'marina@startuprefugees.com';

-- 💡 GUIDING LIGHT (200-399) - Growing coaches
UPDATE coaches 
SET 
  impact_karma = 140,
  connection_karma = 105,
  wisdom_karma = 80,
  engagement_xp = 60,
  streak_weeks = 4,
  streak_active = true,
  total_sessions = 38,
  last_session_date = NOW() - INTERVAL '3 days'
WHERE email = 'sara.shirazi@startuprefugees.com';

UPDATE coaches 
SET 
  impact_karma = 125,
  connection_karma = 95,
  wisdom_karma = 70,
  engagement_xp = 55,
  streak_weeks = 3,
  streak_active = false,
  total_sessions = 32,
  last_session_date = NOW() - INTERVAL '12 days'
WHERE email = 'safaa@startuprefugees.com';

UPDATE coaches 
SET 
  impact_karma = 110,
  connection_karma = 88,
  wisdom_karma = 65,
  engagement_xp = 48,
  streak_weeks = 2,
  streak_active = true,
  total_sessions = 28,
  last_session_date = NOW() - INTERVAL '5 days'
WHERE email = 'alina@startuprefugees.com';

UPDATE coaches 
SET 
  impact_karma = 95,
  connection_karma = 75,
  wisdom_karma = 55,
  engagement_xp = 42,
  streak_weeks = 2,
  streak_active = true,
  total_sessions = 24,
  last_session_date = NOW() - INTERVAL '4 days'
WHERE email = 'arkan@startuprefugees.com';

-- 🧩 ROOKIE COACH (0-199) - New or less active
UPDATE coaches 
SET 
  impact_karma = 75,
  connection_karma = 60,
  wisdom_karma = 45,
  engagement_xp = 35,
  streak_weeks = 1,
  streak_active = true,
  total_sessions = 18,
  last_session_date = NOW() - INTERVAL '6 days'
WHERE email = 'uladzimir@startuprefugees.com';

UPDATE coaches 
SET 
  impact_karma = 55,
  connection_karma = 45,
  wisdom_karma = 35,
  engagement_xp = 25,
  streak_weeks = 0,
  streak_active = false,
  total_sessions = 12,
  last_session_date = NOW() - INTERVAL '15 days'
WHERE email = 'lejla@startuprefugees.com';

UPDATE coaches 
SET 
  impact_karma = 40,
  connection_karma = 35,
  wisdom_karma = 25,
  engagement_xp = 18,
  streak_weeks = 0,
  streak_active = false,
  total_sessions = 8,
  last_session_date = NOW() - INTERVAL '20 days'
WHERE email = 'muntaser@startuprefugees.com';

UPDATE coaches 
SET 
  impact_karma = 25,
  connection_karma = 20,
  wisdom_karma = 15,
  engagement_xp = 12,
  streak_weeks = 0,
  streak_active = false,
  total_sessions = 5,
  last_session_date = NOW() - INTERVAL '25 days'
WHERE email = 'yelizaveta@startuprefugees.com';

-- Update ratings based on karma performance (optional visual enhancement)
UPDATE coaches SET rating = 4.9 WHERE email = 'sara@startuprefugees.com';
UPDATE coaches SET rating = 4.8 WHERE email = 'mustafa@startuprefugees.com';
UPDATE coaches SET rating = 4.7 WHERE email = 'georgios@startuprefugees.com';
UPDATE coaches SET rating = 4.6 WHERE email = 'oleksandr@startuprefugees.com';
UPDATE coaches SET rating = 4.5 WHERE email = 'rima@startuprefugees.com';
UPDATE coaches SET rating = 4.5 WHERE email = 'mia@startuprefugees.com';
UPDATE coaches SET rating = 4.4 WHERE email = 'marina@startuprefugees.com';
UPDATE coaches SET rating = 4.3 WHERE email = 'sara.shirazi@startuprefugees.com';
UPDATE coaches SET rating = 4.2 WHERE email = 'safaa@startuprefugees.com';
UPDATE coaches SET rating = 4.1 WHERE email = 'alina@startuprefugees.com';
UPDATE coaches SET rating = 4.0 WHERE email = 'arkan@startuprefugees.com';
UPDATE coaches SET rating = 3.9 WHERE email = 'uladzimir@startuprefugees.com';
UPDATE coaches SET rating = 3.8 WHERE email = 'lejla@startuprefugees.com';
UPDATE coaches SET rating = 3.5 WHERE email = 'muntaser@startuprefugees.com';
UPDATE coaches SET rating = 3.2 WHERE email = 'yelizaveta@startuprefugees.com';

-- Verify the results
SELECT 
  name,
  type,
  total_karma,
  level,
  streak_weeks,
  streak_active,
  total_sessions,
  rating
FROM coaches
ORDER BY total_karma DESC;

-- Summary by level
SELECT 
  level,
  COUNT(*) as coach_count,
  AVG(total_karma)::INTEGER as avg_karma,
  AVG(total_sessions)::INTEGER as avg_sessions,
  SUM(CASE WHEN streak_active THEN 1 ELSE 0 END) as active_streaks
FROM coaches
GROUP BY level
ORDER BY 
  CASE level
    WHEN 'career_sage' THEN 5
    WHEN 'mentor_legend' THEN 4
    WHEN 'career_alchemist' THEN 3
    WHEN 'guiding_light' THEN 2
    ELSE 1
  END DESC;

-- Karma breakdown by coach type
SELECT 
  type,
  COUNT(*) as coaches,
  AVG(impact_karma)::INTEGER as avg_impact,
  AVG(connection_karma)::INTEGER as avg_connection,
  AVG(wisdom_karma)::INTEGER as avg_wisdom,
  AVG(engagement_xp)::INTEGER as avg_engagement
FROM coaches
GROUP BY type;

