INSERT INTO orphanages (
  name, slug, address, area, city,
  latitude, longitude,
  is_registered, registration_number, registration_body,
  org_type, children_count, age_range, gender_served,
  contact_name, contact_phone, contact_email, website,
  accepts_donations, donation_details,
  accepts_volunteers, volunteer_details,
  uraan_visited, visit_count, last_visited_at,
  is_verified, verified_by, verified_at,
  notes
) VALUES

-- 1. Visited NGO, registered, donations + volunteers
(
  'Dar-ul-Shafqat Orphanage', 'dar-ul-shafqat',
  '14-B, Wahdat Road', 'Gulberg', 'Lahore',
  31.5120700, 74.3220400,
  TRUE, 'SWD-2019-0041', 'Social Welfare Department',
  'ngo', 80, '4–17 years', 'both',
  'Abdul Rehman', '+92-321-4001234', 'info@darulshafqat.org', NULL,
  TRUE, 'Bank transfer or in-kind (clothes, food, books)',
  TRUE, 'Workshops on weekends; contact admin to schedule',
  TRUE, 3, '2025-11-15',
  TRUE, 'Uraan Team', NOW(),
  'Long-standing partner. Very cooperative management.'
),

-- 2. Visited government home, registered, no volunteers
(
  'Punjab Government Children Home', 'punjab-govt-children-home',
  'Near Services Hospital, Jail Road', 'Shadman', 'Lahore',
  31.5280000, 74.3070000,
  TRUE, 'GOVT-LAH-0012', 'Punjab Social Protection Authority',
  'government', 120, '5–18 years', 'both',
  'Dr. Sadia Iqbal', '+92-42-35761100', NULL, NULL,
  TRUE, 'Government-regulated donations only; contact district office',
  FALSE, NULL,
  TRUE, 1, '2025-09-08',
  TRUE, 'Uraan Team', NOW(),
  'Formal government institution. Prior approval required for visits.'
),

-- 3. Visited religious org, unregistered, accepts volunteers
(
  'Al-Noor Islamic Orphanage', 'al-noor-islamic-orphanage',
  'Street 7, Samnabad Colony', 'Samanabad', 'Lahore',
  31.5380000, 74.2990000,
  FALSE, NULL, NULL,
  'religious', 45, '3–14 years', 'male',
  'Maulana Yusuf Ali', '+92-300-9876543', NULL, NULL,
  TRUE, 'Cash/Zakat/Sadqah accepted',
  TRUE, 'Quran teaching volunteers especially needed on Fridays',
  TRUE, 2, '2025-12-01',
  FALSE, NULL, NULL,
  'Operates from mosque premises. Simple setup but very active.'
),

-- 4. Not yet visited, NGO, registered, both
(
  'Hope Foundation Shelter', 'hope-foundation-shelter',
  '93-C, Phase 5 DHA', 'DHA', 'Lahore',
  31.4780000, 74.3890000,
  TRUE, 'SECP-NPO-2021-887', 'SECP',
  'ngo', 35, '6–16 years', 'both',
  'Ms. Nadia Tariq', '+92-333-5550099', 'admin@hopefoundation.pk', 'https://hopefoundation.pk',
  TRUE, 'Online donations via JazzCash / Easypaisa',
  TRUE, 'Graduate students for tutoring (Mon–Wed evenings)',
  FALSE, 0, NULL,
  FALSE, NULL, NULL,
  'Found via partner referral. Needs a visit scheduled.'
),

-- 5. Not yet visited, volunteer org, unregistered
(
  'Roshan Mustaqbil Trust', 'roshan-mustaqbil-trust',
  'Block C, Model Town Extension', 'Model Town', 'Lahore',
  31.4820000, 74.3290000,
  FALSE, NULL, NULL,
  'volunteer', 22, '5–15 years', 'both',
  'Hassan Raza', '+92-311-1234567', NULL, NULL,
  FALSE, NULL,
  TRUE, 'Art and craft, sports, computer literacy volunteers welcome',
  FALSE, 0, NULL,
  FALSE, NULL, NULL,
  'Run entirely by UET alumni volunteers.'
),

-- 6. Visited NGO, registered, female only
(
  'Kiran Girls Welfare Home', 'kiran-girls-welfare-home',
  '21 Liaquat Road, Garhi Shahu', 'Garhi Shahu', 'Lahore',
  31.5540000, 74.3360000,
  TRUE, 'SWD-2015-0018', 'Social Welfare Department',
  'ngo', 60, '4–18 years', 'female',
  'Mrs. Rukhsana Begum', '+92-42-37645200', 'kiran.welfare@gmail.com', NULL,
  TRUE, 'Clothes, shoes, stationery and food items accepted',
  TRUE, 'Female volunteers only; tutoring and vocational skills',
  TRUE, 4, '2026-01-20',
  TRUE, 'Uraan Team', NOW(),
  'Visited 4 times. Strong relationship. Most recent: Calligraphy workshop Jan 2026.'
),

-- 7. Not yet visited, other org, unregistered
(
  'Umeed-e-Nau Shelter', 'umeed-e-nau-shelter',
  'Near Chungi Amar Sadhu, Multan Road', 'Township', 'Lahore',
  31.4650000, 74.2860000,
  FALSE, NULL, NULL,
  'other', 18, '2–12 years', 'both',
  'Bilal Ahmed', '+92-346-8887766', NULL, NULL,
  TRUE, 'Food and milk items needed monthly',
  FALSE, NULL,
  FALSE, 0, NULL,
  FALSE, NULL, NULL,
  'Small community-funded shelter. Contact unverified — needs field visit.'
),

-- 8. Visited NGO, registered, accepts donations only
(
  'Faran Welfare Trust', 'faran-welfare-trust',
  'Plot 3-A, Iqbal Town Near Canal', 'Iqbal Town', 'Lahore',
  31.5060000, 74.2980000,
  TRUE, 'SWD-2017-0066', 'Social Welfare Department',
  'ngo', 55, '3–16 years', 'both',
  'Zubair Hussain', '+92-321-7778889', 'faran.trust@yahoo.com', NULL,
  TRUE, 'Ration packs, school bags, monthly cash sponsorships',
  FALSE, NULL,
  TRUE, 5, '2026-02-14',
  TRUE, 'Uraan Team', NOW(),
  'Most visited orphanage in our records. Excellent records maintenance.'
);