-- Make region nullable for coaches without specific regions
ALTER TABLE public.coaches 
ALTER COLUMN region DROP NOT NULL;

-- Insert skill_developer coaches
INSERT INTO public.coaches (name, title, email, phone, languages, image_url, type, region)
VALUES
  (
    'Arkan Aal-Owayef',
    'Skills Development Manager',
    'arkan@startuprefugees.com',
    '+358 44 242 2868',
    ARRAY['Arabic', 'Finnish', 'English'],
    'https://startuprefugees.com/wp-content/uploads/2023/04/Untitled-design-10-683x1024.png',
    'skill_developer',
    NULL
  ),
  (
    'Lejla Plecan',
    'Skills Development Specialist',
    'lejla@startuprefugees.com',
    '+358 45 7838 1663',
    ARRAY['Bosnian', 'Croatian', 'Serbian', 'English', 'Finnish'],
    'https://startuprefugees.com/wp-content/uploads/2023/04/5-683x1024.png',
    'skill_developer',
    NULL
  ),
  (
    'Yelizaveta Babina',
    'Career Coach & Business Coach',
    'yelizaveta@startuprefugees.com',
    '+358 50 394 7256',
    ARRAY['Ukrainian', 'Russian', 'English'],
    'https://startuprefugees.com/wp-content/uploads/2024/04/IMG_0790-684x1024.jpg',
    'skill_developer',
    NULL
  )
ON CONFLICT (email) DO NOTHING;

-- Insert entrepreneurship_advisor coaches
INSERT INTO public.coaches (name, title, email, phone, languages, image_url, type, region)
VALUES
  (
    'Georgios Karhu-Jopasin',
    'Head of Entrepreneurship, Southern Finland',
    'georgios@startuprefugees.com',
    '+358 50 365 7356',
    ARRAY['Finnish', 'English', 'Greek'],
    'https://startuprefugees.com/wp-content/uploads/2023/04/5-683x1024.png',
    'entrepreneurship_advisor',
    'Southern Finland'
  ),
  (
    'Muntaser Al-Hamad',
    'Senior Specialist, Entrepreneurship, Northern Finland',
    'muntaser@startuprefugees.com',
    '+358 44 236 3354',
    ARRAY['Arabic', 'English'],
    'https://startuprefugees.com/wp-content/uploads/2023/06/Untitled-design-31-683x1024.png',
    'entrepreneurship_advisor',
    'Northern Finland'
  ),
  (
    'Mia Hyvärinen',
    'Senior Specialist, Entrepreneurship, Southern Finland',
    'mia@startuprefugees.com',
    '+358 44 974 0420',
    ARRAY['Finnish', 'English'],
    'https://startuprefugees.com/wp-content/uploads/2023/03/Startup_Refugees_portrait_Marraskuu_7909_lowres-683x1024.jpg',
    'entrepreneurship_advisor',
    'Southern Finland'
  ),
  (
    'Marina Berzina',
    'Business Coach, Southern Finland',
    'marina@startuprefugees.com',
    '+358 50 306 2032',
    ARRAY['Ukrainian', 'Russian', 'English'],
    'https://startuprefugees.com/wp-content/uploads/2025/10/DSC02511-Enhanced-NR-1-629x1024.jpg',
    'entrepreneurship_advisor',
    'Southern Finland'
  )
ON CONFLICT (email) DO NOTHING;

-- Verify the total count
SELECT 
  type,
  COUNT(*) as count
FROM public.coaches
GROUP BY type
ORDER BY type;

-- Expected result:
-- entrepreneurship_advisor: 4
-- jobseeker_advisor: 8
-- skill_developer: 3
-- Total: 15 coaches

