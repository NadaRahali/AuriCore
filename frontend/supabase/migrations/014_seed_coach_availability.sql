-- ============================================
-- SEED SAMPLE COACH AVAILABILITY DATA
-- ============================================
-- Creates realistic weekly availability schedules for all coaches

-- ============================================
-- CAREER SAGE & MENTOR LEGENDS (High Activity)
-- ============================================

-- Sara Dehdashti (Career Sage) - Full week availability
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  -- Monday
  ((SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com'), 1, '09:00', '17:00', ARRAY['online', 'office', 'call'], 'Helsinki Office - Kamppi'),
  -- Tuesday
  ((SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com'), 2, '09:00', '17:00', ARRAY['online', 'office', 'call'], 'Helsinki Office - Kamppi'),
  -- Wednesday
  ((SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com'), 3, '10:00', '16:00', ARRAY['online', 'call'], NULL),
  -- Thursday
  ((SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com'), 4, '09:00', '17:00', ARRAY['online', 'office', 'call'], 'Helsinki Office - Kamppi'),
  -- Friday
  ((SELECT id FROM coaches WHERE email = 'sara@startuprefugees.com'), 5, '09:00', '15:00', ARRAY['online', 'call'], NULL);

-- Mustafa Aal-Sahek (Mentor Legend) - Tech-focused schedule
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  -- Monday
  ((SELECT id FROM coaches WHERE email = 'mustafa@startuprefugees.com'), 1, '10:00', '18:00', ARRAY['online', 'office'], 'Helsinki Office - Kalasatama'),
  -- Tuesday
  ((SELECT id FROM coaches WHERE email = 'mustafa@startuprefugees.com'), 2, '10:00', '18:00', ARRAY['online', 'office'], 'Helsinki Office - Kalasatama'),
  -- Wednesday
  ((SELECT id FROM coaches WHERE email = 'mustafa@startuprefugees.com'), 3, '13:00', '18:00', ARRAY['online'], NULL),
  -- Thursday
  ((SELECT id FROM coaches WHERE email = 'mustafa@startuprefugees.com'), 4, '10:00', '18:00', ARRAY['online', 'office'], 'Helsinki Office - Kalasatama'),
  -- Friday
  ((SELECT id FROM coaches WHERE email = 'mustafa@startuprefugees.com'), 5, '10:00', '14:00', ARRAY['online'], NULL);

-- Georgios Karhu-Jopasin (Mentor Legend) - Entrepreneurship focus
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  -- Monday
  ((SELECT id FROM coaches WHERE email = 'georgios@startuprefugees.com'), 1, '09:00', '16:00', ARRAY['online', 'office'], 'Helsinki - Maria 01'),
  -- Tuesday
  ((SELECT id FROM coaches WHERE email = 'georgios@startuprefugees.com'), 2, '09:00', '16:00', ARRAY['online', 'office'], 'Helsinki - Maria 01'),
  -- Thursday
  ((SELECT id FROM coaches WHERE email = 'georgios@startuprefugees.com'), 4, '09:00', '16:00', ARRAY['online', 'office'], 'Helsinki - Maria 01'),
  -- Friday
  ((SELECT id FROM coaches WHERE email = 'georgios@startuprefugees.com'), 5, '10:00', '14:00', ARRAY['online'], NULL);

-- ============================================
-- CAREER ALCHEMISTS (Moderate Activity)
-- ============================================

-- Oleksandr Puzyrnyy
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  ((SELECT id FROM coaches WHERE email = 'oleksandr@startuprefugees.com'), 1, '10:00', '16:00', ARRAY['online', 'call'], NULL),
  ((SELECT id FROM coaches WHERE email = 'oleksandr@startuprefugees.com'), 2, '10:00', '16:00', ARRAY['online', 'office'], 'Helsinki Office'),
  ((SELECT id FROM coaches WHERE email = 'oleksandr@startuprefugees.com'), 3, '10:00', '16:00', ARRAY['online', 'call'], NULL),
  ((SELECT id FROM coaches WHERE email = 'oleksandr@startuprefugees.com'), 4, '10:00', '16:00', ARRAY['online', 'office'], 'Helsinki Office');

-- Rima Depo (Northern Finland)
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  ((SELECT id FROM coaches WHERE email = 'rima@startuprefugees.com'), 1, '11:00', '17:00', ARRAY['online', 'office'], 'Oulu Office'),
  ((SELECT id FROM coaches WHERE email = 'rima@startuprefugees.com'), 2, '11:00', '17:00', ARRAY['online', 'call'], NULL),
  ((SELECT id FROM coaches WHERE email = 'rima@startuprefugees.com'), 4, '11:00', '17:00', ARRAY['online', 'office'], 'Oulu Office'),
  ((SELECT id FROM coaches WHERE email = 'rima@startuprefugees.com'), 5, '11:00', '15:00', ARRAY['online'], NULL);

-- Mia Hyvärinen
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  ((SELECT id FROM coaches WHERE email = 'mia@startuprefugees.com'), 2, '09:00', '15:00', ARRAY['online', 'office'], 'Helsinki - Maria 01'),
  ((SELECT id FROM coaches WHERE email = 'mia@startuprefugees.com'), 3, '09:00', '15:00', ARRAY['online', 'office'], 'Helsinki - Maria 01'),
  ((SELECT id FROM coaches WHERE email = 'mia@startuprefugees.com'), 4, '09:00', '15:00', ARRAY['online'], NULL);

-- Marina Berzina
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  ((SELECT id FROM coaches WHERE email = 'marina@startuprefugees.com'), 1, '10:00', '16:00', ARRAY['online', 'office'], 'Helsinki Office'),
  ((SELECT id FROM coaches WHERE email = 'marina@startuprefugees.com'), 3, '10:00', '16:00', ARRAY['online'], NULL),
  ((SELECT id FROM coaches WHERE email = 'marina@startuprefugees.com'), 5, '10:00', '14:00', ARRAY['online', 'call'], NULL);

-- ============================================
-- GUIDING LIGHTS (Growing Coaches)
-- ============================================

-- Sara Shirazi
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  ((SELECT id FROM coaches WHERE email = 'sara.shirazi@startuprefugees.com'), 2, '11:00', '17:00', ARRAY['online', 'office'], 'Helsinki Office'),
  ((SELECT id FROM coaches WHERE email = 'sara.shirazi@startuprefugees.com'), 3, '11:00', '17:00', ARRAY['online'], NULL),
  ((SELECT id FROM coaches WHERE email = 'sara.shirazi@startuprefugees.com'), 4, '11:00', '17:00', ARRAY['online', 'office'], 'Helsinki Office');

-- Safaa Sekkaki (Northern Finland)
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  ((SELECT id FROM coaches WHERE email = 'safaa@startuprefugees.com'), 1, '12:00', '17:00', ARRAY['online', 'call'], NULL),
  ((SELECT id FROM coaches WHERE email = 'safaa@startuprefugees.com'), 3, '12:00', '17:00', ARRAY['online', 'office'], 'Oulu Office'),
  ((SELECT id FROM coaches WHERE email = 'safaa@startuprefugees.com'), 5, '12:00', '16:00', ARRAY['online'], NULL);

-- Alina Plorina (Northern Finland)
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  ((SELECT id FROM coaches WHERE email = 'alina@startuprefugees.com'), 1, '10:00', '16:00', ARRAY['online', 'office'], 'Oulu Office'),
  ((SELECT id FROM coaches WHERE email = 'alina@startuprefugees.com'), 2, '10:00', '16:00', ARRAY['online'], NULL),
  ((SELECT id FROM coaches WHERE email = 'alina@startuprefugees.com'), 4, '10:00', '16:00', ARRAY['online', 'call'], NULL);

-- Arkan Aal-Owayef
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  ((SELECT id FROM coaches WHERE email = 'arkan@startuprefugees.com'), 2, '13:00', '18:00', ARRAY['online', 'office'], 'Office Location TBD'),
  ((SELECT id FROM coaches WHERE email = 'arkan@startuprefugees.com'), 3, '13:00', '18:00', ARRAY['online'], NULL),
  ((SELECT id FROM coaches WHERE email = 'arkan@startuprefugees.com'), 5, '13:00', '17:00', ARRAY['online', 'call'], NULL);

-- ============================================
-- ROOKIE COACHES (Limited Availability)
-- ============================================

-- Uladzimir Isachanka (Northern Finland)
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  ((SELECT id FROM coaches WHERE email = 'uladzimir@startuprefugees.com'), 2, '14:00', '18:00', ARRAY['online', 'call'], NULL),
  ((SELECT id FROM coaches WHERE email = 'uladzimir@startuprefugees.com'), 4, '14:00', '18:00', ARRAY['online', 'office'], 'Oulu Office');

-- Lejla Plecan
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  ((SELECT id FROM coaches WHERE email = 'lejla@startuprefugees.com'), 1, '13:00', '17:00', ARRAY['online'], NULL),
  ((SELECT id FROM coaches WHERE email = 'lejla@startuprefugees.com'), 3, '13:00', '17:00', ARRAY['online', 'call'], NULL);

-- Muntaser Al-Hamad (Northern Finland)
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  ((SELECT id FROM coaches WHERE email = 'muntaser@startuprefugees.com'), 2, '10:00', '14:00', ARRAY['online'], NULL),
  ((SELECT id FROM coaches WHERE email = 'muntaser@startuprefugees.com'), 4, '10:00', '14:00', ARRAY['online', 'office'], 'Oulu Office');

-- Yelizaveta Babina
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time, meeting_types, office_location)
VALUES
  ((SELECT id FROM coaches WHERE email = 'yelizaveta@startuprefugees.com'), 3, '11:00', '15:00', ARRAY['online', 'call'], NULL),
  ((SELECT id FROM coaches WHERE email = 'yelizaveta@startuprefugees.com'), 5, '11:00', '15:00', ARRAY['online'], NULL);

-- ============================================
-- VERIFY RESULTS
-- ============================================

-- Count availability slots per coach
SELECT 
  c.name,
  c.level,
  COUNT(ca.id) as availability_slots,
  STRING_AGG(
    CASE ca.day_of_week
      WHEN 0 THEN 'Sun'
      WHEN 1 THEN 'Mon'
      WHEN 2 THEN 'Tue'
      WHEN 3 THEN 'Wed'
      WHEN 4 THEN 'Thu'
      WHEN 5 THEN 'Fri'
      WHEN 6 THEN 'Sat'
    END, ', ' ORDER BY ca.day_of_week
  ) as available_days
FROM coaches c
LEFT JOIN coach_availability ca ON ca.coach_id = c.id
GROUP BY c.id, c.name, c.level
ORDER BY COUNT(ca.id) DESC;

-- View sample availability with meeting types
SELECT 
  c.name,
  CASE ca.day_of_week
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END as day,
  ca.start_time,
  ca.end_time,
  ca.meeting_types,
  ca.office_location
FROM coach_availability ca
JOIN coaches c ON c.id = ca.coach_id
WHERE c.email IN ('sara@startuprefugees.com', 'mustafa@startuprefugees.com')
ORDER BY c.name, ca.day_of_week, ca.start_time;

-- Summary by meeting type support
SELECT 
  unnest(meeting_types) as meeting_type,
  COUNT(*) as slots_supporting_this_type
FROM coach_availability
GROUP BY meeting_type
ORDER BY COUNT(*) DESC;

