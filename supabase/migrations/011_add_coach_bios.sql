-- ============================================
-- ADD REALISTIC BIOS FOR ALL COACHES
-- ============================================

-- Career Sage
UPDATE coaches
SET bio = 'With over a decade of experience in recruitment and career development, I specialize in helping job seekers land their dream roles in Finland''s competitive job market. I''ve successfully guided 150+ individuals through career transitions, CV optimization, and interview preparation. My approach combines practical strategies with empathetic support to build your confidence and unlock your potential.'
WHERE email = 'sara@startuprefugees.com';

-- Mentor Legends
UPDATE coaches
SET bio = 'As a Career Coach and IT Specialist, I bridge the gap between technical skills and career success. With a background in software development and recruitment, I help tech professionals navigate career transitions, optimize their LinkedIn profiles, and master technical interviews. My hands-on approach ensures you''re not just job-ready, but career-ready.'
WHERE email = 'mustafa@startuprefugees.com';

UPDATE coaches
SET bio = 'Leading entrepreneurship initiatives in Southern Finland, I''ve helped launch and scale over 50 startups. My expertise spans business planning, funding strategies, and market validation. Whether you''re just starting or scaling up, I provide practical frameworks and connections to turn your entrepreneurial vision into reality. Let''s build something amazing together!'
WHERE email = 'georgios@startuprefugees.com';

-- Career Alchemists
UPDATE coaches
SET bio = 'Ukrainian by origin, Finnish by choice, I understand the unique challenges of building a career in a new country. With experience across multiple industries and languages, I help job seekers identify their strengths, craft compelling career narratives, and navigate the Finnish job market with confidence. Your success is my mission.'
WHERE email = 'oleksandr@startuprefugees.com';

UPDATE coaches
SET bio = 'Based in Northern Finland, I specialize in connecting diverse talent with opportunities across the region. My multicultural background and extensive recruitment experience help me understand both employer needs and candidate aspirations. I''m passionate about creating meaningful career matches that benefit everyone involved.'
WHERE email = 'rima@startuprefugees.com';

UPDATE coaches
SET bio = 'As a Senior Specialist in Entrepreneurship, I focus on helping aspiring entrepreneurs validate ideas, build sustainable business models, and access funding. My approach combines strategic thinking with practical action steps. I believe every great business starts with a clear vision and solid execution – let me help you get there.'
WHERE email = 'mia@startuprefugees.com';

UPDATE coaches
SET bio = 'Bringing Ukrainian business expertise to Finland, I coach entrepreneurs on strategic planning, customer acquisition, and sustainable growth. My experience spans multiple industries and markets, giving me unique insights into what works and what doesn''t. Together, we''ll create a roadmap for your business success.'
WHERE email = 'marina@startuprefugees.com';

-- Guiding Lights
UPDATE coaches
SET bio = 'Originally from Afghanistan, I''ve built my career helping others do the same. My approach to career coaching is personal and practical – we''ll work together on your CV, interview skills, and job search strategy. I understand the cultural nuances of job hunting in Finland and will ensure you''re fully prepared to succeed.'
WHERE email = 'sara.shirazi@startuprefugees.com';

UPDATE coaches
SET bio = 'With a background spanning multiple continents and languages, I bring a global perspective to career coaching in Northern Finland. I specialize in confidence building, cultural adaptation, and practical job search strategies. My goal is to help you not just find a job, but build a fulfilling career that aligns with your values and aspirations.'
WHERE email = 'safaa@startuprefugees.com';

UPDATE coaches
SET bio = 'Based in Northern Finland, I combine local market knowledge with international experience to help job seekers navigate career transitions. My coaching style is direct, supportive, and results-oriented. Whether you''re entry-level or experienced, I''ll help you identify opportunities and present yourself with confidence.'
WHERE email = 'alina@startuprefugees.com';

UPDATE coaches
SET bio = 'As Skills Development Manager, I focus on identifying skill gaps and creating personalized development plans. My approach helps you build the competencies employers actually need, not just what looks good on paper. With expertise across multiple sectors, I can guide your professional growth in meaningful directions.'
WHERE email = 'arkan@startuprefugees.com';

-- Rookie Coaches
UPDATE coaches
SET bio = 'Originally from Belarus, I understand the journey of building a professional life in a new country. My career coaching focuses on practical steps and achievable goals. I work with job seekers to identify their unique value propositions and present them effectively to Finnish employers. Let''s take your career to the next level, one step at a time.'
WHERE email = 'uladzimir@startuprefugees.com';

UPDATE coaches
SET bio = 'With a multilingual background and experience across the Balkans and Finland, I specialize in skills development for diverse professionals. My coaching helps you identify transferable skills, acquire new competencies, and position yourself for growth opportunities. Together, we''ll create a personalized roadmap for your professional development.'
WHERE email = 'lejla@startuprefugees.com';

UPDATE coaches
SET bio = 'Leading entrepreneurship initiatives in Northern Finland, I help aspiring business owners turn ideas into viable ventures. My focus is on practical business planning, local market understanding, and building the right networks. Whether you''re just exploring entrepreneurship or ready to launch, I''m here to guide you through the process.'
WHERE email = 'muntaser@startuprefugees.com';

UPDATE coaches
SET bio = 'As both a Career Coach and Business Coach, I offer a unique dual perspective on professional development. Whether you''re seeking employment or considering entrepreneurship, I help you assess options, develop skills, and make informed decisions about your future. My coaching is practical, strategic, and tailored to your specific situation and goals.'
WHERE email = 'yelizaveta@startuprefugees.com';

-- Verify bios added
SELECT 
  name,
  type,
  CASE 
    WHEN bio IS NULL THEN '❌ No bio'
    WHEN LENGTH(bio) < 50 THEN '⚠️ Short bio'
    ELSE '✅ Bio added'
  END as bio_status,
  LENGTH(bio) as bio_length
FROM coaches
ORDER BY total_karma DESC;

