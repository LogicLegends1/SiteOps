-- Seed subtasks for all 20 seeded activities (projectid = 1)
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
((SELECT activityid FROM activity WHERE name = 'Drainage Installation' AND projectid = 1 LIMIT 1), 'Inspection chambers and backfill',     '2026-06-30', false, 4, NULL,                  NOW(), NOW()),

-- ── Activity: Road Sub-base (0% → none done) ─────────────────────────────────
((SELECT activityid FROM activity WHERE name = 'Road Sub-base' AND projectid = 1 LIMIT 1), 'Subgrade preparation and proof roll',    '2026-07-01', false, 1, NULL, NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Road Sub-base' AND projectid = 1 LIMIT 1), 'Sub-base aggregate delivery',            '2026-07-05', false, 2, NULL, NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Road Sub-base' AND projectid = 1 LIMIT 1), 'Spread and grade sub-base layer',        '2026-07-10', false, 3, NULL, NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Road Sub-base' AND projectid = 1 LIMIT 1), 'Compaction and DCP testing',             '2026-07-15', false, 4, NULL, NOW(), NOW()),

-- ── Activity: Retaining Wall (70% → 3 of 4 done) ────────────────────────────
((SELECT activityid FROM activity WHERE name = 'Retaining Wall' AND projectid = 1 LIMIT 1), 'Foundation excavation and blinding',     '2026-05-15', true,  1, '2026-05-15 09:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Retaining Wall' AND projectid = 1 LIMIT 1), 'Footing reinforcement and concrete',     '2026-05-25', true,  2, '2026-05-25 16:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Retaining Wall' AND projectid = 1 LIMIT 1), 'Wall reinforcement cage assembly',       '2026-06-08', true,  3, '2026-06-08 14:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Retaining Wall' AND projectid = 1 LIMIT 1), 'Wall concrete pour and backfill',        '2026-06-22', false, 4, NULL,                  NOW(), NOW()),

-- ── Activity: Structural Backfill (100% → all done) ──────────────────────────
((SELECT activityid FROM activity WHERE name = 'Structural Backfill' AND projectid = 1 LIMIT 1), 'Backfill material approval',           '2026-05-06', true, 1, '2026-05-06 08:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Structural Backfill' AND projectid = 1 LIMIT 1), 'Layer 1 placement and compaction',     '2026-05-12', true, 2, '2026-05-12 15:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Structural Backfill' AND projectid = 1 LIMIT 1), 'Layer 2 placement and compaction',     '2026-05-18', true, 3, '2026-05-18 15:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Structural Backfill' AND projectid = 1 LIMIT 1), 'Final compaction test and sign-off',   '2026-05-25', true, 4, '2026-05-25 11:00:00', NOW(), NOW()),

-- ── Activity: Waterproofing (25% → 1 of 4 done, PAUSED) ─────────────────────
((SELECT activityid FROM activity WHERE name = 'Waterproofing' AND projectid = 1 LIMIT 1), 'Surface preparation and cleaning',       '2026-06-05', true,  1, '2026-06-05 10:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Waterproofing' AND projectid = 1 LIMIT 1), 'Primer coat application',                '2026-06-18', false, 2, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Waterproofing' AND projectid = 1 LIMIT 1), 'Waterproof membrane laying',              '2026-06-28', false, 3, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Waterproofing' AND projectid = 1 LIMIT 1), 'Lap joint sealing and flood test',       '2026-07-10', false, 4, NULL,                  NOW(), NOW()),

-- ── Activity: Utility Trenching (40% → 2 of 5 done) ─────────────────────────
((SELECT activityid FROM activity WHERE name = 'Utility Trenching' AND projectid = 1 LIMIT 1), 'Route survey and marking',             '2026-05-25', true,  1, '2026-05-25 09:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Utility Trenching' AND projectid = 1 LIMIT 1), 'Trench excavation',                    '2026-06-05', true,  2, '2026-06-05 15:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Utility Trenching' AND projectid = 1 LIMIT 1), 'Pipe and cable bedding layer',         '2026-06-15', false, 3, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Utility Trenching' AND projectid = 1 LIMIT 1), 'Utility installation and connection',  '2026-06-24', false, 4, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Utility Trenching' AND projectid = 1 LIMIT 1), 'Backfill and surface reinstatement',   '2026-07-01', false, 5, NULL,                  NOW(), NOW()),

-- ── Activity: Compaction Work (0% → none done) ───────────────────────────────
((SELECT activityid FROM activity WHERE name = 'Compaction Work' AND projectid = 1 LIMIT 1), 'Compaction equipment mobilisation',     '2026-07-07', false, 1, NULL, NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Compaction Work' AND projectid = 1 LIMIT 1), 'Subgrade layer preparation',            '2026-07-10', false, 2, NULL, NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Compaction Work' AND projectid = 1 LIMIT 1), 'Compaction passes and monitoring',      '2026-07-15', false, 3, NULL, NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Compaction Work' AND projectid = 1 LIMIT 1), 'DCP testing and engineer sign-off',     '2026-07-20', false, 4, NULL, NOW(), NOW()),

-- ── Activity: Slab Formwork (80% → 4 of 5 done) ──────────────────────────────
((SELECT activityid FROM activity WHERE name = 'Slab Formwork' AND projectid = 1 LIMIT 1), 'Prop installation and levelling',        '2026-05-22', true,  1, '2026-05-22 10:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Slab Formwork' AND projectid = 1 LIMIT 1), 'Primary beam and ledger setup',          '2026-05-28', true,  2, '2026-05-28 15:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Slab Formwork' AND projectid = 1 LIMIT 1), 'Deck board installation',                '2026-06-05', true,  3, '2026-06-05 13:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Slab Formwork' AND projectid = 1 LIMIT 1), 'Edge formwork and kickers',              '2026-06-12', true,  4, '2026-06-12 11:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Slab Formwork' AND projectid = 1 LIMIT 1), 'Formwork inspection and approval',       '2026-06-18', false, 5, NULL,                  NOW(), NOW()),

-- ── Activity: Column Reinforcement (60% → 3 of 5 done) ───────────────────────
((SELECT activityid FROM activity WHERE name = 'Column Reinforcement' AND projectid = 1 LIMIT 1), 'Column cage fabrication',           '2026-05-28', true,  1, '2026-05-28 09:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Column Reinforcement' AND projectid = 1 LIMIT 1), 'Column starter bar connection',     '2026-06-05', true,  2, '2026-06-05 14:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Column Reinforcement' AND projectid = 1 LIMIT 1), 'Vertical cage erection',            '2026-06-12', true,  3, '2026-06-12 16:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Column Reinforcement' AND projectid = 1 LIMIT 1), 'Links and tie wire installation',   '2026-06-20', false, 4, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Column Reinforcement' AND projectid = 1 LIMIT 1), 'Pre-pour structural inspection',    '2026-06-25', false, 5, NULL,                  NOW(), NOW()),

-- ── Activity: Beam Casting (0% → none done) ──────────────────────────────────
((SELECT activityid FROM activity WHERE name = 'Beam Casting' AND projectid = 1 LIMIT 1), 'Beam soffit formwork',                   '2026-07-10', false, 1, NULL, NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Beam Casting' AND projectid = 1 LIMIT 1), 'Beam reinforcement cage',                '2026-07-15', false, 2, NULL, NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Beam Casting' AND projectid = 1 LIMIT 1), 'MEP sleeves and cast-in items',          '2026-07-18', false, 3, NULL, NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Beam Casting' AND projectid = 1 LIMIT 1), 'Pre-pour inspection sign-off',           '2026-07-22', false, 4, NULL, NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Beam Casting' AND projectid = 1 LIMIT 1), 'Concrete pour and curing',               '2026-07-25', false, 5, NULL, NOW(), NOW()),

-- ── Activity: Road Formation (35% → 1 of 4 done) ────────────────────────────
((SELECT activityid FROM activity WHERE name = 'Road Formation' AND projectid = 1 LIMIT 1), 'Subgrade scarify and moisture adjust',  '2026-06-10', true,  1, '2026-06-10 10:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Road Formation' AND projectid = 1 LIMIT 1), 'Grade and shape to design levels',      '2026-06-22', false, 2, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Road Formation' AND projectid = 1 LIMIT 1), 'Compaction and proof roll',             '2026-07-01', false, 3, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Road Formation' AND projectid = 1 LIMIT 1), 'Survey check and handover',             '2026-07-08', false, 4, NULL,                  NOW(), NOW()),

-- ── Activity: Site Leveling (100% → all done) ────────────────────────────────
((SELECT activityid FROM activity WHERE name = 'Site Leveling' AND projectid = 1 LIMIT 1), 'Survey pegs and control levels',        '2026-05-02', true, 1, '2026-05-02 08:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Site Leveling' AND projectid = 1 LIMIT 1), 'Cut areas grading and shaping',         '2026-05-07', true, 2, '2026-05-07 16:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Site Leveling' AND projectid = 1 LIMIT 1), 'Fill areas placement and compaction',   '2026-05-11', true, 3, '2026-05-11 14:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Site Leveling' AND projectid = 1 LIMIT 1), 'Final levels survey and as-built',      '2026-05-15', true, 4, '2026-05-15 11:00:00', NOW(), NOW()),

-- ── Activity: Inspection & QA (90% → 4 of 5 done) ───────────────────────────
((SELECT activityid FROM activity WHERE name = 'Inspection & QA' AND projectid = 1 LIMIT 1), 'Document and drawing review',         '2026-05-20', true,  1, '2026-05-20 09:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Inspection & QA' AND projectid = 1 LIMIT 1), 'Hold point physical inspection',      '2026-05-28', true,  2, '2026-05-28 14:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Inspection & QA' AND projectid = 1 LIMIT 1), 'Test certificates and ITPs review',   '2026-06-02', true,  3, '2026-06-02 11:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Inspection & QA' AND projectid = 1 LIMIT 1), 'Defect list issue and close-out',     '2026-06-07', true,  4, '2026-06-07 15:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Inspection & QA' AND projectid = 1 LIMIT 1), 'Final sign-off and handover',         '2026-06-10', false, 5, NULL,                  NOW(), NOW()),

-- ── Activity: Haul Road Construction (50% → 2 of 4 done, PAUSED) ─────────────
((SELECT activityid FROM activity WHERE name = 'Haul Road Construction' AND projectid = 1 LIMIT 1), 'Route clearing and grubbing',   '2026-05-18', true,  1, '2026-05-18 09:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Haul Road Construction' AND projectid = 1 LIMIT 1), 'Geotextile and sub-base layer', '2026-05-28', true,  2, '2026-05-28 15:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Haul Road Construction' AND projectid = 1 LIMIT 1), 'Crushed rock surfacing layer',  '2026-06-02', false, 3, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Haul Road Construction' AND projectid = 1 LIMIT 1), 'Drainage culverts installation','2026-06-05', false, 4, NULL,                  NOW(), NOW()),

-- ── Activity: Bulk Earthwork (20% → 1 of 5 done) ────────────────────────────
((SELECT activityid FROM activity WHERE name = 'Bulk Earthwork' AND projectid = 1 LIMIT 1), 'Topsoil stripping and stockpiling',    '2026-05-30', true,  1, '2026-05-30 10:00:00', NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Bulk Earthwork' AND projectid = 1 LIMIT 1), 'Bulk cut and load',                    '2026-06-12', false, 2, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Bulk Earthwork' AND projectid = 1 LIMIT 1), 'Material haulage to fill areas',       '2026-06-22', false, 3, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Bulk Earthwork' AND projectid = 1 LIMIT 1), 'Fill placement and spreading',         '2026-07-10', false, 4, NULL,                  NOW(), NOW()),
((SELECT activityid FROM activity WHERE name = 'Bulk Earthwork' AND projectid = 1 LIMIT 1), 'Compaction and final survey',          '2026-07-30', false, 5, NULL,                  NOW(), NOW());
