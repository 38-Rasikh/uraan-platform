-- =============================================================================
-- Uraan Platform — Mock Data for Development & Testing
-- Migration: 901_orphanages_mock_data.sql
--
-- Insertion order:
--   1. orphanages  (no visit tracking fields — trigger handles them)
--   2. projects    (needed before visits for FK references)
--   3. team_members
--   4. visits      (trigger fires → updates orphanage.visit_count / uraan_visited)
--
-- All UUIDs are fixed so this file is idempotent via ON CONFLICT DO NOTHING.
-- =============================================================================

-- ── 1. ORPHANAGES ─────────────────────────────────────────────────────────────

INSERT INTO orphanages (
  id, name, slug, address, area, city,
  latitude, longitude,
  is_registered, registration_number, registration_body,
  org_type, children_count, age_range, gender_served,
  contact_name, contact_phone, contact_email, website,
  accepts_donations, donation_details,
  accepts_volunteers, volunteer_details,
  is_verified, verified_by, verified_at,
  notes, is_active
) VALUES

-- 1. Edhi Foundation Children Home — verified, high-traffic
(
  'a1000000-0000-0000-0000-000000000001',
  'Edhi Foundation Children Home',
  'edhi-foundation-children-home-gulberg',
  '3-A, Main Gulberg Road, Gulberg III',
  'Gulberg',  'Lahore',
  31.5189,    74.3427,
  TRUE,  'SWD-LHR-0012', 'Punjab Social Welfare Department',
  'ngo',  74,  '0–16',  'both',
  'Abdul Sattar Edhi (Manager)', '+92-42-35761717', 'lahore@edhi.org', 'https://edhi.org',
  TRUE,  'Donations accepted via bank transfer and walk-ins',
  TRUE,  'Weekend volunteers welcome, min 4 hr commitment',
  TRUE,  'Uraan Team', '2024-11-15 10:00:00+05',
  'One of the largest and most organised children homes in Lahore. Well-maintained facilities.',
  TRUE
),

-- 2. SOS Children''s Village Lahore — verified, registered
(
  'a1000000-0000-0000-0000-000000000002',
  'SOS Children''s Village Lahore',
  'sos-childrens-village-lahore',
  'Plot 3, Street 5, DHA Phase 2',
  'Defence',  'Lahore',
  31.4750,    74.4010,
  TRUE,  'NGO-DHA-00231', 'SECP',
  'ngo',  112, '3–18',  'both',
  'Nadia Hussain', '+92-42-37130011', 'lahore@sos-pakistan.org', 'https://sos-pakistan.org',
  TRUE,  'Online donation portal available on website',
  FALSE, NULL,
  TRUE,  'Uraan Team', '2024-10-20 14:00:00+05',
  'International NGO with structured programmes. Has a school on-premises.',
  TRUE
),

-- 3. Dar ul Atfal Orphan Care — partially verified
(
  'a1000000-0000-0000-0000-000000000003',
  'Dar ul Atfal Orphan Care',
  'dar-ul-atfal-orphan-care-model-town',
  '14-B, Model Town Extension',
  'Model Town', 'Lahore',
  31.4803,    74.3181,
  TRUE,  'SWD-LHR-0088', 'Punjab Social Welfare Department',
  'ngo',  45,  '4–14',  'both',
  'Tahir Mehmood', '+92-312-4501234', NULL, NULL,
  TRUE,  'Monthly sponsor a child programme — PKR 3,000/month',
  TRUE,  'Tutors needed on weekday evenings',
  FALSE, NULL, NULL,
  'Relatively new but well-organised. Needs reading material donations.',
  TRUE
),

-- 4. Al-Khidmat Orphan Care Centre — verified
(
  'a1000000-0000-0000-0000-000000000004',
  'Al-Khidmat Orphan Care Centre',
  'al-khidmat-orphan-care-johar-town',
  'Block P, Johar Town',
  'Johar Town', 'Lahore',
  31.4697,    74.2728,
  TRUE,  'JI-LHR-0045', 'Al-Khidmat Foundation',
  'ngo',  88,  '0–17',  'both',
  'Khalid Mahmood Sargodha', '+92-300-4109876', 'alkhidmat.jt@gmail.com', 'https://alkhidmat.org',
  TRUE,  'Zakat, Sadqa, and Fitrana accepted',
  TRUE,  'Weekend tutoring, sports coaching, and vocational training help needed',
  TRUE,  'Uraan Team', '2025-01-08 11:00:00+05',
  'Al-Khidmat Foundation''s flagship Lahore facility. Excellent record-keeping observed.',
  TRUE
),

-- 5. Saylani Welfare Children Centre
(
  'a1000000-0000-0000-0000-000000000005',
  'Saylani Welfare Children Centre',
  'saylani-welfare-children-centre-faisal-town',
  'Bhatti Gate Chowk, Faisal Town',
  'Faisal Town', 'Lahore',
  31.5090,    74.3028,
  TRUE,  'SWD-LHR-0120', 'Punjab Social Welfare Department',
  'ngo',  60,  '5–15',  'male',
  'Bashir Ahmad', '+92-321-4670023', NULL, 'https://saylaniwelfare.com',
  TRUE,  'Bank transfers and Easypaisa accepted',
  FALSE, NULL,
  FALSE, NULL, NULL,
  'Boys only. Provides vocational training (auto mechanic, electric work) to older children.',
  TRUE
),

-- 6. Punjab Government Child Protection Bureau — NOT visited yet
(
  'a1000000-0000-0000-0000-000000000006',
  'Punjab Government Child Protection Bureau Home',
  'punjab-cpb-home-anarkali',
  'Near Anarkali Courts, Old Anarkali',
  'Anarkali', 'Lahore',
  31.5712,    74.3239,
  TRUE,  'CPB-PB-001', 'Government of Punjab',
  'government', 130, '0–18', 'both',
  'Deputy Director (CPB)', '+92-42-37314200', 'cpb@punjab.gov.pk', 'https://cpb.punjab.gov.pk',
  FALSE, NULL,
  FALSE, NULL,
  FALSE, NULL, NULL,
  'Government-run emergency shelter. External volunteers require formal MoU.',
  TRUE
),

-- 7. Jamia Dar ul Uloom — religious org, NOT visited
(
  'a1000000-0000-0000-0000-000000000007',
  'Jamia Dar ul Uloom Orphan Wing',
  'jamia-dar-ul-uloom-orphan-wing-data-ganj-bakhsh',
  'Near Data Darbar, Data Ganj Bakhsh Road',
  'Walled City', 'Lahore',
  31.5769,    74.3080,
  FALSE, NULL, NULL,
  'religious', 35, '7–18', 'male',
  'Qari Abdur Rehman', '+92-333-4120099', NULL, NULL,
  TRUE,  'Cash donations welcomed on-site',
  FALSE, NULL,
  FALSE, NULL, NULL,
  'Religious seminary with attached orphan wing. Currently unregistered.',
  TRUE
),

-- 8. Rozgar Foundation Children Shelter — visited
(
  'a1000000-0000-0000-0000-000000000008',
  'Rozgar Foundation Children Shelter',
  'rozgar-foundation-children-shelter-shadman',
  'House 7, Street 12, Shadman Colony',
  'Shadman', 'Lahore',
  31.5283,    74.3289,
  TRUE,  'SWD-LHR-0199', 'Punjab Social Welfare Department',
  'ngo', 28,  '6–16', 'both',
  'Sadia Farooq', '+92-311-4560087', 'rozgar.shelter@gmail.com', NULL,
  TRUE,  'Clothes, books and food items accepted',
  TRUE,  'Tutors and career counsellors welcome',
  FALSE, NULL, NULL,
  'Small but active centre. Very open to volunteer programmes.',
  TRUE
),

-- 9. Fatima Memorial Children Home — NOT visited
(
  'a1000000-0000-0000-0000-000000000009',
  'Fatima Memorial Children Home',
  'fatima-memorial-children-home-gulberg',
  '21-C, Gulberg II',
  'Gulberg', 'Lahore',
  31.5200,    74.3450,
  TRUE,  'SWD-LHR-0054', 'Punjab Social Welfare Department',
  'ngo', 52, '0–12', 'female',
  'Zainab Noor', '+92-300-8890011', 'fatimahome.lhr@gmail.com', NULL,
  TRUE,  'Monthly sponsorship and material donations accepted',
  FALSE, NULL,
  FALSE, NULL, NULL,
  'Girls only. Affiliated with Fatima Memorial Hospital — medical check-ups provided.',
  TRUE
),

-- 10. Al-Mustafa Welfare Children Centre — visited once
(
  'a1000000-0000-0000-0000-000000000010',
  'Al-Mustafa Welfare Children Centre',
  'al-mustafa-welfare-children-centre-garden-town',
  '3rd Floor, Al-Mustafa Plaza, Ferozepur Road',
  'Garden Town', 'Lahore',
  31.5015,    74.3338,
  TRUE,  'SWD-LHR-0211', 'Punjab Social Welfare Department',
  'ngo', 40, '2–15', 'both',
  'Hassan Raza Naqvi', '+92-345-6780099', NULL, NULL,
  FALSE, NULL,
  TRUE,  'Art, drama, and sports volunteers appreciated',
  FALSE, NULL, NULL,
  'Active community-run shelter. Enthusiastic management.',
  TRUE
)
ON CONFLICT (id) DO NOTHING;


-- ── 2. PROJECTS ──────────────────────────────────────────────────────────────

INSERT INTO projects (
  id, title, slug, tagline, description,
  date_start, date_end, duration_label,
  institutions, collaborators,
  children_reached, volunteer_count, hours_delivered,
  skills_taught, cover_image_url, gallery_urls,
  impact_metrics, is_published, sort_order
) VALUES

-- Project 1: Taleemi Safar — flagship education drive
(
  'b1000000-0000-0000-0000-000000000001',
  'Taleemi Safar',
  'taleemi-safar',
  'A month-long literacy and numeracy drive across three orphanages in Lahore.',
  'Taleemi Safar (The Learning Journey) was Uraan''s first major structured education project. '
  'Over four weekends, student volunteers from LUMS and UCP delivered interactive sessions in '
  'reading comprehension, basic mathematics, and creative writing to children aged 6–14. '
  'The project also distributed stationery kits and age-appropriate books to each participating home.',
  '2024-09-07', '2024-10-05', '4 weekends',
  ARRAY['LUMS', 'University of Central Punjab'],
  ARRAY['Alif Laila Book Bus', 'Bookgroup Pakistan'],
  119, 24, 96.0,
  ARRAY['Literacy', 'Numeracy', 'Creative Writing', 'Public Speaking'],
  NULL, ARRAY[]::TEXT[],
  '{"sessions_delivered": 12, "books_distributed": 300, "stationery_kits": 119}'::JSONB,
  TRUE, 10
),

-- Project 2: Roshni — vocational skills workshop
(
  'b1000000-0000-0000-0000-000000000002',
  'Roshni',
  'roshni',
  'A skills-building workshop series for older children entering adulthood.',
  'Roshni (Light) targeted 14–18 year olds transitioning out of orphanage care. '
  'Volunteers with professional backgrounds ran three-day workshops covering basic computer '
  'use, interview skills, and personal finance. The project was delivered in partnership with '
  'NIFT Lahore, whose final-year students provided embroidery and tailoring sessions to the girls.',
  '2024-11-01', '2024-11-03', '3 days',
  ARRAY['NIFT Lahore'],
  ARRAY['TechBridge Pakistan'],
  56, 18, 54.0,
  ARRAY['Computer Basics', 'Interview Skills', 'Personal Finance', 'Tailoring', 'Embroidery'],
  NULL, ARRAY[]::TEXT[],
  '{"workshops": 6, "certificates_issued": 38}'::JSONB,
  TRUE, 20
),

-- Project 3: Khushiyon Ka Qaafila — recreational day out (draft)
(
  'b1000000-0000-0000-0000-000000000003',
  'Khushiyon Ka Qaafila',
  'khushiyon-ka-qaafila',
  'A city-wide recreational day bringing joy and play to 200+ children.',
  'Khushiyon Ka Qaafila (Caravan of Joy) is Uraan''s annual recreational mega-event. '
  'Children from multiple orphanages are brought together for a full day of games, '
  'art activities, storytelling, and a communal meal. The 2024 edition was held at '
  'Jilani Park and drew participation from 6 partner homes.',
  '2024-12-21', '2024-12-21', '1 day',
  ARRAY['University of Engineering and Technology Lahore'],
  ARRAY['Coca-Cola Pakistan', 'Packages Mall'],
  218, 47, 141.0,
  ARRAY['Art & Craft', 'Storytelling', 'Team Sports'],
  NULL, ARRAY[]::TEXT[],
  '{"homes_participating": 6, "meals_served": 230, "activity_stations": 8}'::JSONB,
  TRUE, 30
)
ON CONFLICT (id) DO NOTHING;


-- ── 3. TEAM MEMBERS ──────────────────────────────────────────────────────────

INSERT INTO team_members (
  id, full_name, role, department, batch, bio,
  phone, linkedin_url,
  joined_date, left_date,
  is_active, is_founding_member, sort_order
) VALUES

-- Founding members
(
  'c1000000-0000-0000-0000-000000000001',
  'Ahmed Raza Malik',
  'Co-Founder & President',
  'Leadership',
  'LUMS 2021',
  'Ahmed co-founded Uraan during his second year at LUMS after volunteering independently at local orphanages. '
  'He leads strategy, partnerships, and the annual Khushiyon Ka Qaafila event. '
  'His background is in economics and social policy.',
  '+92-300-1234567', 'https://linkedin.com/in/ahmedrazamalik',
  '2022-03-01', NULL,
  TRUE, TRUE, 1
),
(
  'c1000000-0000-0000-0000-000000000002',
  'Sara Baig',
  'Co-Founder & Head of Education',
  'Programmes',
  'LUMS 2021',
  'Sara designed Uraan''s first structured curriculum and led the Taleemi Safar project. '
  'A passionate educator, she manages all academic volunteer programmes and curriculum planning. '
  'She is currently pursuing her Masters in Education Policy.',
  '+92-345-7654321', 'https://linkedin.com/in/sarabaig92',
  '2022-03-01', NULL,
  TRUE, TRUE, 2
),

-- Active members
(
  'c1000000-0000-0000-0000-000000000003',
  'Usman Tariq',
  'Head of Operations',
  'Operations',
  'NUST 2022',
  'Usman joined Uraan through the Taleemi Safar project and quickly took over operations. '
  'He manages logistics for all visits, volunteer coordination, and data management on this platform.',
  '+92-321-9988776', 'https://linkedin.com/in/usmantariq',
  '2023-01-15', NULL,
  TRUE, FALSE, 10
),
(
  'c1000000-0000-0000-0000-000000000004',
  'Hira Fatima Khan',
  'Creative Director',
  'Communications',
  'FAST 2023',
  'Hira leads Uraan''s visual identity, social media presence, and event photography. '
  'She joined after attending Khushiyon Ka Qaafila 2023 as a guest and immediately wanted to contribute.',
  '+92-311-1122334', 'https://linkedin.com/in/hirafatimakhan',
  '2024-02-01', NULL,
  TRUE, FALSE, 20
),
(
  'c1000000-0000-0000-0000-000000000005',
  'Bilal Hassan Siddiqui',
  'Partnerships Manager',
  'Outreach',
  'IBA Karachi 2022',
  'Bilal manages corporate and institutional partnerships. He secured Uraan''s first '
  'major sponsorship for the 2024 Khushiyon Ka Qaafila from Packages Mall.',
  '+92-333-5544112', 'https://linkedin.com/in/bilalhassansiddiqui',
  '2023-06-01', NULL,
  TRUE, FALSE, 30
),

-- Alumni member
(
  'c1000000-0000-0000-0000-000000000006',
  'Mariam Siddiqui',
  'Former Head of Welfare',
  'Programmes',
  'LUMS 2020',
  'Mariam was one of Uraan''s earliest members and built the welfare assessment framework '
  'still used today for evaluating orphanage needs. She now works at a development sector NGO in Islamabad.',
  NULL, 'https://linkedin.com/in/mariamsiddiqui',
  '2022-03-01', '2024-06-30',
  FALSE, TRUE, 5
)
ON CONFLICT (id) DO NOTHING;


-- ── 4. VISITS ────────────────────────────────────────────────────────────────
-- Inserting these triggers sync_orphanage_visit_stats(), which automatically
-- updates orphanages.visit_count, uraan_visited, and last_visited_at.

INSERT INTO visits (
  id, orphanage_id, project_id,
  visit_date, duration_hours, volunteer_count,
  activities, outcomes, children_engaged,
  lead_volunteer, notes
) VALUES

-- ── Edhi Foundation (3 visits) ────────────────────────────────────────────

-- Visit 1 — Taleemi Safar week 1
(
  'd1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',  -- Edhi
  'b1000000-0000-0000-0000-000000000001',  -- Taleemi Safar
  '2024-09-07', 4.0, 8,
  ARRAY['Literacy sessions (reading comprehension)', 'Math games', 'Book distribution'],
  ARRAY['30 children enrolled in reading programme', '120 books distributed'],
  30, 'Sara Baig',
  'Excellent first session. Staff very welcoming. Whiteboard in main hall available for use.'
),
-- Visit 2 — Taleemi Safar week 3
(
  'd1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  '2024-09-21', 4.0, 6,
  ARRAY['Creative writing workshop', 'Storytelling circle', 'Stationery kit distribution'],
  ARRAY['25 children participated', '30 stationery kits given out', '5 children wrote short stories'],
  25, 'Ahmed Raza Malik',
  'Children responded very well to the creative writing format. Will repeat next visit.'
),
-- Visit 3 — Khushiyon Ka Qaafila
(
  'd1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000003',  -- Khushiyon Ka Qaafila
  '2024-12-21', 8.0, 12,
  ARRAY['Games & sports', 'Art station', 'Communal lunch', 'Storytelling'],
  ARRAY['38 children attended the Jilani Park event', 'Positive feedback from house mother'],
  38, 'Usman Tariq',
  'Children were thrilled to be taken outside. Transportation arranged via rented van.'
),

-- ── SOS Children''s Village (2 visits) ──────────────────────────────────────

-- Visit 4 — Roshni workshop
(
  'd1000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000002',  -- SOS
  'b1000000-0000-0000-0000-000000000002',  -- Roshni
  '2024-11-02', 6.0, 9,
  ARRAY['Computer basics session', 'Interview skills roleplay', 'Personal finance basics'],
  ARRAY['22 children completed computer module', '15 certificates issued'],
  22, 'Bilal Hassan Siddiqui',
  'SOS has a computer lab — we used it. Admin was very cooperative. Will invite for next year too.'
),
-- Visit 5 — Khushiyon Ka Qaafila
(
  'd1000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000002',
  'b1000000-0000-0000-0000-000000000003',
  '2024-12-21', 8.0, 14,
  ARRAY['Games & sports', 'Art station', 'Communal lunch'],
  ARRAY['45 children attended', 'Two volunteered as team captains for the day'],
  45, 'Ahmed Raza Malik',
  'Largest contingent from any single home. SOS management sent two staff to help supervise.'
),

-- ── Dar ul Atfal (1 visit) ────────────────────────────────────────────────

-- Visit 6 — Taleemi Safar week 2
(
  'd1000000-0000-0000-0000-000000000006',
  'a1000000-0000-0000-0000-000000000003',  -- Dar ul Atfal
  'b1000000-0000-0000-0000-000000000001',  -- Taleemi Safar
  '2024-09-14', 4.0, 5,
  ARRAY['Numeracy workshop', 'Flashcard games', 'Book distribution'],
  ARRAY['20 children participated', '60 books distributed'],
  20, 'Sara Baig',
  'Smaller home, very intimate session. Teacher requested follow-up visits independently.'
),

-- ── Al-Khidmat Orphan Care (2 visits) ────────────────────────────────────

-- Visit 7 — Roshni workshop (standalone — Johar Town branch)
(
  'd1000000-0000-0000-0000-000000000007',
  'a1000000-0000-0000-0000-000000000004',  -- Al-Khidmat
  'b1000000-0000-0000-0000-000000000002',  -- Roshni
  '2024-11-03', 6.0, 9,
  ARRAY['Tailoring session (NIFT volunteers)', 'Embroidery basics', 'Portfolio session'],
  ARRAY['16 girls completed tailoring module', '23 certificates issued'],
  16, 'Hira Fatima Khan',
  'NIFT volunteers were outstanding. Al-Khidmat management requested a full-week programme for 2025.'
),
-- Visit 8 — General visit / assessment
(
  'd1000000-0000-0000-0000-000000000008',
  'a1000000-0000-0000-0000-000000000004',
  NULL,
  '2025-01-08', 2.0, 3,
  ARRAY['Facility assessment', 'Needs identification', 'Management interview'],
  ARRAY['Verified registration documents', 'Identified need for science kits'],
  NULL, 'Ahmed Raza Malik',
  'Verification visit. Registration confirmed SWD-LHR-0045 issued 2019. Very transparent management.'
),

-- ── Saylani Welfare (1 visit) ────────────────────────────────────────────

-- Visit 9 — Khushiyon Ka Qaafila
(
  'd1000000-0000-0000-0000-000000000009',
  'a1000000-0000-0000-0000-000000000005',  -- Saylani
  'b1000000-0000-0000-0000-000000000003',  -- Khushiyon Ka Qaafila
  '2024-12-21', 8.0, 10,
  ARRAY['Games & sports', 'Communal lunch', 'Art station'],
  ARRAY['32 boys attended', 'Positive feedback from house father'],
  32, 'Usman Tariq',
  'Boys were very energetic. Football match was the highlight of the day.'
),

-- ── Rozgar Foundation (2 visits) ─────────────────────────────────────────

-- Visit 10 — General tutoring visit
(
  'd1000000-0000-0000-0000-000000000010',
  'a1000000-0000-0000-0000-000000000008',  -- Rozgar
  NULL,
  '2024-10-12', 3.0, 4,
  ARRAY['English tutoring', 'Career counselling (intro)', 'Resume writing basics'],
  ARRAY['14 children engaged', '6 older children expressed interest in vocational training'],
  14, 'Bilal Hassan Siddiqui',
  'Very warm reception. Small centre but staff are motivated. Good candidate for Roshni 2025.'
),
-- Visit 11 — Follow-up tutoring
(
  'd1000000-0000-0000-0000-000000000011',
  'a1000000-0000-0000-0000-000000000008',
  NULL,
  '2025-02-15', 3.0, 3,
  ARRAY['English tutoring', 'Math reinforcement', 'Reading circle'],
  ARRAY['12 children attended', 'Noticeable improvement in reading fluency'],
  12, 'Sara Baig',
  'Second visit — children already showed progress from October session. Will schedule monthly.'
),

-- ── Al-Mustafa Welfare (1 visit) ─────────────────────────────────────────

-- Visit 12 — First contact visit
(
  'd1000000-0000-0000-0000-000000000012',
  'a1000000-0000-0000-0000-000000000010',  -- Al-Mustafa
  'b1000000-0000-0000-0000-000000000003',  -- Khushiyon Ka Qaafila
  '2024-12-21', 8.0, 8,
  ARRAY['Art activities', 'Drama performance by volunteers', 'Communal lunch'],
  ARRAY['28 children attended', 'Management invited Uraan back for a full-day workshop'],
  28, 'Hira Fatima Khan',
  'Impressive management team. Centre is well-lit and spacious. Strong candidate for future projects.'
)
ON CONFLICT (id) DO NOTHING;
