-- Seed subtasks for 6 seeded activities (projectid = 1)
-- activityid resolved by name subquery since IDs are IDENTITY-generated
-- completed/completedat reflects each activity's seeded progress level

INSERT INTO subtask (activityid, title, duedate, completed, displayorder, completedat, createdat, updatedat) VALUES

-- ── Activity: Foundation Excavation (65% → 3 of 5 done) ──────────────────────
((SELECT activityid FROM activity WHERE name = 'Foundation Excavation' AND projectid = 1 LIMIT 1), 'Site clearance and staking',             '2026-05-08', true,  1, '2026-05-08 10:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Foundation Excavation' AND projectid = 1 LIMIT 1), 'Topsoil stripping',                       '2026-05-14', true,  2, '2026-05-14 14:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Foundation Excavation' AND projectid = 1 LIMIT 1), 'Bulk excavation to formation level',       '2026-05-25', true,  3, '2026-05-25 16:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Foundation Excavation' AND projectid = 1 LIMIT 1), 'Trench excavation to foundation depth',    '2026-06-08', false, 4, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Foundation Excavation' AND projectid = 1 LIMIT 1), 'Spoil removal and disposal',               '2026-06-15', false, 5, NULL,                  NOW(), NOW()),

-- ── Activity: Piling Work (45% → 2 of 4 done) ────────────────────────────────
((SELECT activityid FROM activity WHERE name = 'Piling Work' AND projectid = 1 LIMIT 1), 'Piling rig mobilisation and setup',      '2026-05-10', true,  1, '2026-05-10 09:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Piling Work' AND projectid = 1 LIMIT 1), 'Bore hole drilling',                     '2026-05-22', true,  2, '2026-05-22 15:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Piling Work' AND projectid = 1 LIMIT 1), 'Casing installation and reinforcement',   '2026-06-05', false, 3, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Piling Work' AND projectid = 1 LIMIT 1), 'Concrete placement in piles',             '2026-06-20', false, 4, NULL,                  NOW(), NOW()),

-- ── Activity: Rebar Installation (0% → none done) ────────────────────────────
((SELECT activityid FROM activity WHERE name = 'Rebar Installation' AND projectid = 1 LIMIT 1), 'Rebar delivery and quality inspection',  '2026-06-12', false, 1, NULL, NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Rebar Installation' AND projectid = 1 LIMIT 1), 'Cut and bend reinforcement bars',        '2026-06-17', false, 2, NULL, NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Rebar Installation' AND projectid = 1 LIMIT 1), 'Footing rebar placement and tying',      '2026-06-22', false, 3, NULL, NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Rebar Installation' AND projectid = 1 LIMIT 1), 'Column starter bars installation',       '2026-06-26', false, 4, NULL, NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Rebar Installation' AND projectid = 1 LIMIT 1), 'Pre-pour inspection and sign-off',       '2026-06-28', false, 5, NULL, NOW(), NOW()),

-- ── Activity: Concrete Pouring (100% → all done) ─────────────────────────────
((SELECT activityid FROM activity WHERE name = 'Concrete Pouring' AND projectid = 1 LIMIT 1), 'Mix design approval and batching',       '2026-05-04', true, 1, '2026-05-04 08:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Concrete Pouring' AND projectid = 1 LIMIT 1), 'Formwork inspection and sign-off',       '2026-05-08', true, 2, '2026-05-08 10:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Concrete Pouring' AND projectid = 1 LIMIT 1), 'Concrete pour and compaction',           '2026-05-12', true, 3, '2026-05-12 17:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Concrete Pouring' AND projectid = 1 LIMIT 1), 'Surface leveling and finishing',         '2026-05-14', true, 4, '2026-05-14 12:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Concrete Pouring' AND projectid = 1 LIMIT 1), 'Curing and de-shuttering',               '2026-05-20', true, 5, '2026-05-20 09:00:00', NOW(), NOW()),

-- ── Activity: Electrical Conduit (30% → 1 of 4 done) ────────────────────────
((SELECT activityid FROM activity WHERE name = 'Electrical Conduit' AND projectid = 1 LIMIT 1), 'Conduit trench excavation',              '2026-05-28', true,  1, '2026-05-28 11:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Electrical Conduit' AND projectid = 1 LIMIT 1), 'Conduit laying and jointing',            '2026-06-10', false, 2, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Electrical Conduit' AND projectid = 1 LIMIT 1), 'Draw wire installation',                 '2026-06-22', false, 3, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Electrical Conduit' AND projectid = 1 LIMIT 1), 'Sand bedding, backfill and testing',     '2026-07-05', false, 4, NULL,                  NOW(), NOW()),

-- ── Activity: Drainage Installation (55% → 2 of 4 done) ─────────────────────
((SELECT activityid FROM activity WHERE name = 'Drainage Installation' AND projectid = 1 LIMIT 1), 'Drainage trench excavation',           '2026-05-20', true,  1, '2026-05-20 10:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Drainage Installation' AND projectid = 1 LIMIT 1), 'Pipe bedding preparation',             '2026-06-01', true,  2, '2026-06-01 14:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Drainage Installation' AND projectid = 1 LIMIT 1), 'Drainage pipe laying and jointing',    '2026-06-18', false, 3, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Drainage Installation' AND projectid = 1 LIMIT 1), 'Inspection chambers and backfill',     '2026-06-30', false, 4, NULL,                  NOW(), NOW());
