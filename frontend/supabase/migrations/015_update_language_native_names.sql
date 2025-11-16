-- ============================================
-- UPDATE LANGUAGE NAMES TO NATIVE SCRIPTS
-- ============================================
-- This migration updates language names in the coaches table
-- to use their native scripts (e.g., Arabic in Arabic script)

-- Update all coaches' language arrays to use native language names
UPDATE public.coaches
SET languages = ARRAY(
  SELECT 
    CASE 
      WHEN lang = 'English' THEN 'English'
      WHEN lang = 'Finnish' THEN 'Suomi'
      WHEN lang = 'Swedish' THEN 'Svenska'
      WHEN lang = 'Arabic' THEN 'العربية'
      WHEN lang = 'French' THEN 'Français'
      WHEN lang = 'Dari/Farsi' THEN 'دری/فارسی'
      WHEN lang = 'Ukrainian' THEN 'Українська'
      WHEN lang = 'Russian' THEN 'Русский'
      WHEN lang = 'Spanish' THEN 'Español'
      WHEN lang = 'German' THEN 'Deutsch'
      WHEN lang = 'Italian' THEN 'Italiano'
      WHEN lang = 'Portuguese' THEN 'Português'
      WHEN lang = 'Chinese' THEN '中文'
      WHEN lang = 'Japanese' THEN '日本語'
      WHEN lang = 'Korean' THEN '한국어'
      WHEN lang = 'Hindi' THEN 'हिन्दी'
      WHEN lang = 'Bengali' THEN 'বাংলা'
      WHEN lang = 'Turkish' THEN 'Türkçe'
      WHEN lang = 'Vietnamese' THEN 'Tiếng Việt'
      WHEN lang = 'Thai' THEN 'ไทย'
      WHEN lang = 'Polish' THEN 'Polski'
      WHEN lang = 'Dutch' THEN 'Nederlands'
      WHEN lang = 'Greek' THEN 'Ελληνικά'
      WHEN lang = 'Hebrew' THEN 'עברית'
      WHEN lang = 'Czech' THEN 'Čeština'
      WHEN lang = 'Romanian' THEN 'Română'
      WHEN lang = 'Hungarian' THEN 'Magyar'
      WHEN lang = 'Norwegian' THEN 'Norsk'
      WHEN lang = 'Danish' THEN 'Dansk'
      WHEN lang = 'Somali' THEN 'Soomaali'
      WHEN lang = 'Kurdish' THEN 'کوردی'
      WHEN lang = 'Pashto' THEN 'پښتو'
      WHEN lang = 'Urdu' THEN 'اردو'
      ELSE lang -- Keep original if not in mapping
    END
  FROM unnest(languages) AS lang
);

-- Also update any existing user_profiles that have communication_languages saved
UPDATE public.user_profiles
SET communication_languages = ARRAY(
  SELECT 
    CASE 
      WHEN lang = 'English' THEN 'English'
      WHEN lang = 'Finnish' THEN 'Suomi'
      WHEN lang = 'Swedish' THEN 'Svenska'
      WHEN lang = 'Arabic' THEN 'العربية'
      WHEN lang = 'French' THEN 'Français'
      WHEN lang = 'Dari/Farsi' THEN 'دری/فارسی'
      WHEN lang = 'Ukrainian' THEN 'Українська'
      WHEN lang = 'Russian' THEN 'Русский'
      WHEN lang = 'Spanish' THEN 'Español'
      WHEN lang = 'German' THEN 'Deutsch'
      WHEN lang = 'Italian' THEN 'Italiano'
      WHEN lang = 'Portuguese' THEN 'Português'
      WHEN lang = 'Chinese' THEN '中文'
      WHEN lang = 'Japanese' THEN '日本語'
      WHEN lang = 'Korean' THEN '한국어'
      WHEN lang = 'Hindi' THEN 'हिन्दी'
      WHEN lang = 'Bengali' THEN 'বাংলা'
      WHEN lang = 'Turkish' THEN 'Türkçe'
      WHEN lang = 'Vietnamese' THEN 'Tiếng Việt'
      WHEN lang = 'Thai' THEN 'ไทย'
      WHEN lang = 'Polish' THEN 'Polski'
      WHEN lang = 'Dutch' THEN 'Nederlands'
      WHEN lang = 'Greek' THEN 'Ελληνικά'
      WHEN lang = 'Hebrew' THEN 'עברית'
      WHEN lang = 'Czech' THEN 'Čeština'
      WHEN lang = 'Romanian' THEN 'Română'
      WHEN lang = 'Hungarian' THEN 'Magyar'
      WHEN lang = 'Norwegian' THEN 'Norsk'
      WHEN lang = 'Danish' THEN 'Dansk'
      WHEN lang = 'Somali' THEN 'Soomaali'
      WHEN lang = 'Kurdish' THEN 'کوردی'
      WHEN lang = 'Pashto' THEN 'پښتو'
      WHEN lang = 'Urdu' THEN 'اردو'
      ELSE lang -- Keep original if not in mapping
    END
  FROM unnest(communication_languages) AS lang
)
WHERE communication_languages IS NOT NULL 
  AND array_length(communication_languages, 1) > 0;

-- Verify the changes
-- SELECT name, languages FROM public.coaches ORDER BY name;

