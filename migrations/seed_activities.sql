-- Seed 20 activities for projectid = 1
-- Center: lat 6.927010, lng 79.858179 (Colombo, Sri Lanka area)
-- Activities spread ~0.5–1.5 km around the center point

INSERT INTO activity (projectid, progress, description, status, name, lat, lng, createdat, updatedat, deadline) VALUES

(1, 65,  'Excavation work for main building foundation blocks',      'IN_PROGRESS', 'Foundation Excavation',      6.9255, 79.8568, NOW(), NOW(), '2026-06-15'),
(1, 45,  'Concrete piling for load-bearing structural columns',      'IN_PROGRESS', 'Piling Work',                6.9285, 79.8595, NOW(), NOW(), '2026-06-20'),
(1,  0,  'Steel reinforcement bar placement for foundation slab',    'PENDING',     'Rebar Installation',         6.9262, 79.8602, NOW(), NOW(), '2026-06-28'),
(1, 100, 'Foundation concrete pour and 28-day curing cycle',         'COMPLETED',   'Concrete Pouring',           6.9290, 79.8570, NOW(), NOW(), '2026-05-20'),
(1, 30,  'Underground electrical conduit and draw-wire installation', 'IN_PROGRESS', 'Electrical Conduit',         6.9248, 79.8585, NOW(), NOW(), '2026-07-05'),
(1, 55,  'Stormwater and foul drainage pipe laying',                 'IN_PROGRESS', 'Drainage Installation',      6.9275, 79.8610, NOW(), NOW(), '2026-06-30'),
(1,  0,  'Road sub-base aggregate compaction layer',                 'PENDING',     'Road Sub-base',              6.9238, 79.8598, NOW(), NOW(), '2026-07-15'),
(1, 70,  'Reinforced concrete retaining wall construction',          'IN_PROGRESS', 'Retaining Wall',             6.9300, 79.8555, NOW(), NOW(), '2026-06-22'),
(1, 100, 'Structural backfill with granular material compaction',    'COMPLETED',   'Structural Backfill',        6.9245, 79.8565, NOW(), NOW(), '2026-05-25'),
(1, 25,  'Bitumen waterproofing membrane application on slab',       'PAUSED',      'Waterproofing',              6.9315, 79.8590, NOW(), NOW(), '2026-07-10'),
(1, 40,  'Utility service trench excavation and bedding',            'IN_PROGRESS', 'Utility Trenching',          6.9268, 79.8622, NOW(), NOW(), '2026-07-01'),
(1,  0,  'Subgrade compaction testing and approval',                 'PENDING',     'Compaction Work',            6.9228, 79.8578, NOW(), NOW(), '2026-07-20'),
(1, 80,  'Timber and steel formwork erection for ground floor slab', 'IN_PROGRESS', 'Slab Formwork',              6.9295, 79.8535, NOW(), NOW(), '2026-06-18'),
(1, 60,  'Column vertical rebar cage assembly and tying',            'IN_PROGRESS', 'Column Reinforcement',       6.9258, 79.8545, NOW(), NOW(), '2026-06-25'),
(1,  0,  'Primary beam concrete casting and prop staging',           'PENDING',     'Beam Casting',               6.9312, 79.8610, NOW(), NOW(), '2026-07-25'),
(1, 35,  'Road formation grading and shaping to design levels',      'IN_PROGRESS', 'Road Formation',             6.9240, 79.8615, NOW(), NOW(), '2026-07-08'),
(1, 100, 'Site-wide leveling and spoil disposal',                    'COMPLETED',   'Site Leveling',              6.9278, 79.8558, NOW(), NOW(), '2026-05-15'),
(1, 90,  'Quality inspection and hold-point sign-off for Zone R',    'IN_PROGRESS', 'Inspection & QA',            6.9302, 79.8578, NOW(), NOW(), '2026-06-10'),
(1, 50,  'Temporary haul road construction for heavy plant access',  'PAUSED',      'Haul Road Construction',     6.9252, 79.8628, NOW(), NOW(), '2026-06-05'),
(1, 20,  'Bulk earthwork cut and fill to formation level',           'IN_PROGRESS', 'Bulk Earthwork',             6.9322, 79.8540, NOW(), NOW(), '2026-07-30');
