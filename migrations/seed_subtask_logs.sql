-- ═══════════════════════════════════════════════════════════════════════════
-- Seed subtask log entries + photos for COMPLETED subtasks (6 activities)
-- Prerequisites: seed_activities.sql, seed_subtasks.sql,
--                add_subtask_log_photos.sql
-- Images: loremflickr.com/{w}/{h}/{keyword}?lock={n}
--   Returns real Flickr photos filtered by construction keyword.
--   Same lock number = same image (consistent across runs).
-- createdby: left NULL (int4, resolves to "Site Engineer" in display)
-- Pattern: each block is a CTE that INSERTs a log entry and immediately
--          inserts 3-4 related photos using RETURNING logentryid.
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
  ('https://loremflickr.com/800/600/excavation?lock=3',  'Cleared site overview from north'),
  ('https://loremflickr.com/800/600/excavation?lock=4',  'Stockpile area from SW corner')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Topsoil stripping' AND activityid=(SELECT activityid FROM activity WHERE name='Foundation Excavation' AND projectid=1 LIMIT 1) LIMIT 1),
  'Topsoil stripped to average 250mm depth across full excavation footprint. Material stockpiled separately for future landscape reinstatement.',
  NULL, 'https://loremflickr.com/800/600/excavation?lock=5', '2026-05-14 14:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/excavation?lock=5',  'Topsoil stripping with excavator'),
  ('https://loremflickr.com/800/600/excavation?lock=6',  'Topsoil stockpile formation'),
  ('https://loremflickr.com/800/600/excavation?lock=7',  'Stripped formation surface'),
  ('https://loremflickr.com/800/600/excavation?lock=8',  'Depth measurement at 250mm')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Bulk excavation to formation level' AND activityid=(SELECT activityid FROM activity WHERE name='Foundation Excavation' AND projectid=1 LIMIT 1) LIMIT 1),
  'Southern half bulk excavated to 2.1m formation level. Volume approx 850m³. No groundwater encountered. Cut face stable. Northern section commences tomorrow.',
  NULL, 'https://loremflickr.com/800/600/excavation?lock=9', '2026-05-25 16:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/excavation?lock=9',  'Bulk excavation at formation level'),
  ('https://loremflickr.com/800/600/excavation?lock=10', 'Excavator at 2.1m depth'),
  ('https://loremflickr.com/800/600/excavation?lock=11', 'Cut face profile southern section'),
  ('https://loremflickr.com/800/600/excavation?lock=12', 'Volume measurement survey')
) p(u,c);

-- ── Piling Work ──────────────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Piling rig mobilisation and setup' AND activityid=(SELECT activityid FROM activity WHERE name='Piling Work' AND projectid=1 LIMIT 1) LIMIT 1),
  'Piling rig delivered and positioned on Grid A. Access platform confirmed stable on compacted hardcore. Initial test bore to 3m confirms expected soil profile.',
  NULL, 'https://loremflickr.com/800/600/drilling,construction?lock=13', '2026-05-10 09:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/drilling,construction?lock=13', 'Piling rig positioned on Grid A'),
  ('https://loremflickr.com/800/600/drilling,construction?lock=14', 'Access platform and outrigger setup'),
  ('https://loremflickr.com/800/600/drilling,construction?lock=15', 'Initial bore log at 3m depth'),
  ('https://loremflickr.com/800/600/drilling,construction?lock=16', 'Rig stability check complete')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Bore hole drilling' AND activityid=(SELECT activityid FROM activity WHERE name='Piling Work' AND projectid=1 LIMIT 1) LIMIT 1),
  'Bore hole drilling complete for piles P01–P16. Founding stratum confirmed by geologist at 11.8m. All bore logs recorded and signed. Casings extracted without loss.',
  NULL, 'https://loremflickr.com/800/600/drilling,construction?lock=17', '2026-05-22 15:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/drilling,construction?lock=17', 'Drilling in progress at pile P08'),
  ('https://loremflickr.com/800/600/drilling,construction?lock=18', 'Geologist logging bore samples'),
  ('https://loremflickr.com/800/600/drilling,construction?lock=19', 'Completed bore P01–P08 row caps'),
  ('https://loremflickr.com/800/600/drilling,construction?lock=20', 'Casing extraction process')
) p(u,c);

-- ── Concrete Pouring ─────────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Mix design approval and batching' AND activityid=(SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1) LIMIT 1),
  'C30/37 mix design approved by structural engineer. Trial batches completed at plant. 28-day cube results confirm 42MPa average — exceeds 37MPa characteristic strength.',
  NULL, 'https://loremflickr.com/800/600/concrete,construction?lock=21', '2026-05-04 08:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/concrete,construction?lock=21', 'Trial mix batch at batching plant'),
  ('https://loremflickr.com/800/600/concrete,construction?lock=22', 'Slump test result 110mm'),
  ('https://loremflickr.com/800/600/concrete,construction?lock=23', 'Cube samples curing in moulds'),
  ('https://loremflickr.com/800/600/concrete,construction?lock=24', 'Mix design approval document')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Formwork inspection and sign-off' AND activityid=(SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1) LIMIT 1),
  'Formwork propping and edge boarding inspected. All dimensions within 10mm tolerance. Rebar cover blocks confirmed at 40mm. Pre-pour checklist signed by structural engineer.',
  NULL, 'https://loremflickr.com/800/600/formwork,concrete?lock=25', '2026-05-08 10:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/formwork,concrete?lock=25', 'Propping arrangement overview'),
  ('https://loremflickr.com/800/600/formwork,concrete?lock=26', 'Cover block placement at 40mm'),
  ('https://loremflickr.com/800/600/formwork,concrete?lock=27', 'Signed pre-pour checklist on site board'),
  ('https://loremflickr.com/800/600/formwork,concrete?lock=28', 'Dimension tolerance check')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Concrete pour and compaction' AND activityid=(SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1) LIMIT 1),
  '120m³ C30/37 poured in one continuous 6-hour operation. Vibration compaction applied at 500mm centres. Slump at truck 110mm. 6 cube pairs taken for 7/28-day testing.',
  NULL, 'https://loremflickr.com/800/600/concrete,pouring?lock=29', '2026-05-12 17:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/concrete,pouring?lock=29', 'Concrete truck discharging into pump'),
  ('https://loremflickr.com/800/600/concrete,pouring?lock=30', 'Vibration poker compaction in slab'),
  ('https://loremflickr.com/800/600/concrete,pouring?lock=31', 'Cube samples labelled at truck'),
  ('https://loremflickr.com/800/600/concrete,pouring?lock=32', 'Pour progress from west to east')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Surface leveling and finishing' AND activityid=(SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1) LIMIT 1),
  'Surface finished to power float standard. Level checked — within ±5mm of design across full area. Curing membrane sprayed immediately after finishing.',
  NULL, 'https://loremflickr.com/800/600/concrete,floor?lock=33', '2026-05-14 12:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/concrete,floor?lock=33', 'Power float finishing operation'),
  ('https://loremflickr.com/800/600/concrete,floor?lock=34', 'Level staff reading on fresh surface'),
  ('https://loremflickr.com/800/600/concrete,floor?lock=35', 'Curing membrane application'),
  ('https://loremflickr.com/800/600/concrete,floor?lock=36', 'Finished surface close-up')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Curing and de-shuttering' AND activityid=(SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1) LIMIT 1),
  '28-day curing period complete. De-shuttering carried out without damage. Surface quality good — minor honeycombing noted at grid C4 marked for remediation next week.',
  NULL, 'https://loremflickr.com/800/600/concrete,structure?lock=37', '2026-05-20 09:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/concrete,structure?lock=37', 'De-shuttered slab soffit'),
  ('https://loremflickr.com/800/600/concrete,structure?lock=38', 'Honeycombing defect at grid C4'),
  ('https://loremflickr.com/800/600/concrete,structure?lock=39', 'Overall slab quality overview'),
  ('https://loremflickr.com/800/600/concrete,structure?lock=40', 'Edge detail after de-shuttering')
) p(u,c);

-- ── Electrical Conduit ───────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Conduit trench excavation' AND activityid=(SELECT activityid FROM activity WHERE name='Electrical Conduit' AND projectid=1 LIMIT 1) LIMIT 1),
  'Trenches E1–E3 excavated to 700mm depth at 300mm width. Hand-dig within 1m of known services. Trench sides battered at 1:1. No underground conflicts encountered.',
  NULL, 'https://loremflickr.com/800/600/trench,construction?lock=41', '2026-05-28 11:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/trench,construction?lock=41', 'Trench E1 open at 700mm depth'),
  ('https://loremflickr.com/800/600/trench,construction?lock=42', 'Hand-dig zone near existing services'),
  ('https://loremflickr.com/800/600/trench,construction?lock=43', 'Trench profile with battered sides'),
  ('https://loremflickr.com/800/600/trench,construction?lock=44', 'Service scan detection results')
) p(u,c);

-- ── Drainage Installation ────────────────────────────────────────────────────

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Drainage trench excavation' AND activityid=(SELECT activityid FROM activity WHERE name='Drainage Installation' AND projectid=1 LIMIT 1) LIMIT 1),
  'Main drainage trench 180m excavated with battered sides at 1:1. Timber shoring erected at road crossing CH80–CH95. Trench bottom trimmed to design level.',
  NULL, 'https://loremflickr.com/800/600/drainage,trench?lock=45', '2026-05-20 10:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/drainage,trench?lock=45', 'Drainage trench open with shoring'),
  ('https://loremflickr.com/800/600/drainage,trench?lock=46', 'Trench bottom trimmed to gradient'),
  ('https://loremflickr.com/800/600/drainage,trench?lock=47', 'Road crossing shoring detail'),
  ('https://loremflickr.com/800/600/drainage,trench?lock=48', 'Battered side profile')
) p(u,c);

WITH l AS (INSERT INTO subtask_log_entry (subtaskid, description, createdby, evidencephoto, createdat) VALUES (
  (SELECT subtaskid FROM subtask WHERE title='Pipe bedding preparation' AND activityid=(SELECT activityid FROM activity WHERE name='Drainage Installation' AND projectid=1 LIMIT 1) LIMIT 1),
  '150mm sand bedding placed along full trench length. Gradient 1:150 set and verified with dumpy level at 10m intervals. Surface firm and even before pipe laying.',
  NULL, 'https://loremflickr.com/800/600/pipe,construction?lock=49', '2026-06-01 14:00:00') RETURNING logentryid)
INSERT INTO subtask_log_photos (logentryid, photourl, caption) SELECT l.logentryid, p.u, p.c FROM l CROSS JOIN (VALUES
  ('https://loremflickr.com/800/600/pipe,construction?lock=49', 'Sand bedding placed in trench'),
  ('https://loremflickr.com/800/600/pipe,construction?lock=50', 'Gradient check with dumpy level'),
  ('https://loremflickr.com/800/600/pipe,construction?lock=51', 'Bedding surface ready for pipe'),
  ('https://loremflickr.com/800/600/pipe,construction?lock=52', 'Bedding thickness measurement')
) p(u,c);
