-- ═══════════════════════════════════════════════════════════════════════════
-- Seed subtask log entries + photos for all COMPLETED subtasks
-- Prerequisites: seed_activities.sql, seed_subtasks.sql,
--                add_subtask_log_photos.sql
-- Images: loremflickr.com/{w}/{h}/{keyword}?lock={n}
--   Returns real Flickr photos filtered by construction keyword.
--   Same lock number = same image (consistent across runs).
-- createdby: left NULL (int4, resolves to "Site Engineer" in display)
-- Pattern: each block is a CTE that INSERTs a log entry and immediately
--          inserts 3 related photos using RETURNING logentryid.
-- ═══════════════════════════════════════════════════════════════════════════

-- helper macro used throughout:
-- actid(name) = (SELECT activityid FROM activity WHERE name='{name}' AND projectid=1 LIMIT 1)
-- stid(title, act) = (SELECT subtaskid FROM subtask WHERE title='{title}' AND activityid=actid(act) LIMIT 1)

-- ── Foundation Excavation ────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Site clearance and staking' AND activityid=(SELECT activityid FROM activity WHERE name='Foundation Excavation' AND projectid=1 LIMIT 1) LIMIT 1),
  'Site clearance and boundary staking completed. All vegetation stripped and transported to designated stockpile at SW corner. Excavation boundary marked per survey drawings.',
  NULL, 'https://loremflickr.com/800/600/excavation?lock=1', '2026-05-08 10:30:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/excavation?lock=1',  'Vegetation clearance in progress'),
  ('https://loremflickr.com/800/600/excavation?lock=2',  'Boundary pegs set by surveyor'),
  ('https://loremflickr.com/800/600/excavation?lock=3',  'Cleared site overview from north')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Topsoil stripping' AND activityid=(SELECT activityid FROM activity WHERE name='Foundation Excavation' AND projectid=1 LIMIT 1) LIMIT 1),
  'Topsoil stripped to average 250mm depth across full excavation footprint. Material stockpiled separately for future landscape reinstatement.',
  NULL, 'https://loremflickr.com/800/600/excavation?lock=4', '2026-05-14 14:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/excavation?lock=4',  'Topsoil stripping with excavator'),
  ('https://loremflickr.com/800/600/excavation?lock=5',  'Topsoil stockpile formation'),
  ('https://loremflickr.com/800/600/excavation?lock=6',  'Stripped formation surface')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Bulk excavation to formation level' AND activityid=(SELECT activityid FROM activity WHERE name='Foundation Excavation' AND projectid=1 LIMIT 1) LIMIT 1),
  'Southern half bulk excavated to 2.1m formation level. Volume approx 850m³. No groundwater encountered. Cut face stable. Northern section commences tomorrow.',
  NULL, 'https://loremflickr.com/800/600/excavation?lock=7', '2026-05-25 16:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/excavation?lock=7',  'Bulk excavation at formation level'),
  ('https://loremflickr.com/800/600/excavation?lock=8',  'Excavator at 2.1m depth'),
  ('https://loremflickr.com/800/600/excavation?lock=9',  'Cut face profile southern section')
) p(u,c);

-- ── Piling Work ──────────────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Piling rig mobilisation and setup' AND activityid=(SELECT activityid FROM activity WHERE name='Piling Work' AND projectid=1 LIMIT 1) LIMIT 1),
  'Piling rig delivered and positioned on Grid A. Access platform confirmed stable on compacted hardcore. Initial test bore to 3m confirms expected soil profile.',
  NULL, 'https://loremflickr.com/800/600/drilling,construction?lock=10', '2026-05-10 09:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/drilling,construction?lock=10', 'Piling rig positioned on Grid A'),
  ('https://loremflickr.com/800/600/drilling,construction?lock=11', 'Access platform and outrigger setup'),
  ('https://loremflickr.com/800/600/drilling,construction?lock=12', 'Initial bore log at 3m depth')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Bore hole drilling' AND activityid=(SELECT activityid FROM activity WHERE name='Piling Work' AND projectid=1 LIMIT 1) LIMIT 1),
  'Bore hole drilling complete for piles P01–P16. Founding stratum confirmed by geologist at 11.8m. All bore logs recorded and signed. Casings extracted without loss.',
  NULL, 'https://loremflickr.com/800/600/drilling,construction?lock=13', '2026-05-22 15:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/drilling,construction?lock=13', 'Drilling in progress at pile P08'),
  ('https://loremflickr.com/800/600/drilling,construction?lock=14', 'Geologist logging bore samples'),
  ('https://loremflickr.com/800/600/drilling,construction?lock=15', 'Completed bore P01–P08 row caps')
) p(u,c);

-- ── Concrete Pouring ─────────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Mix design approval and batching' AND activityid=(SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1) LIMIT 1),
  'C30/37 mix design approved by structural engineer. Trial batches completed at plant. 28-day cube results confirm 42MPa average — exceeds 37MPa characteristic strength.',
  NULL, 'https://loremflickr.com/800/600/concrete,construction?lock=16', '2026-05-04 08:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/concrete,construction?lock=16', 'Trial mix batch at batching plant'),
  ('https://loremflickr.com/800/600/concrete,construction?lock=17', 'Slump test result 110mm'),
  ('https://loremflickr.com/800/600/concrete,construction?lock=18', 'Cube samples curing in moulds')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Formwork inspection and sign-off' AND activityid=(SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1) LIMIT 1),
  'Formwork propping and edge boarding inspected. All dimensions within 10mm tolerance. Rebar cover blocks confirmed at 40mm. Pre-pour checklist signed by structural engineer.',
  NULL, 'https://loremflickr.com/800/600/formwork,concrete?lock=19', '2026-05-08 10:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/formwork,concrete?lock=19', 'Propping arrangement overview'),
  ('https://loremflickr.com/800/600/formwork,concrete?lock=20', 'Cover block placement at 40mm'),
  ('https://loremflickr.com/800/600/formwork,concrete?lock=21', 'Signed pre-pour checklist on site board')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Concrete pour and compaction' AND activityid=(SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1) LIMIT 1),
  '120m³ C30/37 poured in one continuous 6-hour operation. Vibration compaction applied at 500mm centres. Slump at truck 110mm. 6 cube pairs taken for 7/28-day testing.',
  NULL, 'https://loremflickr.com/800/600/concrete,pouring?lock=22', '2026-05-12 17:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/concrete,pouring?lock=22', 'Concrete truck discharging into pump'),
  ('https://loremflickr.com/800/600/concrete,pouring?lock=23', 'Vibration poker compaction in slab'),
  ('https://loremflickr.com/800/600/concrete,pouring?lock=24', 'Cube samples labelled at truck')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Surface leveling and finishing' AND activityid=(SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1) LIMIT 1),
  'Surface finished to power float standard. Level checked — within ±5mm of design across full area. Curing membrane sprayed immediately after finishing.',
  NULL, 'https://loremflickr.com/800/600/concrete,floor?lock=25', '2026-05-14 12:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/concrete,floor?lock=25', 'Power float finishing operation'),
  ('https://loremflickr.com/800/600/concrete,floor?lock=26', 'Level staff reading on fresh surface'),
  ('https://loremflickr.com/800/600/concrete,floor?lock=27', 'Curing membrane application')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Curing and de-shuttering' AND activityid=(SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1) LIMIT 1),
  '28-day curing period complete. De-shuttering carried out without damage. Surface quality good — minor honeycombing noted at grid C4 marked for remediation next week.',
  NULL, 'https://loremflickr.com/800/600/concrete,structure?lock=28', '2026-05-20 09:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/concrete,structure?lock=28', 'De-shuttered slab soffit'),
  ('https://loremflickr.com/800/600/concrete,structure?lock=29', 'Honeycombing defect at grid C4'),
  ('https://loremflickr.com/800/600/concrete,structure?lock=30', 'Overall slab quality overview')
) p(u,c);

-- ── Electrical Conduit ───────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Conduit trench excavation' AND activityid=(SELECT activityid FROM activity WHERE name='Electrical Conduit' AND projectid=1 LIMIT 1) LIMIT 1),
  'Trenches E1–E3 excavated to 700mm depth at 300mm width. Hand-dig within 1m of known services. Trench sides battered at 1:1. No underground conflicts encountered.',
  NULL, 'https://loremflickr.com/800/600/trench,construction?lock=31', '2026-05-28 11:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/trench,construction?lock=31', 'Trench E1 open at 700mm depth'),
  ('https://loremflickr.com/800/600/trench,construction?lock=32', 'Hand-dig zone near existing services'),
  ('https://loremflickr.com/800/600/trench,construction?lock=33', 'Trench profile with battered sides')
) p(u,c);

-- ── Drainage Installation ────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Drainage trench excavation' AND activityid=(SELECT activityid FROM activity WHERE name='Drainage Installation' AND projectid=1 LIMIT 1) LIMIT 1),
  'Main drainage trench 180m excavated with battered sides at 1:1. Timber shoring erected at road crossing CH80–CH95. Trench bottom trimmed to design level.',
  NULL, 'https://loremflickr.com/800/600/drainage,trench?lock=34', '2026-05-20 10:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/drainage,trench?lock=34', 'Drainage trench open with shoring'),
  ('https://loremflickr.com/800/600/drainage,trench?lock=35', 'Trench bottom trimmed to gradient'),
  ('https://loremflickr.com/800/600/drainage,trench?lock=36', 'Road crossing shoring detail')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Pipe bedding preparation' AND activityid=(SELECT activityid FROM activity WHERE name='Drainage Installation' AND projectid=1 LIMIT 1) LIMIT 1),
  '150mm sand bedding placed along full trench length. Gradient 1:150 set and verified with dumpy level at 10m intervals. Surface firm and even before pipe laying.',
  NULL, 'https://loremflickr.com/800/600/pipe,construction?lock=37', '2026-06-01 14:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/pipe,construction?lock=37', 'Sand bedding placed in trench'),
  ('https://loremflickr.com/800/600/pipe,construction?lock=38', 'Gradient check with dumpy level'),
  ('https://loremflickr.com/800/600/pipe,construction?lock=39', 'Bedding surface ready for pipe')
) p(u,c);

-- ── Retaining Wall ───────────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Foundation excavation and blinding' AND activityid=(SELECT activityid FROM activity WHERE name='Retaining Wall' AND projectid=1 LIMIT 1) LIMIT 1),
  'Foundation excavated to 1.5m depth. Sub-base trimmed and tested. 75mm blinding concrete placed on firm sub-base and levelled to ±5mm. Ready for footing reinforcement.',
  NULL, 'https://loremflickr.com/800/600/foundation,concrete?lock=40', '2026-05-15 09:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/foundation,concrete?lock=40', 'Foundation excavation at 1.5m'),
  ('https://loremflickr.com/800/600/foundation,concrete?lock=41', 'Blinding concrete placement'),
  ('https://loremflickr.com/800/600/foundation,concrete?lock=42', 'Levelled blinding surface')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Footing reinforcement and concrete' AND activityid=(SELECT activityid FROM activity WHERE name='Retaining Wall' AND projectid=1 LIMIT 1) LIMIT 1),
  'Footing rebar cage placed with 40mm cover maintained on all faces. T16 bars at 150mm c/c. Concrete poured and vibrated. 28-day cube result 38.5MPa (C30 spec).',
  NULL, 'https://loremflickr.com/800/600/reinforcement,concrete?lock=43', '2026-05-25 16:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/reinforcement,concrete?lock=43', 'Footing rebar cage in position'),
  ('https://loremflickr.com/800/600/reinforcement,concrete?lock=44', 'Cover block detail at 40mm'),
  ('https://loremflickr.com/800/600/reinforcement,concrete?lock=45', 'Footing concrete pour complete')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Wall reinforcement cage assembly' AND activityid=(SELECT activityid FROM activity WHERE name='Retaining Wall' AND projectid=1 LIMIT 1) LIMIT 1),
  'Full-height wall rebar cage assembled on sections W1–W4. Vertical T16 bars at 150mm c/c, horizontal links T10 at 200mm c/c. Pre-pour inspection: no outstanding items.',
  NULL, 'https://loremflickr.com/800/600/rebar,steel?lock=46', '2026-06-08 14:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/rebar,steel?lock=46', 'Wall cage W1 erected to full height'),
  ('https://loremflickr.com/800/600/rebar,steel?lock=47', 'Horizontal link spacing detail'),
  ('https://loremflickr.com/800/600/rebar,steel?lock=48', 'Sections W1–W4 cage overview')
) p(u,c);

-- ── Structural Backfill ──────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Backfill material approval' AND activityid=(SELECT activityid FROM activity WHERE name='Structural Backfill' AND projectid=1 LIMIT 1) LIMIT 1),
  'Backfill material tested: CBR 18%, PI 8, <35% fines, free from organics and deleterious material. Material compliance certificates received and filed. Approved for use.',
  NULL, 'https://loremflickr.com/800/600/construction,ground?lock=49', '2026-05-06 08:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/construction,ground?lock=49', 'Backfill material stockpile'),
  ('https://loremflickr.com/800/600/construction,ground?lock=50', 'Lab test sample collection'),
  ('https://loremflickr.com/800/600/construction,ground?lock=51', 'Approval certificate on site board')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Layer 1 placement and compaction' AND activityid=(SELECT activityid FROM activity WHERE name='Structural Backfill' AND projectid=1 LIMIT 1) LIMIT 1),
  '300mm layer placed and compacted with 3 roller passes. DCP testing at 5m intervals — all results exceed 95% modified Proctor. Material compliance certs on file.',
  NULL, 'https://loremflickr.com/800/600/compaction,road?lock=52', '2026-05-12 15:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/compaction,road?lock=52', 'Roller compacting Layer 1'),
  ('https://loremflickr.com/800/600/compaction,road?lock=53', 'DCP test in progress'),
  ('https://loremflickr.com/800/600/compaction,road?lock=54', 'Layer 1 surface after compaction')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Layer 2 placement and compaction' AND activityid=(SELECT activityid FROM activity WHERE name='Structural Backfill' AND projectid=1 LIMIT 1) LIMIT 1),
  'Second 300mm layer placed and compacted. Density testing confirms 96% modified Proctor throughout. Layer signed off by engineer before third layer placement.',
  NULL, 'https://loremflickr.com/800/600/compaction,road?lock=55', '2026-05-18 15:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/compaction,road?lock=55', 'Layer 2 spreading by dozer'),
  ('https://loremflickr.com/800/600/compaction,road?lock=56', 'Nuclear densometer reading'),
  ('https://loremflickr.com/800/600/compaction,road?lock=57', 'Roller finishing Layer 2 surface')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Final compaction test and sign-off' AND activityid=(SELECT activityid FROM activity WHERE name='Structural Backfill' AND projectid=1 LIMIT 1) LIMIT 1),
  'Final compaction test: 97% mod. Proctor, CBR 18% minimum. All test records bound and submitted to RE. Engineer sign-off obtained. Area handed over for next activity.',
  NULL, 'https://loremflickr.com/800/600/construction,ground?lock=58', '2026-05-25 11:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/construction,ground?lock=58', 'Final test result sheet'),
  ('https://loremflickr.com/800/600/construction,ground?lock=59', 'Completed backfill surface overview'),
  ('https://loremflickr.com/800/600/construction,ground?lock=60', 'Engineer sign-off on handover form')
) p(u,c);

-- ── Waterproofing ────────────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Surface preparation and cleaning' AND activityid=(SELECT activityid FROM activity WHERE name='Waterproofing' AND projectid=1 LIMIT 1) LIMIT 1),
  'Concrete slab surface mechanically ground to remove laitance and open pores. All dust vacuumed. Moisture content checked <4%. Bitumen primer coat applied and cured 4 hours.',
  NULL, 'https://loremflickr.com/800/600/waterproofing,construction?lock=61', '2026-06-05 10:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/waterproofing,construction?lock=61', 'Mechanical grinding of slab surface'),
  ('https://loremflickr.com/800/600/waterproofing,construction?lock=62', 'Primer coat application by roller'),
  ('https://loremflickr.com/800/600/waterproofing,construction?lock=63', 'Primed surface ready for membrane')
) p(u,c);

-- ── Utility Trenching ────────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Route survey and marking' AND activityid=(SELECT activityid FROM activity WHERE name='Utility Trenching' AND projectid=1 LIMIT 1) LIMIT 1),
  'Survey pegs, offset pegs and paint marks established along 95m utility route. All underground service locations confirmed with CAT scanner. No conflicts found.',
  NULL, 'https://loremflickr.com/800/600/surveying,construction?lock=64', '2026-05-25 09:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/surveying,construction?lock=64', 'Surveyor setting out peg line'),
  ('https://loremflickr.com/800/600/surveying,construction?lock=65', 'Paint marking on ground surface'),
  ('https://loremflickr.com/800/600/surveying,construction?lock=66', 'CAT scanner services detection check')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Trench excavation' AND activityid=(SELECT activityid FROM activity WHERE name='Utility Trenching' AND projectid=1 LIMIT 1) LIMIT 1),
  '95m trench excavated at 900mm depth, 500mm wide. Hand-dig within exclusion zones at two crossings. Trench sides shored at both ends. Safe access ladder installed.',
  NULL, 'https://loremflickr.com/800/600/trench,pipe?lock=67', '2026-06-05 15:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/trench,pipe?lock=67', 'Open trench at 900mm depth'),
  ('https://loremflickr.com/800/600/trench,pipe?lock=68', 'Shoring installed at end section'),
  ('https://loremflickr.com/800/600/trench,pipe?lock=69', 'Hand-dig zone at crossing point')
) p(u,c);

-- ── Slab Formwork ────────────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Prop installation and levelling' AND activityid=(SELECT activityid FROM activity WHERE name='Slab Formwork' AND projectid=1 LIMIT 1) LIMIT 1),
  'Adjustable props installed at 1.2m grid pattern. All tops levelled with optical level to within 3mm. Base plates on compacted hardcore. Head forks fitted and locked.',
  NULL, 'https://loremflickr.com/800/600/scaffolding,construction?lock=70', '2026-05-22 10:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/scaffolding,construction?lock=70', 'Prop grid installation view'),
  ('https://loremflickr.com/800/600/scaffolding,construction?lock=71', 'Level check on prop head with staff'),
  ('https://loremflickr.com/800/600/scaffolding,construction?lock=72', 'Base plate on compacted hardcore')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Primary beam and ledger setup' AND activityid=(SELECT activityid FROM activity WHERE name='Slab Formwork' AND projectid=1 LIMIT 1) LIMIT 1),
  'Aluminium primary beams placed at 1200mm c/c in props. Secondary ledgers placed perpendicular at 600mm c/c. All connections locked with spring pins. Load tested to 2.5kN/m².',
  NULL, 'https://loremflickr.com/800/600/scaffolding,formwork?lock=73', '2026-05-28 15:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/scaffolding,formwork?lock=73', 'Primary beam layout on props'),
  ('https://loremflickr.com/800/600/scaffolding,formwork?lock=74', 'Ledger cross-connection detail'),
  ('https://loremflickr.com/800/600/scaffolding,formwork?lock=75', 'Spring pin locking detail')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Deck board installation' AND activityid=(SELECT activityid FROM activity WHERE name='Slab Formwork' AND projectid=1 LIMIT 1) LIMIT 1),
  'Softwood deck boards 25mm placed across full slab area spanning onto ledgers. Boards cut to profile at perimeter and penetrations. 2mm gap maintained for drainage.',
  NULL, 'https://loremflickr.com/800/600/formwork,concrete?lock=76', '2026-06-05 13:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/formwork,concrete?lock=76', 'Deck boards spanning across ledgers'),
  ('https://loremflickr.com/800/600/formwork,concrete?lock=77', 'Board cut to perimeter profile'),
  ('https://loremflickr.com/800/600/formwork,concrete?lock=78', 'Full deck surface from above')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Edge formwork and kickers' AND activityid=(SELECT activityid FROM activity WHERE name='Slab Formwork' AND projectid=1 LIMIT 1) LIMIT 1),
  'Edge stop-end boards fixed at perimeter and kickers placed at slab edge profile. All joints sealed with closed-cell foam strip. Edge board plumbed and braced at 600mm c/c.',
  NULL, 'https://loremflickr.com/800/600/formwork,concrete?lock=79', '2026-06-12 11:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/formwork,concrete?lock=79', 'Edge stop-end board fixed and braced'),
  ('https://loremflickr.com/800/600/formwork,concrete?lock=80', 'Foam strip joint seal detail'),
  ('https://loremflickr.com/800/600/formwork,concrete?lock=81', 'Kicker and edge profile overview')
) p(u,c);

-- ── Column Reinforcement ─────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Column cage fabrication' AND activityid=(SELECT activityid FROM activity WHERE name='Column Reinforcement' AND projectid=1 LIMIT 1) LIMIT 1),
  'Cages for C1–C8 prefabricated off-site to schedule drawings. On delivery: bar count, spacing and dimensions verified against BBS. All cages tagged and stored upright.',
  NULL, 'https://loremflickr.com/800/600/rebar,steel?lock=82', '2026-05-28 09:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/rebar,steel?lock=82', 'Prefabricated cage C1 on delivery'),
  ('https://loremflickr.com/800/600/rebar,steel?lock=83', 'Bar spacing verification with tape'),
  ('https://loremflickr.com/800/600/rebar,steel?lock=84', 'Cages C1–C8 stored upright on site')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Column starter bar connection' AND activityid=(SELECT activityid FROM activity WHERE name='Column Reinforcement' AND projectid=1 LIMIT 1) LIMIT 1),
  'Column starter bars connected to footing reinforcement using Type 2 mechanical couplers. All couplers torqued to 450Nm with calibrated wrench. Connections inspected and approved.',
  NULL, 'https://loremflickr.com/800/600/reinforcement,steel?lock=85', '2026-06-05 14:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/reinforcement,steel?lock=85', 'Mechanical coupler connection detail'),
  ('https://loremflickr.com/800/600/reinforcement,steel?lock=86', 'Torque wrench tightening coupler'),
  ('https://loremflickr.com/800/600/reinforcement,steel?lock=87', 'Starter bars all columns overview')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Vertical cage erection' AND activityid=(SELECT activityid FROM activity WHERE name='Column Reinforcement' AND projectid=1 LIMIT 1) LIMIT 1),
  'Cages C1–C6 lifted into position by crane, plumbed with spirit level and braced with tube-and-clip at head and mid-height. Cover blocks fixed at 40mm on all four faces.',
  NULL, 'https://loremflickr.com/800/600/rebar,column?lock=88', '2026-06-12 16:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/rebar,column?lock=88', 'Crane lifting cage C3 into position'),
  ('https://loremflickr.com/800/600/rebar,column?lock=89', 'Plumbing check with spirit level'),
  ('https://loremflickr.com/800/600/rebar,column?lock=90', 'Braced cages C1–C6 row overview')
) p(u,c);

-- ── Road Formation ───────────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Subgrade scarify and moisture adjust' AND activityid=(SELECT activityid FROM activity WHERE name='Road Formation' AND projectid=1 LIMIT 1) LIMIT 1),
  'Subgrade scarified to 200mm depth on southern 150m. Moisture conditioned — water added by bowser to reach OMC-2%. Initial grading pass on first 80m complete.',
  NULL, 'https://loremflickr.com/800/600/road,construction?lock=91', '2026-06-10 14:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/road,construction?lock=91', 'Subgrade scarification pass'),
  ('https://loremflickr.com/800/600/road,construction?lock=92', 'Water bowser moisture conditioning'),
  ('https://loremflickr.com/800/600/road,construction?lock=93', 'Initial grader pass on first 80m')
) p(u,c);

-- ── Site Leveling ────────────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Survey pegs and control levels' AND activityid=(SELECT activityid FROM activity WHERE name='Site Leveling' AND projectid=1 LIMIT 1) LIMIT 1),
  'Main control grid established at 20m spacing using dumpy level and 5m staff. Bench mark confirmed against TBM. All pegs colour-coded and recorded on setting-out drawings.',
  NULL, 'https://loremflickr.com/800/600/surveying,level?lock=94', '2026-05-02 08:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/surveying,level?lock=94', 'Surveyor reading dumpy level'),
  ('https://loremflickr.com/800/600/surveying,level?lock=95', 'Colour-coded control peg grid'),
  ('https://loremflickr.com/800/600/surveying,level?lock=96', 'TBM benchmark confirmation')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Cut areas grading and shaping' AND activityid=(SELECT activityid FROM activity WHERE name='Site Leveling' AND projectid=1 LIMIT 1) LIMIT 1),
  'Northern section graded by D6 dozer to within 50mm. Motor grader finishing pass brought all points to within 25mm of design. Cut face trimmed with excavator arm.',
  NULL, 'https://loremflickr.com/800/600/grading,earthwork?lock=97', '2026-05-07 16:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/grading,earthwork?lock=97',  'Dozer grading northern section'),
  ('https://loremflickr.com/800/600/grading,earthwork?lock=98',  'Motor grader finishing pass'),
  ('https://loremflickr.com/800/600/grading,earthwork?lock=99',  'Graded surface level check')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Fill areas placement and compaction' AND activityid=(SELECT activityid FROM activity WHERE name='Site Leveling' AND projectid=1 LIMIT 1) LIMIT 1),
  'Fill placed and compacted in 200mm layers with vibratory drum roller — 3 passes per layer. Density tests all exceed 93% standard Proctor. Fill area complete.',
  NULL, 'https://loremflickr.com/800/600/compaction,fill?lock=100', '2026-05-11 14:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/compaction,fill?lock=100', 'Fill layer placement by dozer'),
  ('https://loremflickr.com/800/600/compaction,fill?lock=101', 'Vibratory roller compaction pass'),
  ('https://loremflickr.com/800/600/compaction,fill?lock=102', 'Density test with sand cone')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Final levels survey and as-built' AND activityid=(SELECT activityid FROM activity WHERE name='Site Leveling' AND projectid=1 LIMIT 1) LIMIT 1),
  'As-built survey conducted at 10m grid — all 147 points within ±20mm design tolerance. Survey data submitted to RE. Surplus spoil loaded and removed off site. Area signed off.',
  NULL, 'https://loremflickr.com/800/600/surveying,asbuilt?lock=103', '2026-05-15 11:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/surveying,asbuilt?lock=103', 'As-built survey grid measurement'),
  ('https://loremflickr.com/800/600/surveying,asbuilt?lock=104', 'Completed leveled site overview'),
  ('https://loremflickr.com/800/600/surveying,asbuilt?lock=105', 'RE sign-off on completion sheet')
) p(u,c);

-- ── Inspection & QA ──────────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Document and drawing review' AND activityid=(SELECT activityid FROM activity WHERE name='Inspection & QA' AND projectid=1 LIMIT 1) LIMIT 1),
  'Full ITP, method statement and material cert review completed. 2 minor comments raised: drawing revision level mismatch and unsigned pour card. Contractor given 24hrs to resolve.',
  NULL, 'https://loremflickr.com/800/600/inspection,engineering?lock=106', '2026-05-20 09:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/inspection,engineering?lock=106', 'ITP documents being reviewed'),
  ('https://loremflickr.com/800/600/inspection,engineering?lock=107', 'Drawing revision check on site'),
  ('https://loremflickr.com/800/600/inspection,engineering?lock=108', 'Comment register on office desk')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Hold point physical inspection' AND activityid=(SELECT activityid FROM activity WHERE name='Inspection & QA' AND projectid=1 LIMIT 1) LIMIT 1),
  'Physical hold point inspection of foundation, drainage and compaction works. 3 NCRs raised: NCR-007 (concrete cover <35mm at 2 locations), NCR-008 (drainage gradient), NCR-009 (test frequency).',
  NULL, 'https://loremflickr.com/800/600/quality,inspection?lock=109', '2026-05-28 13:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/quality,inspection?lock=109', 'Hold point walkthrough at foundation'),
  ('https://loremflickr.com/800/600/quality,inspection?lock=110', 'NCR-007 cover measurement photo'),
  ('https://loremflickr.com/800/600/quality,inspection?lock=111', 'NCR-008 drainage gradient survey')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Test certificates and ITPs review' AND activityid=(SELECT activityid FROM activity WHERE name='Inspection & QA' AND projectid=1 LIMIT 1) LIMIT 1),
  'All test certificates reviewed against specification. Concrete 28-day cubes: 42MPa pass. Proctor and DCP: all above 95%. Drainage pressure test: 0.1 bar loss after 1hr — within tolerance.',
  NULL, 'https://loremflickr.com/800/600/testing,engineering?lock=112', '2026-06-02 11:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/testing,engineering?lock=112', 'Concrete cube test results sheet'),
  ('https://loremflickr.com/800/600/testing,engineering?lock=113', 'Drainage pressure test gauge'),
  ('https://loremflickr.com/800/600/testing,engineering?lock=114', 'Test certificate binder on desk')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Defect list issue and close-out' AND activityid=(SELECT activityid FROM activity WHERE name='Inspection & QA' AND projectid=1 LIMIT 1) LIMIT 1),
  'All 3 NCRs independently verified as closed out. NCR-007: additional cover applied. NCR-008: gradient re-surveyed and confirmed. NCR-009: additional tests completed. Defect register updated.',
  NULL, 'https://loremflickr.com/800/600/closeout,construction?lock=115', '2026-06-07 15:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/closeout,construction?lock=115', 'NCR-007 remediation — cover re-applied'),
  ('https://loremflickr.com/800/600/closeout,construction?lock=116', 'NCR-008 gradient re-survey result'),
  ('https://loremflickr.com/800/600/closeout,construction?lock=117', 'Closed defect register overview')
) p(u,c);

-- ── Haul Road Construction ───────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Route clearing and grubbing' AND activityid=(SELECT activityid FROM activity WHERE name='Haul Road Construction' AND projectid=1 LIMIT 1) LIMIT 1),
  'First 200m of haul road route cleared of vegetation, stumps and roots. Debris stockpiled for burning under permit. Route width 6m marked and cleared to bare earth.',
  NULL, 'https://loremflickr.com/800/600/clearing,construction?lock=118', '2026-05-18 09:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/clearing,construction?lock=118', 'Vegetation clearing in progress'),
  ('https://loremflickr.com/800/600/clearing,construction?lock=119', 'Stump grubbing by excavator'),
  ('https://loremflickr.com/800/600/clearing,construction?lock=120', 'Cleared haul road route overview')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Geotextile and sub-base layer' AND activityid=(SELECT activityid FROM activity WHERE name='Haul Road Construction' AND projectid=1 LIMIT 1) LIMIT 1),
  'Non-woven geotextile 150gsm laid across full 6m width on 200m section, 300mm overlap at joints. 200mm crushed rock sub-base placed and compacted to 95% mod. Proctor.',
  NULL, 'https://loremflickr.com/800/600/road,gravel?lock=121', '2026-05-28 15:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/road,gravel?lock=121', 'Geotextile placement and overlap'),
  ('https://loremflickr.com/800/600/road,gravel?lock=122', 'Crushed rock sub-base spreading'),
  ('https://loremflickr.com/800/600/road,gravel?lock=123', 'Roller compacting sub-base layer')
) p(u,c);

-- ── Bulk Earthwork ───────────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Topsoil stripping and stockpiling' AND activityid=(SELECT activityid FROM activity WHERE name='Bulk Earthwork' AND projectid=1 LIMIT 1) LIMIT 1),
  'Topsoil stripped to 300mm from Zones 1 and 2 — approx 3,500m². Material stockpiled at designated area and protected with silt fence and erosion netting for reuse in landscaping.',
  NULL, 'https://loremflickr.com/800/600/earthwork,excavation?lock=124', '2026-05-30 10:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/earthwork,excavation?lock=124', 'Topsoil stripping Zone 1'),
  ('https://loremflickr.com/800/600/earthwork,excavation?lock=125', 'Topsoil stockpile with silt fence'),
  ('https://loremflickr.com/800/600/earthwork,excavation?lock=126', 'Stripped Zone 2 ready for bulk cut')
) p(u,c);
