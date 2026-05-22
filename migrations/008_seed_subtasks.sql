-- ============================================================
-- Seed subtasks for project 1 activities (run after 008_site_progress_subtasks.sql)
-- Progress % will be recalculated by trg_subtask_sync_activity_progress
-- ============================================================

-- Optional: clear existing seed rows for these activities only
-- DELETE FROM subtask WHERE activityid IN (8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 25, 26);

-- activityid 8 — Foundation Work (target ~75% → 3/4 complete)
INSERT INTO subtask (activityid, title, duedate, completed, displayorder, completedat) VALUES
  (8, 'Site clearance & marking', CURRENT_DATE - 14, TRUE,  1, CURRENT_TIMESTAMP - INTERVAL '14 days'),
  (8, 'Excavation to design depth', CURRENT_DATE - 7,  TRUE,  2, CURRENT_TIMESTAMP - INTERVAL '7 days'),
  (8, 'Rebar & formwork',           CURRENT_DATE + 3,  TRUE,  3, CURRENT_TIMESTAMP - INTERVAL '2 days'),
  (8, 'Foundation pour & cure',     CURRENT_DATE + 10, FALSE, 4, NULL);

-- activityid 9 — Piling Section (target ~40% → 2/5 complete)
INSERT INTO subtask (activityid, title, duedate, completed, displayorder, completedat) VALUES
  (9, 'Pile layout survey',        CURRENT_DATE - 5,  TRUE,  1, CURRENT_TIMESTAMP - INTERVAL '5 days'),
  (9, 'Pilot bore & soil check',   CURRENT_DATE,      TRUE,  2, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  (9, 'Pile driving — grid A',     CURRENT_DATE + 7,  FALSE, 3, NULL),
  (9, 'Pile driving — grid B',     CURRENT_DATE + 14, FALSE, 4, NULL),
  (9, 'Load test & sign-off',      CURRENT_DATE + 21, FALSE, 5, NULL);

-- activityid 10 — Electrical Installation (100% → all complete)
INSERT INTO subtask (activityid, title, duedate, completed, displayorder, completedat) VALUES
  (10, 'Conduit routing',           CURRENT_DATE - 21, TRUE, 1, CURRENT_TIMESTAMP - INTERVAL '21 days'),
  (10, 'Panel & DB installation',   CURRENT_DATE - 14, TRUE, 2, CURRENT_TIMESTAMP - INTERVAL '14 days'),
  (10, 'Cable pulling & termination', CURRENT_DATE - 7, TRUE, 3, CURRENT_TIMESTAMP - INTERVAL '7 days'),
  (10, 'Testing & commissioning',   CURRENT_DATE - 1,  TRUE, 4, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- activityid 11 — Drainage Setup (0%)
INSERT INTO subtask (activityid, title, duedate, completed, displayorder) VALUES
  (11, 'Trench excavation',       CURRENT_DATE + 3,  FALSE, 1),
  (11, 'Pipe laying — main run',  CURRENT_DATE + 10, FALSE, 2),
  (11, 'Manholes & connections',  CURRENT_DATE + 17, FALSE, 3),
  (11, 'Backfill & inspection',   CURRENT_DATE + 24, FALSE, 4);

-- activityid 12 — Structural Framing Level 4 (0%)
INSERT INTO subtask (activityid, title, duedate, completed, displayorder) VALUES
  (12, 'Column erection L4',      CURRENT_DATE + 5,  FALSE, 1),
  (12, 'Beam installation L4',    CURRENT_DATE + 12, FALSE, 2),
  (12, 'Deck / slab prep L4',     CURRENT_DATE + 19, FALSE, 3),
  (12, 'Bolt-up & alignment check', CURRENT_DATE + 26, FALSE, 4);

-- activityid 13 — Lobby Brick Masonry (~10% → 1/4)
INSERT INTO subtask (activityid, title, duedate, completed, displayorder, completedat) VALUES
  (13, 'Mortar mix & sample panel', CURRENT_DATE - 3, TRUE,  1, CURRENT_TIMESTAMP - INTERVAL '3 days'),
  (13, 'North wall — course 1-3',   CURRENT_DATE + 7,  FALSE, 2, NULL),
  (13, 'South wall — course 1-3',   CURRENT_DATE + 14, FALSE, 3, NULL),
  (13, 'Lintels & openings',        CURRENT_DATE + 21, FALSE, 4, NULL);

-- activityid 14 — HVAC (~30% → 2/6 ≈ 33%)
INSERT INTO subtask (activityid, title, duedate, completed, displayorder, completedat) VALUES
  (14, 'Equipment delivery & staging', CURRENT_DATE - 10, TRUE,  1, CURRENT_TIMESTAMP - INTERVAL '10 days'),
  (14, 'Ductwork layout L2',           CURRENT_DATE - 3,  TRUE,  2, CURRENT_TIMESTAMP - INTERVAL '3 days'),
  (14, 'AHU mounting',                   CURRENT_DATE + 5,  FALSE, 3, NULL),
  (14, 'Refrigerant / piping',           CURRENT_DATE + 12, FALSE, 4, NULL),
  (14, 'Controls wiring',                CURRENT_DATE + 19, FALSE, 5, NULL),
  (14, 'Balance & commissioning',        CURRENT_DATE + 26, FALSE, 6, NULL);

-- activityid 15 — Internal Wall Plastering (~98% → 5/5 or 4/4 all done; use 5/5)
INSERT INTO subtask (activityid, title, duedate, completed, displayorder, completedat) VALUES
  (15, 'Surface prep & bonding',   CURRENT_DATE - 20, TRUE, 1, CURRENT_TIMESTAMP - INTERVAL '20 days'),
  (15, 'First coat — east wing',   CURRENT_DATE - 12, TRUE, 2, CURRENT_TIMESTAMP - INTERVAL '12 days'),
  (15, 'First coat — west wing',   CURRENT_DATE - 8,  TRUE, 3, CURRENT_TIMESTAMP - INTERVAL '8 days'),
  (15, 'Second coat & skim',       CURRENT_DATE - 2,  TRUE, 4, CURRENT_TIMESTAMP - INTERVAL '2 days'),
  (15, 'Final QA walkthrough',     CURRENT_DATE + 2,  TRUE, 5, CURRENT_TIMESTAMP);

-- activityid 16 — Foundation Piling Phase 2 (~20% → 1/5)
INSERT INTO subtask (activityid, title, duedate, completed, displayorder, completedat) VALUES
  (16, 'Mobilize piling rig',      CURRENT_DATE - 2, TRUE,  1, CURRENT_TIMESTAMP - INTERVAL '2 days'),
  (16, 'Phase 2 — piles 1-10',     CURRENT_DATE + 7,  FALSE, 2, NULL),
  (16, 'Phase 2 — piles 11-20',    CURRENT_DATE + 14, FALSE, 3, NULL),
  (16, 'Integrity testing',        CURRENT_DATE + 21, FALSE, 4, NULL),
  (16, 'Cap beam prep',            CURRENT_DATE + 28, FALSE, 5, NULL);

-- activityid 18 — Structural Framing Level 5 (0%)
INSERT INTO subtask (activityid, title, duedate, completed, displayorder) VALUES
  (18, 'L5 column lift plan',     CURRENT_DATE + 4,  FALSE, 1),
  (18, 'Steel delivery L5',       CURRENT_DATE + 8,  FALSE, 2),
  (18, 'Erection — core zone',    CURRENT_DATE + 15, FALSE, 3),
  (18, 'Erection — perimeter',    CURRENT_DATE + 22, FALSE, 4);

-- activityid 25 — Staging & Support (~90% → 9/10)
INSERT INTO subtask (activityid, title, duedate, completed, displayorder, completedat) VALUES
  (25, 'Laydown area fencing',        CURRENT_DATE - 15, TRUE, 1, CURRENT_TIMESTAMP - INTERVAL '15 days'),
  (25, 'Site office setup',           CURRENT_DATE - 12, TRUE, 2, CURRENT_TIMESTAMP - INTERVAL '12 days'),
  (25, 'Material storage bays',       CURRENT_DATE - 10, TRUE, 3, CURRENT_TIMESTAMP - INTERVAL '10 days'),
  (25, 'Tool crib & signage',         CURRENT_DATE - 7,  TRUE, 4, CURRENT_TIMESTAMP - INTERVAL '7 days'),
  (25, 'Welfare facilities hookup',   CURRENT_DATE - 5,  TRUE, 5, CURRENT_TIMESTAMP - INTERVAL '5 days'),
  (25, 'Access roads — gravel',       CURRENT_DATE - 3,  TRUE, 6, CURRENT_TIMESTAMP - INTERVAL '3 days'),
  (25, 'Lighting — perimeter',        CURRENT_DATE - 2,  TRUE, 7, CURRENT_TIMESTAMP - INTERVAL '2 days'),
  (25, 'Security checkpoint',         CURRENT_DATE - 1,  TRUE, 8, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  (25, 'Fire extinguishers & plan',   CURRENT_DATE,      TRUE, 9, CURRENT_TIMESTAMP),
  (25, 'Final staging inspection',    CURRENT_DATE + 5,  FALSE, 10, NULL);

-- activityid 26 — test (0%)
INSERT INTO subtask (activityid, title, duedate, completed, displayorder) VALUES
  (26, 'Test step 1', CURRENT_DATE + 1, FALSE, 1),
  (26, 'Test step 2', CURRENT_DATE + 2, FALSE, 2);

-- Sample timeline entries for one subtask (optional — shows in Timeline tab)
INSERT INTO subtask_log_entry (subtaskid, description, createdat)
SELECT s.subtaskid, 'Excavation depth verified against drawings.', CURRENT_TIMESTAMP - INTERVAL '6 days'
FROM subtask s
WHERE s.activityid = 8 AND s.title = 'Excavation to design depth'
LIMIT 1;

INSERT INTO subtask_log_entry (subtaskid, description, createdat)
SELECT s.subtaskid, 'Conduit run complete; ready for pull-through.', CURRENT_TIMESTAMP - INTERVAL '8 days'
FROM subtask s
WHERE s.activityid = 10 AND s.title = 'Conduit routing'
LIMIT 1;

-- Verify synced progress
SELECT a.activityid, a.description, a.progress AS progress_after_sync,
       COUNT(s.subtaskid) AS total_subtasks,
       COUNT(*) FILTER (WHERE s.completed) AS completed_subtasks
FROM activity a
LEFT JOIN subtask s ON s.activityid = a.activityid
WHERE a.activityid IN (8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 25, 26)
GROUP BY a.activityid, a.description, a.progress
ORDER BY a.activityid;
