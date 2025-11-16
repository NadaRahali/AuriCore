-- Insert coaches data
INSERT INTO public.coaches (name, title, region, email, phone, languages, image_url)
VALUES
  (
    'Oleksandr Puzyrnyy',
    'Career Coach',
    'Southern Finland',
    'oleksandr@startuprefugees.com',
    '+358 44 240 8261',
    ARRAY['Ukrainian', 'Russian', 'Finnish', 'English'],
    'https://startuprefugees.com/wp-content/uploads/2023/03/Startup_Refugees_portrait_Marraskuu_8015_lowres-682x1024.jpg'
  ),
  (
    'Sara Shirazi',
    'Career Coach',
    'Southern Finland',
    'sara.shirazi@startuprefugees.com',
    '+358 50 381 4576',
    ARRAY['Dari/Farsi', 'English'],
    'https://startuprefugees.com/wp-content/uploads/2024/04/20231113_Startup_Refugees_CV3724-683x1024.jpg'
  ),
  (
    'Mustafa Aal-Sahek',
    'Career Coach & IT Specialist',
    'Southern Finland',
    'mustafa@startuprefugees.com',
    '+358 41 314 4654',
    ARRAY['Arabic', 'English', 'Finnish'],
    'https://startuprefugees.com/wp-content/uploads/2023/03/Startup_Refugees_portrait_Marraskuu_7824_lowres-683x1024.jpg'
  ),
  (
    'Sara Dehdashti',
    'Recruitment Manager',
    'Southern Finland',
    'sara@startuprefugees.com',
    '+358 44 978 8025',
    ARRAY['Dari/Farsi', 'English', 'Finnish'],
    'https://startuprefugees.com/wp-content/uploads/2023/03/Startup_Refugees_portrait_Helmikuu_161_lowres-682x1024.jpg'
  ),
  (
    'Uladzimir Isachanka',
    'Career Coach',
    'Northern Finland',
    'uladzimir@startuprefugees.com',
    '+358 50 543 3755',
    ARRAY['Russian', 'Ukrainian', 'English'],
    'https://startuprefugees.com/wp-content/uploads/2023/03/2-683x1024.jpg'
  ),
  (
    'Alina Plorina',
    'Career Coach',
    'Northern Finland',
    'alina@startuprefugees.com',
    '+358 50 550 2992',
    ARRAY['Latvian', 'Russian', 'English', 'Finnish'],
    'https://startuprefugees.com/wp-content/uploads/2023/11/002.jpg'
  ),
  (
    'Rima Depo',
    'Recruitment Manager',
    'Northern Finland',
    'rima@startuprefugees.com',
    '+358 44 242 2780',
    ARRAY['French', 'Berber', 'Arabic', 'Finnish', 'English'],
    'https://startuprefugees.com/wp-content/uploads/2023/11/003.jpg'
  ),
  (
    'Safaa Sekkaki',
    'Career Coach',
    'Northern Finland',
    'safaa@startuprefugees.com',
    '+358 41 314 9685',
    ARRAY['Arabic', 'English', 'Spanish', 'French'],
    'https://startuprefugees.com/wp-content/uploads/2025/10/Myfavourite-1-576x1024.jpg'
  )
ON CONFLICT (email) DO NOTHING;

-- Verify the insert
SELECT COUNT(*) as total_coaches FROM public.coaches;

