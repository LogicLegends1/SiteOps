-- ═══════════════════════════════════════════════════════════════════════════
-- Seed activity log entries + photos for project 1
-- Prerequisites:
--   1. seed_activities.sql   (activity rows must exist)
--   2. add_activity_log_photos.sql (activity_log_photos table must exist)
-- Notes:
--   siteengineerid left NULL — it references auth.users (Supabase), which
--   cannot be seeded via SQL. Set it after creating real auth users if needed.
--   Images use picsum.photos/seed/{key}/800/600 — real URLs, consistent per seed.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── STEP 1: Insert log entries ─────────────────────────────────────────────

INSERT INTO activity_log_entry (activityid, timestamp, description, siteengineerid, updatedprogress, evidencephoto)
VALUES

-- Foundation Excavation ── 2 updates
((SELECT activityid FROM activity WHERE name='Foundation Excavation' AND projectid=1 LIMIT 1),
 '2026-05-10 09:30:00', 'Topsoil stripping and site clearance completed. All vegetation cleared and spoil hauled to designated stockpile. Area ready for bulk excavation.', NULL, 25,
 'https://picsum.photos/seed/excav-strip-1/800/600'),

((SELECT activityid FROM activity WHERE name='Foundation Excavation' AND projectid=1 LIMIT 1),
 '2026-05-22 16:00:00', 'Bulk excavation to formation level completed on southern half. Northern section in progress. Total volume excavated approx 850m³. No groundwater encountered.', NULL, 65,
 'https://picsum.photos/seed/excav-bulk-1/800/600'),

-- Piling Work ── 2 updates
((SELECT activityid FROM activity WHERE name='Piling Work' AND projectid=1 LIMIT 1),
 '2026-05-12 10:00:00', 'Piling rig mobilised and positioned on Grid A. First 8 piles drilled to design depth of 12m. All bore logs recorded by site geologist. No obstructions encountered.', NULL, 20,
 'https://picsum.photos/seed/piling-rig-1/800/600'),

((SELECT activityid FROM activity WHERE name='Piling Work' AND projectid=1 LIMIT 1),
 '2026-05-24 14:30:00', 'Concrete placement completed for piles P01–P16. Bore logs confirm competent founding stratum at 11.8m. Pile caps to commence next week pending curing.', NULL, 45,
 'https://picsum.photos/seed/piling-pour-1/800/600'),

-- Concrete Pouring ── 3 updates (COMPLETED)
((SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1),
 '2026-05-08 08:30:00', 'Formwork inspection completed and signed off by structural engineer. All props at 1.2m spacing. Rebar cover confirmed at 40mm. Approved for pour.', NULL, 30,
 'https://picsum.photos/seed/concrete-form-1/800/600'),

((SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1),
 '2026-05-12 17:00:00', 'Concrete pour completed in 6 hours. Total volume 120m³ C30/37. Slump tests within specification at 100–120mm. Surface finishing underway. 6 cube samples taken.', NULL, 70,
 'https://picsum.photos/seed/concrete-pour-1/800/600'),

((SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1),
 '2026-05-20 11:00:00', 'Curing period complete. De-shuttering carried out with no significant defects. Minor honeycombing noted at grid C4 — remediation scheduled for next week.', NULL, 100,
 'https://picsum.photos/seed/concrete-cure-1/800/600'),

-- Electrical Conduit ── 1 update
((SELECT activityid FROM activity WHERE name='Electrical Conduit' AND projectid=1 LIMIT 1),
 '2026-05-28 15:00:00', 'Conduit trenches excavated along routes E1–E3. Approx 180m of HDPE 100mm conduit installed and jointed. Draw wire pulled through first two sections. Sand bedding placed on E1.', NULL, 30,
 'https://picsum.photos/seed/conduit-trench-1/800/600'),

-- Drainage Installation ── 2 updates
((SELECT activityid FROM activity WHERE name='Drainage Installation' AND projectid=1 LIMIT 1),
 '2026-05-22 10:30:00', 'Main drainage trench excavation complete. Pipe bedding layer placed and checked to design gradient of 1:150. Pre-pipe laying inspection passed by engineer.', NULL, 30,
 'https://picsum.photos/seed/drainage-bed-1/800/600'),

((SELECT activityid FROM activity WHERE name='Drainage Installation' AND projectid=1 LIMIT 1),
 '2026-06-02 16:00:00', '300mm UPVC drainage pipe installed on main run, 120m complete. Inspection chamber IC-01 constructed and haunched in concrete. Backfill compacted in 150mm layers.', NULL, 55,
 'https://picsum.photos/seed/drainage-pipe-1/800/600'),

-- Retaining Wall ── 2 updates
((SELECT activityid FROM activity WHERE name='Retaining Wall' AND projectid=1 LIMIT 1),
 '2026-05-20 09:00:00', 'Retaining wall footing reinforcement placed and poured. Cover blocks confirmed at 40mm. 28-day cube results: 38.5 MPa (C30 spec). Footing blinding in good condition.', NULL, 30,
 'https://picsum.photos/seed/retwall-foot-1/800/600'),

((SELECT activityid FROM activity WHERE name='Retaining Wall' AND projectid=1 LIMIT 1),
 '2026-06-10 14:00:00', 'Wall reinforcement cage erected to full height on sections W1–W4. Pre-pour inspection conducted with no outstanding items. Ready for pour next session.', NULL, 70,
 'https://picsum.photos/seed/retwall-cage-1/800/600'),

-- Structural Backfill ── 2 updates (COMPLETED)
((SELECT activityid FROM activity WHERE name='Structural Backfill' AND projectid=1 LIMIT 1),
 '2026-05-14 11:00:00', 'Layers 1 and 2 of structural backfill placed and compacted. DCP testing confirms in-situ density exceeding 95% modified Proctor. Material compliance certs received.', NULL, 60,
 'https://picsum.photos/seed/backfill-comp-1/800/600'),

((SELECT activityid FROM activity WHERE name='Structural Backfill' AND projectid=1 LIMIT 1),
 '2026-05-25 15:30:00', 'Final compaction layer complete. CBR values confirmed at 18% minimum — exceeds 15% specification. Engineer sign-off obtained. Area handed over for next works.', NULL, 100,
 'https://picsum.photos/seed/backfill-done-1/800/600'),

-- Waterproofing ── 1 update (PAUSED)
((SELECT activityid FROM activity WHERE name='Waterproofing' AND projectid=1 LIMIT 1),
 '2026-06-05 10:00:00', 'Surface preparation complete — all laitance removed by mechanical grinding. Primer coat applied to base slab. Work paused pending procurement of Grade III membrane rolls (supplier delay).', NULL, 25,
 'https://picsum.photos/seed/waterproof-prep-1/800/600'),

-- Utility Trenching ── 1 update
((SELECT activityid FROM activity WHERE name='Utility Trenching' AND projectid=1 LIMIT 1),
 '2026-06-05 15:30:00', 'Utility trenches excavated on Routes U1 and U2, total 95m. Sand bedding placed on first 60m. MDPE water main 150mm installation commenced. As-built survey in progress.', NULL, 40,
 'https://picsum.photos/seed/utility-trench-1/800/600'),

-- Slab Formwork ── 2 updates
((SELECT activityid FROM activity WHERE name='Slab Formwork' AND projectid=1 LIMIT 1),
 '2026-06-02 11:30:00', 'All props installed at 1.2m spacing and levelled with optical level. Primary beam and ledger system fully erected. Deck boards approximately 70% placed, edge zones pending.', NULL, 50,
 'https://picsum.photos/seed/formwork-prop-1/800/600'),

((SELECT activityid FROM activity WHERE name='Slab Formwork' AND projectid=1 LIMIT 1),
 '2026-06-12 15:00:00', 'Full deck boarding complete. Edge formwork and kickers fixed and sealed. Pre-pour checklist submitted to structural engineer. No outstanding items from QA walk.', NULL, 80,
 'https://picsum.photos/seed/formwork-deck-1/800/600'),

-- Column Reinforcement ── 2 updates
((SELECT activityid FROM activity WHERE name='Column Reinforcement' AND projectid=1 LIMIT 1),
 '2026-06-02 09:30:00', 'Column cages C1–C8 fabricated off-site and delivered to site. All starter bar connections made to footing reinforcement. Cover blocks placed at 40mm on all faces.', NULL, 30,
 'https://picsum.photos/seed/colrebar-fab-1/800/600'),

((SELECT activityid FROM activity WHERE name='Column Reinforcement' AND projectid=1 LIMIT 1),
 '2026-06-15 16:00:00', 'Column cages C1–C6 erected and plumbed. Vertical cages braced at head and base. Links and tie wires placed to spec. C7 and C8 carry over to next session.', NULL, 60,
 'https://picsum.photos/seed/colrebar-erect-1/800/600'),

-- Road Formation ── 1 update
((SELECT activityid FROM activity WHERE name='Road Formation' AND projectid=1 LIMIT 1),
 '2026-06-10 14:00:00', 'Subgrade scarified to 200mm and moisture conditioned on southern 150m section. Initial grading pass complete to design camber profile. Compaction monitoring ongoing with nuclear densometer.', NULL, 35,
 'https://picsum.photos/seed/roadform-grade-1/800/600'),

-- Site Leveling ── 2 updates (COMPLETED)
((SELECT activityid FROM activity WHERE name='Site Leveling' AND projectid=1 LIMIT 1),
 '2026-05-08 09:00:00', 'Cut areas graded on northern section. All vegetation cleared and topsoil stockpiled at SW corner. Formation levels within ±25mm of design across completed zones.', NULL, 50,
 'https://picsum.photos/seed/leveling-cut-1/800/600'),

((SELECT activityid FROM activity WHERE name='Site Leveling' AND projectid=1 LIMIT 1),
 '2026-05-15 16:30:00', 'Final grading complete across entire site. Survey check confirms all levels within ±20mm tolerance. Surplus spoil loaded and removed off site. Area signed off by RE.', NULL, 100,
 'https://picsum.photos/seed/leveling-done-1/800/600'),

-- Inspection & QA ── 2 updates
((SELECT activityid FROM activity WHERE name='Inspection & QA' AND projectid=1 LIMIT 1),
 '2026-05-28 13:00:00', 'Hold point inspection completed on foundation and drainage works. 3 non-conformances raised: NCR-007 (concrete cover), NCR-008 (drainage gradient), NCR-009 (compaction test frequency). Contractor notified.', NULL, 50,
 'https://picsum.photos/seed/qa-inspect-1/800/600'),

((SELECT activityid FROM activity WHERE name='Inspection & QA' AND projectid=1 LIMIT 1),
 '2026-06-07 11:30:00', 'NCR-007, NCR-008 and NCR-009 all closed out and independently verified. Test certificates for concrete, drainage and compaction reviewed and filed. Final sign-off pending.', NULL, 90,
 'https://picsum.photos/seed/qa-closeout-1/800/600'),

-- Haul Road Construction ── 1 update (PAUSED)
((SELECT activityid FROM activity WHERE name='Haul Road Construction' AND projectid=1 LIMIT 1),
 '2026-05-28 15:00:00', 'First 200m of haul road route cleared and geotextile placed. Crushed rock sub-base layer placed and compacted to 150mm. Works paused due to heavy plant scheduling conflict with Earthwork Team B.', NULL, 50,
 'https://picsum.photos/seed/haulroad-sub-1/800/600'),

-- Bulk Earthwork ── 1 update
((SELECT activityid FROM activity WHERE name='Bulk Earthwork' AND projectid=1 LIMIT 1),
 '2026-05-30 16:00:00', 'Topsoil strip complete on Zones 1 and 2 — approx 3,500m² cleared. Bulk cut commenced on northern section. 1,200m³ excavated and hauled to fill placement area. Work continuing at pace.', NULL, 20,
 'https://picsum.photos/seed/earthwork-cut-1/800/600');


-- ─── STEP 2: Insert 3–4 photos per log entry ────────────────────────────────
-- Pattern: CROSS JOIN log entry subquery with a VALUES list of photo URLs
-- Each log is identified by activity name + partial description match

-- Foundation Excavation – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Foundation Excavation' AND projectid=1 LIMIT 1) AND description LIKE 'Topsoil stripping%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/excav-strip-1/800/600', 'Topsoil stripping in progress'),
    ('https://picsum.photos/seed/excav-strip-2/800/600', 'Spoil stockpile at SW corner'),
    ('https://picsum.photos/seed/excav-strip-3/800/600', 'Cleared formation surface')
  ) p(photourl, caption);

-- Foundation Excavation – Update 2
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Foundation Excavation' AND projectid=1 LIMIT 1) AND description LIKE 'Bulk excavation%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/excav-bulk-1/800/600', 'Bulk excavation southern half'),
    ('https://picsum.photos/seed/excav-bulk-2/800/600', 'Excavator working at formation level'),
    ('https://picsum.photos/seed/excav-bulk-3/800/600', 'Formation level survey peg'),
    ('https://picsum.photos/seed/excav-bulk-4/800/600', 'Cut face showing soil profile')
  ) p(photourl, caption);

-- Piling Work – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Piling Work' AND projectid=1 LIMIT 1) AND description LIKE 'Piling rig mobilised%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/piling-rig-1/800/600', 'Piling rig on Grid A'),
    ('https://picsum.photos/seed/piling-rig-2/800/600', 'Bore log recording at 6m depth'),
    ('https://picsum.photos/seed/piling-rig-3/800/600', 'Completed pile heads before trim')
  ) p(photourl, caption);

-- Piling Work – Update 2
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Piling Work' AND projectid=1 LIMIT 1) AND description LIKE 'Concrete placement%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/piling-pour-1/800/600', 'Concrete pour for pile P08'),
    ('https://picsum.photos/seed/piling-pour-2/800/600', 'Slump test result 110mm'),
    ('https://picsum.photos/seed/piling-pour-3/800/600', 'Completed pile P01–P08 row'),
    ('https://picsum.photos/seed/piling-pour-4/800/600', 'Cube samples taken at truck')
  ) p(photourl, caption);

-- Concrete Pouring – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1) AND description LIKE 'Formwork inspection%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/concrete-form-1/800/600', 'Formwork propping arrangement'),
    ('https://picsum.photos/seed/concrete-form-2/800/600', 'Rebar cover check with gauge'),
    ('https://picsum.photos/seed/concrete-form-3/800/600', 'Signed inspection checklist on board')
  ) p(photourl, caption);

-- Concrete Pouring – Update 2
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1) AND description LIKE 'Concrete pour completed%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/concrete-pour-1/800/600', 'Concrete truck discharging into pump'),
    ('https://picsum.photos/seed/concrete-pour-2/800/600', 'Vibration compaction in progress'),
    ('https://picsum.photos/seed/concrete-pour-3/800/600', 'Surface finishing team at work'),
    ('https://picsum.photos/seed/concrete-pour-4/800/600', 'Cube sample moulds labelled and set aside')
  ) p(photourl, caption);

-- Concrete Pouring – Update 3
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Concrete Pouring' AND projectid=1 LIMIT 1) AND description LIKE 'Curing period%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/concrete-cure-1/800/600', 'De-shuttered slab surface'),
    ('https://picsum.photos/seed/concrete-cure-2/800/600', 'Minor honeycombing at grid C4'),
    ('https://picsum.photos/seed/concrete-cure-3/800/600', 'Completed surface overall view')
  ) p(photourl, caption);

-- Electrical Conduit – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Electrical Conduit' AND projectid=1 LIMIT 1) AND description LIKE 'Conduit trenches%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/conduit-trench-1/800/600', 'Trench route E1 excavated'),
    ('https://picsum.photos/seed/conduit-trench-2/800/600', 'HDPE conduit jointing detail'),
    ('https://picsum.photos/seed/conduit-trench-3/800/600', 'Draw wire exit point at junction box')
  ) p(photourl, caption);

-- Drainage Installation – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Drainage Installation' AND projectid=1 LIMIT 1) AND description LIKE 'Main drainage trench%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/drainage-bed-1/800/600', 'Trench excavation with shoring'),
    ('https://picsum.photos/seed/drainage-bed-2/800/600', 'Pipe bedding sand layer placed'),
    ('https://picsum.photos/seed/drainage-bed-3/800/600', 'Gradient check with dumpy level')
  ) p(photourl, caption);

-- Drainage Installation – Update 2
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Drainage Installation' AND projectid=1 LIMIT 1) AND description LIKE '300mm UPVC%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/drainage-pipe-1/800/600', 'UPVC pipe being laid in trench'),
    ('https://picsum.photos/seed/drainage-pipe-2/800/600', 'Inspection chamber IC-01 under construction'),
    ('https://picsum.photos/seed/drainage-pipe-3/800/600', 'Haunching concrete around chamber'),
    ('https://picsum.photos/seed/drainage-pipe-4/800/600', 'Backfill compaction layers')
  ) p(photourl, caption);

-- Retaining Wall – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Retaining Wall' AND projectid=1 LIMIT 1) AND description LIKE 'Retaining wall footing%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/retwall-foot-1/800/600', 'Footing reinforcement cage'),
    ('https://picsum.photos/seed/retwall-foot-2/800/600', 'Concrete pour for footing'),
    ('https://picsum.photos/seed/retwall-foot-3/800/600', 'Cover block placement detail')
  ) p(photourl, caption);

-- Retaining Wall – Update 2
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Retaining Wall' AND projectid=1 LIMIT 1) AND description LIKE 'Wall reinforcement cage%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/retwall-cage-1/800/600', 'Full-height cage W1–W2'),
    ('https://picsum.photos/seed/retwall-cage-2/800/600', 'Pre-pour inspection walkthrough'),
    ('https://picsum.photos/seed/retwall-cage-3/800/600', 'Cage bracing detail at base'),
    ('https://picsum.photos/seed/retwall-cage-4/800/600', 'Wall sections W3–W4 overview')
  ) p(photourl, caption);

-- Structural Backfill – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Structural Backfill' AND projectid=1 LIMIT 1) AND description LIKE 'Layers 1 and 2%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/backfill-comp-1/800/600', 'Layer 1 compaction pass'),
    ('https://picsum.photos/seed/backfill-comp-2/800/600', 'DCP test being conducted'),
    ('https://picsum.photos/seed/backfill-comp-3/800/600', 'Roller on layer 2 compaction')
  ) p(photourl, caption);

-- Structural Backfill – Update 2
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Structural Backfill' AND projectid=1 LIMIT 1) AND description LIKE 'Final compaction%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/backfill-done-1/800/600', 'Final layer surface after compaction'),
    ('https://picsum.photos/seed/backfill-done-2/800/600', 'Engineer sign-off form on site board'),
    ('https://picsum.photos/seed/backfill-done-3/800/600', 'Completed backfill area overview')
  ) p(photourl, caption);

-- Waterproofing – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Waterproofing' AND projectid=1 LIMIT 1) AND description LIKE 'Surface preparation%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/waterproof-prep-1/800/600', 'Mechanical grinding of slab surface'),
    ('https://picsum.photos/seed/waterproof-prep-2/800/600', 'Primer coat applied to base slab'),
    ('https://picsum.photos/seed/waterproof-prep-3/800/600', 'Surface after priming — ready for membrane')
  ) p(photourl, caption);

-- Utility Trenching – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Utility Trenching' AND projectid=1 LIMIT 1) AND description LIKE 'Utility trenches%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/utility-trench-1/800/600', 'Route U1 trench open'),
    ('https://picsum.photos/seed/utility-trench-2/800/600', 'Sand bedding layer at 150mm depth'),
    ('https://picsum.photos/seed/utility-trench-3/800/600', 'MDPE pipe installation in progress'),
    ('https://picsum.photos/seed/utility-trench-4/800/600', 'As-built survey station U1-030')
  ) p(photourl, caption);

-- Slab Formwork – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Slab Formwork' AND projectid=1 LIMIT 1) AND description LIKE 'All props installed%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/formwork-prop-1/800/600', 'Prop grid installed and levelled'),
    ('https://picsum.photos/seed/formwork-prop-2/800/600', 'Primary beam and ledger system'),
    ('https://picsum.photos/seed/formwork-prop-3/800/600', 'Deck boards partial placement')
  ) p(photourl, caption);

-- Slab Formwork – Update 2
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Slab Formwork' AND projectid=1 LIMIT 1) AND description LIKE 'Full deck boarding%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/formwork-deck-1/800/600', 'Completed deck from above'),
    ('https://picsum.photos/seed/formwork-deck-2/800/600', 'Edge kicker and stop-end formwork'),
    ('https://picsum.photos/seed/formwork-deck-3/800/600', 'QA walk with checklist'),
    ('https://picsum.photos/seed/formwork-deck-4/800/600', 'Camber and level check underside')
  ) p(photourl, caption);

-- Column Reinforcement – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Column Reinforcement' AND projectid=1 LIMIT 1) AND description LIKE 'Column cages C1%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/colrebar-fab-1/800/600', 'Prefabricated cages on delivery vehicle'),
    ('https://picsum.photos/seed/colrebar-fab-2/800/600', 'Starter bar connection at footing'),
    ('https://picsum.photos/seed/colrebar-fab-3/800/600', 'Cover blocks fixed at 40mm')
  ) p(photourl, caption);

-- Column Reinforcement – Update 2
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Column Reinforcement' AND projectid=1 LIMIT 1) AND description LIKE 'Column cages C1–C6%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/colrebar-erect-1/800/600', 'C1 cage erected and braced'),
    ('https://picsum.photos/seed/colrebar-erect-2/800/600', 'Plumbing check with spirit level'),
    ('https://picsum.photos/seed/colrebar-erect-3/800/600', 'Link spacing and tie wire detail'),
    ('https://picsum.photos/seed/colrebar-erect-4/800/600', 'C1–C6 row overview')
  ) p(photourl, caption);

-- Road Formation – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Road Formation' AND projectid=1 LIMIT 1) AND description LIKE 'Subgrade scarified%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/roadform-grade-1/800/600', 'Subgrade scarification pass'),
    ('https://picsum.photos/seed/roadform-grade-2/800/600', 'Motor grader profiling camber'),
    ('https://picsum.photos/seed/roadform-grade-3/800/600', 'Nuclear densometer compaction check')
  ) p(photourl, caption);

-- Site Leveling – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Site Leveling' AND projectid=1 LIMIT 1) AND description LIKE 'Cut areas graded%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/leveling-cut-1/800/600', 'Northern section graded surface'),
    ('https://picsum.photos/seed/leveling-cut-2/800/600', 'Topsoil stockpile at SW corner'),
    ('https://picsum.photos/seed/leveling-cut-3/800/600', 'Survey reading at control peg')
  ) p(photourl, caption);

-- Site Leveling – Update 2
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Site Leveling' AND projectid=1 LIMIT 1) AND description LIKE 'Final grading%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/leveling-done-1/800/600', 'Final leveled site overview'),
    ('https://picsum.photos/seed/leveling-done-2/800/600', 'Survey check report on site board'),
    ('https://picsum.photos/seed/leveling-done-3/800/600', 'Spoil truck leaving site'),
    ('https://picsum.photos/seed/leveling-done-4/800/600', 'RE sign-off photo on completion')
  ) p(photourl, caption);

-- Inspection & QA – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Inspection & QA' AND projectid=1 LIMIT 1) AND description LIKE 'Hold point inspection%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/qa-inspect-1/800/600', 'Hold point inspection walkthrough'),
    ('https://picsum.photos/seed/qa-inspect-2/800/600', 'NCR-007 concrete cover measurement'),
    ('https://picsum.photos/seed/qa-inspect-3/800/600', 'Drainage gradient verification check')
  ) p(photourl, caption);

-- Inspection & QA – Update 2
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Inspection & QA' AND projectid=1 LIMIT 1) AND description LIKE 'NCR-007%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/qa-closeout-1/800/600', 'NCR-007 remediation completed'),
    ('https://picsum.photos/seed/qa-closeout-2/800/600', 'Test certificate binder on site desk'),
    ('https://picsum.photos/seed/qa-closeout-3/800/600', 'Engineer sign-off on close-out sheet'),
    ('https://picsum.photos/seed/qa-closeout-4/800/600', 'Final QA register updated')
  ) p(photourl, caption);

-- Haul Road Construction – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Haul Road Construction' AND projectid=1 LIMIT 1) AND description LIKE 'First 200m%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/haulroad-sub-1/800/600', 'Geotextile placement on cleared route'),
    ('https://picsum.photos/seed/haulroad-sub-2/800/600', 'Crushed rock sub-base being spread'),
    ('https://picsum.photos/seed/haulroad-sub-3/800/600', 'Roller compacting sub-base layer')
  ) p(photourl, caption);

-- Bulk Earthwork – Update 1
INSERT INTO activity_log_photos (logentryid, photourl, caption)
SELECT l.logentryid, p.photourl, p.caption FROM
  (SELECT logentryid FROM activity_log_entry WHERE activityid=(SELECT activityid FROM activity WHERE name='Bulk Earthwork' AND projectid=1 LIMIT 1) AND description LIKE 'Topsoil strip%' LIMIT 1) l
  CROSS JOIN (VALUES
    ('https://picsum.photos/seed/earthwork-cut-1/800/600', 'Excavator stripping Zone 1 topsoil'),
    ('https://picsum.photos/seed/earthwork-cut-2/800/600', 'Tipper truck loading at cut face'),
    ('https://picsum.photos/seed/earthwork-cut-3/800/600', 'Fill placement at receiving area'),
    ('https://picsum.photos/seed/earthwork-cut-4/800/600', 'Bulk cut face profile overview')
  ) p(photourl, caption);
