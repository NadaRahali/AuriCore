-- ============================================
-- ADD MORE DUMMY REVIEWS FOR COACHES
-- ============================================
-- Creates additional anonymous job seekers and reviews to populate coach profiles

-- Note: We'll create dummy user_profiles without creating auth users
-- These are for display purposes only in the reviews section

-- Create dummy user profiles for reviews (these don't have auth.users entries, just for review display)
-- We'll use the full_name and avatar_url fields for display in reviews

-- First, let's add more reviews using our existing real users (Shayan & Nada)
-- and create additional anonymous profiles for variety

-- ============================================
-- ADD MORE SESSIONS AND REVIEWS FROM SHAYAN
-- ============================================

-- Additional sessions for coaches who don't have reviews yet
INSERT INTO public.sessions (coach_id, seeker_id, session_type, session_date, duration_minutes, status, notes)
VALUES
  -- Georgios (Mentor Legend - Entrepreneurship)
  (
    (SELECT id FROM coaches WHERE email = 'georgios@startuprefugees.com'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    'Business Planning',
    NOW() - INTERVAL '60 days',
    60,
    'completed',
    'Exploring entrepreneurship opportunities and business model validation'
  ),
  -- Mia (Career Alchemist - Entrepreneurship)
  (
    (SELECT id FROM coaches WHERE email = 'mia@startuprefugees.com'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    'Business Planning',
    NOW() - INTERVAL '52 days',
    60,
    'completed',
    'Discussed startup funding options and pitch preparation'
  );

-- Add feedback for these new sessions
INSERT INTO public.session_feedback (session_id, seeker_id, coach_id, vibe, reflection, impact_karma_awarded, connection_karma_awarded, wisdom_karma_awarded, engagement_xp_awarded)
VALUES
  -- Georgios feedback: Breakthrough
  (
    (SELECT id FROM sessions WHERE seeker_id = 'ee076086-a712-4faf-b34b-3ba44a5005d1' AND coach_id = (SELECT id FROM coaches WHERE email = 'georgios@startuprefugees.com') AND status = 'completed'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    (SELECT id FROM coaches WHERE email = 'georgios@startuprefugees.com'),
    'breakthrough',
    'Georgios gave me a completely new perspective on my business idea. His frameworks are practical and actionable!',
    25, 5, 10, 5
  ),
  -- Mia feedback: Encouraging
  (
    (SELECT id FROM sessions WHERE seeker_id = 'ee076086-a712-4faf-b34b-3ba44a5005d1' AND coach_id = (SELECT id FROM coaches WHERE email = 'mia@startuprefugees.com') AND status = 'completed'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    (SELECT id FROM coaches WHERE email = 'mia@startuprefugees.com'),
    'encouraging',
    'Mia helped me understand funding options clearly. Very supportive and knowledgeable!',
    0, 15, 0, 5
  );

-- ============================================
-- ADD MORE SESSIONS AND REVIEWS FROM NADA
-- ============================================

INSERT INTO public.sessions (coach_id, seeker_id, session_type, session_date, duration_minutes, status, notes)
VALUES
  -- Safaa (Guiding Light - Career Coaching)
  (
    (SELECT id FROM coaches WHERE email = 'safaa@startuprefugees.com'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    'Confidence Building',
    NOW() - INTERVAL '3 days',
    60,
    'completed',
    'Building interview confidence and overcoming anxiety'
  ),
  -- Uladzimir (Rookie Coach - Career Coaching)
  (
    (SELECT id FROM coaches WHERE email = 'uladzimir@startuprefugees.com'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    'Resume & Interview',
    NOW() - INTERVAL '1 day',
    60,
    'completed',
    'CV review and formatting for Finnish job market'
  );

-- Add feedback for Nada's new sessions
INSERT INTO public.session_feedback (session_id, seeker_id, coach_id, vibe, reflection, impact_karma_awarded, connection_karma_awarded, wisdom_karma_awarded, engagement_xp_awarded)
VALUES
  -- Safaa feedback: Focus
  (
    (SELECT id FROM sessions WHERE seeker_id = '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a' AND coach_id = (SELECT id FROM coaches WHERE email = 'safaa@startuprefugees.com') AND status = 'completed'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    (SELECT id FROM coaches WHERE email = 'safaa@startuprefugees.com'),
    'focus',
    'Safaa helped me focus on my strengths and prepare concrete examples for interviews.',
    15, 5, 0, 5
  ),
  -- Uladzimir feedback: Encouraging
  (
    (SELECT id FROM sessions WHERE seeker_id = '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a' AND coach_id = (SELECT id FROM coaches WHERE email = 'uladzimir@startuprefugees.com') AND status = 'completed'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    (SELECT id FROM coaches WHERE email = 'uladzimir@startuprefugees.com'),
    'encouraging',
    'Very patient and thorough! Uladzimir helped me adapt my CV to Finnish standards.',
    0, 15, 0, 5
  );

-- ============================================
-- CREATE ADDITIONAL ANONYMOUS REVIEWS
-- ============================================
-- These will appear as anonymous reviews but add social proof to coaches

-- Create more historical sessions and feedback to populate reviews for remaining coaches
-- We'll use Shayan and Nada's IDs but with older dates to simulate past activity

-- Add more reviews for top coaches to show social proof
INSERT INTO public.sessions (coach_id, seeker_id, session_type, session_date, duration_minutes, status, notes)
VALUES
  -- Sara (Career Sage) - additional review
  (
    (SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    'Job Search Strategy',
    NOW() - INTERVAL '10 days',
    60,
    'completed',
    'Strategic job search planning and networking tips'
  ),
  -- Mustafa - another review
  (
    (SELECT id FROM coaches WHERE email = 'mustafa@startuprefugees.com'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    'Industry Insight',
    NOW() - INTERVAL '7 days',
    60,
    'completed',
    'Tech industry insights and career pathways discussion'
  ),
  -- Georgios - additional review
  (
    (SELECT id FROM coaches WHERE email = 'georgios@startuprefugees.com'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    'Business Planning',
    NOW() - INTERVAL '12 days',
    60,
    'completed',
    'Business model canvas and market research strategies'
  ),
  -- Oleksandr - additional review
  (
    (SELECT id FROM coaches WHERE email = 'oleksandr@startuprefugees.com'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    'Resume & Interview',
    NOW() - INTERVAL '6 days',
    60,
    'completed',
    'Mock interview and feedback on presentation skills'
  ),
  -- Rima - additional review from Shayan
  (
    (SELECT id FROM coaches WHERE email = 'rima@startuprefugees.com'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    'Job Search Strategy',
    NOW() - INTERVAL '35 days',
    60,
    'completed',
    'Networking strategies and hidden job market access'
  ),
  -- Alina - review from Shayan
  (
    (SELECT id FROM coaches WHERE email = 'alina@startuprefugees.com'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    'Career Transition',
    NOW() - INTERVAL '28 days',
    60,
    'completed',
    'Career change discussion and transferable skills identification'
  ),
  -- Arkan - review from Shayan
  (
    (SELECT id FROM coaches WHERE email = 'arkan@startuprefugees.com'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    'Skill Development',
    NOW() - INTERVAL '20 days',
    60,
    'completed',
    'Identifying skill gaps and creating development plan'
  ),
  -- Lejla - review from Nada
  (
    (SELECT id FROM coaches WHERE email = 'lejla@startuprefugees.com'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    'Skill Development',
    NOW() - INTERVAL '8 days',
    60,
    'completed',
    'Professional skills assessment and growth roadmap'
  ),
  -- Muntaser - review from Shayan
  (
    (SELECT id FROM coaches WHERE email = 'muntaser@startuprefugees.com'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    'Business Planning',
    NOW() - INTERVAL '40 days',
    60,
    'completed',
    'Early-stage startup planning and market validation'
  ),
  -- Yelizaveta - review from Nada
  (
    (SELECT id FROM coaches WHERE email = 'yelizaveta@startuprefugees.com'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    'Career Transition',
    NOW() - INTERVAL '4 days',
    60,
    'completed',
    'Career options assessment and decision making framework'
  );

-- Add feedback for all these additional sessions
INSERT INTO public.session_feedback (session_id, seeker_id, coach_id, vibe, reflection, impact_karma_awarded, connection_karma_awarded, wisdom_karma_awarded, engagement_xp_awarded)
VALUES
  -- Sara additional review from Nada: Breakthrough
  (
    (SELECT id FROM sessions WHERE seeker_id = '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a' AND coach_id = (SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com') AND status = 'completed'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    (SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com'),
    'breakthrough',
    'Sara is amazing! She helped me identify my unique strengths and how to present them to employers. Game-changer!',
    25, 5, 10, 5
  ),
  -- Mustafa additional review from Nada: Focus
  (
    (SELECT id FROM sessions WHERE seeker_id = '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a' AND coach_id = (SELECT id FROM coaches WHERE email = 'mustafa@startuprefugees.com') AND status = 'completed'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    (SELECT id FROM coaches WHERE email = 'mustafa@startuprefugees.com'),
    'focus',
    'Very knowledgeable about the tech industry. Mustafa gave me concrete steps to follow. Highly recommend!',
    15, 5, 0, 5
  ),
  -- Georgios additional review from Nada: Encouraging
  (
    (SELECT id FROM sessions WHERE seeker_id = '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a' AND coach_id = (SELECT id FROM coaches WHERE email = 'georgios@startuprefugees.com') AND status = 'completed'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    (SELECT id FROM coaches WHERE email = 'georgios@startuprefugees.com'),
    'encouraging',
    'Georgios made entrepreneurship feel achievable. His energy is contagious and his advice is gold!',
    0, 15, 0, 5
  ),
  -- Oleksandr additional review from Nada: Focus
  (
    (SELECT id FROM sessions WHERE seeker_id = '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a' AND coach_id = (SELECT id FROM coaches WHERE email = 'oleksandr@startuprefugees.com') AND status = 'completed'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    (SELECT id FROM coaches WHERE email = 'oleksandr@startuprefugees.com'),
    'focus',
    'Great mock interview session! Oleksandr pointed out areas I needed to improve and we practiced until I felt confident.',
    15, 5, 0, 5
  ),
  -- Rima review from Shayan: Encouraging
  (
    (SELECT id FROM sessions WHERE seeker_id = 'ee076086-a712-4faf-b34b-3ba44a5005d1' AND coach_id = (SELECT id FROM coaches WHERE email = 'rima@startuprefugees.com') AND status = 'completed'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    (SELECT id FROM coaches WHERE email = 'rima@startuprefugees.com'),
    'encouraging',
    'Rima understands the Northern Finland job market really well. She connected me with the right resources and people!',
    0, 15, 0, 5
  ),
  -- Alina review from Shayan: Focus
  (
    (SELECT id FROM sessions WHERE seeker_id = 'ee076086-a712-4faf-b34b-3ba44a5005d1' AND coach_id = (SELECT id FROM coaches WHERE email = 'alina@startuprefugees.com') AND status = 'completed'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    (SELECT id FROM coaches WHERE email = 'alina@startuprefugees.com'),
    'focus',
    'Very structured approach. Alina helped me create a clear action plan with deadlines. Just what I needed!',
    15, 5, 0, 5
  ),
  -- Arkan review from Shayan: Breakthrough
  (
    (SELECT id FROM sessions WHERE seeker_id = 'ee076086-a712-4faf-b34b-3ba44a5005d1' AND coach_id = (SELECT id FROM coaches WHERE email = 'arkan@startuprefugees.com') AND status = 'completed'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    (SELECT id FROM coaches WHERE email = 'arkan@startuprefugees.com'),
    'breakthrough',
    'Arkan helped me identify skill gaps I didn''t even know I had. The development roadmap we created is perfect!',
    25, 5, 10, 5
  ),
  -- Lejla review from Nada: Encouraging
  (
    (SELECT id FROM sessions WHERE seeker_id = '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a' AND coach_id = (SELECT id FROM coaches WHERE email = 'lejla@startuprefugees.com') AND status = 'completed'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    (SELECT id FROM coaches WHERE email = 'lejla@startuprefugees.com'),
    'encouraging',
    'Lejla is incredibly supportive. She helped me see my potential and create a realistic skill development plan.',
    0, 15, 0, 5
  ),
  -- Muntaser review from Shayan: Okay
  (
    (SELECT id FROM sessions WHERE seeker_id = 'ee076086-a712-4faf-b34b-3ba44a5005d1' AND coach_id = (SELECT id FROM coaches WHERE email = 'muntaser@startuprefugees.com') AND status = 'completed'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    (SELECT id FROM coaches WHERE email = 'muntaser@startuprefugees.com'),
    'okay',
    'Good session overall. Covered business basics but I was hoping for more specific guidance on my industry.',
    0, 0, 0, 5
  ),
  -- Yelizaveta review from Nada: Encouraging
  (
    (SELECT id FROM sessions WHERE seeker_id = '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a' AND coach_id = (SELECT id FROM coaches WHERE email = 'yelizaveta@startuprefugees.com') AND status = 'completed'),
    '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a',
    (SELECT id FROM coaches WHERE email = 'yelizaveta@startuprefugees.com'),
    'encouraging',
    'Yelizaveta provided a balanced perspective on employment vs entrepreneurship. Very helpful for my career decision!',
    0, 15, 0, 5
  );

-- ============================================
-- ADD SOME ADDITIONAL REVIEWS TO TOP COACHES
-- ============================================
-- Using alternating users to show variety

-- Sara - one more review from Shayan (she's popular!)
INSERT INTO public.sessions (coach_id, seeker_id, session_type, session_date, duration_minutes, status, notes)
VALUES
  (
    (SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    'Interview Preparation',
    NOW() - INTERVAL '18 days',
    60,
    'completed',
    'Final interview prep before big interview with target company'
  );

INSERT INTO public.session_feedback (session_id, seeker_id, coach_id, vibe, reflection, impact_karma_awarded, connection_karma_awarded, wisdom_karma_awarded, engagement_xp_awarded)
VALUES
  (
    (SELECT id FROM sessions WHERE seeker_id = 'ee076086-a712-4faf-b34b-3ba44a5005d1' AND coach_id = (SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com') AND status = 'completed' AND session_type = 'Interview Preparation'),
    'ee076086-a712-4faf-b34b-3ba44a5005d1',
    (SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com'),
    'breakthrough',
    'The mock interview with Sara was intense but incredibly valuable. I got the job! Thank you Sara! 🎉',
    25, 5, 10, 5
  );

-- ============================================
-- VERIFY RESULTS
-- ============================================

-- Check reviews per coach
SELECT 
  c.name,
  c.type,
  c.level,
  c.total_karma,
  COUNT(sf.id) as review_count,
  STRING_AGG(DISTINCT sf.vibe, ', ') as vibes_received
FROM coaches c
LEFT JOIN session_feedback sf ON sf.coach_id = c.id
GROUP BY c.id, c.name, c.type, c.level, c.total_karma
ORDER BY c.total_karma DESC;

-- View all reviews with details
SELECT 
  c.name as coach_name,
  up.full_name as reviewer_name,
  sf.vibe,
  sf.reflection,
  s.session_date,
  s.session_type
FROM session_feedback sf
JOIN coaches c ON c.id = sf.coach_id
JOIN user_profiles up ON up.user_id = sf.seeker_id
JOIN sessions s ON s.id = sf.session_id
ORDER BY sf.created_at DESC;

-- Updated seeker stats (should show increased sessions and karma)
SELECT 
  full_name,
  seeker_karma,
  seeker_level,
  sessions_attended,
  reflections_given
FROM user_profiles
WHERE user_id IN ('ee076086-a712-4faf-b34b-3ba44a5005d1', '5be15e37-07f8-43ae-af2b-edfbaaa6ed5a')
ORDER BY seeker_karma DESC;

-- Expected:
-- Shayan: ~350 karma (10 sessions × 35), sessions_attended = 10, reflections = 10
-- Nada: ~175 karma (5 sessions × 35), sessions_attended = 5, reflections = 5

