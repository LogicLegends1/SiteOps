-- Seed 6 activities for projectid = 1
-- Center: lat 6.927010, lng 79.858179 (Colombo, Sri Lanka area)
-- Activities spread ~0.5–1.5 km around the center point

INSERT INTO activity (projectid, progress, description, status, name, lat, lng, createdat, updatedat, deadline) VALUES

(1, 65,  'Excavation work for main building foundation blocks',      'IN_PROGRESS', 'Foundation Excavation',      6.9255, 79.8568, NOW(), NOW(), '2026-06-15'),
(1, 45,  'Concrete piling for load-bearing structural columns',      'IN_PROGRESS', 'Piling Work',                6.9285, 79.8595, NOW(), NOW(), '2026-06-20'),
(1,  0,  'Steel reinforcement bar placement for foundation slab',    'PENDING',     'Rebar Installation',         6.9262, 79.8602, NOW(), NOW(), '2026-06-28'),
(1, 100, 'Foundation concrete pour and 28-day curing cycle',         'COMPLETED',   'Concrete Pouring',           6.9290, 79.8570, NOW(), NOW(), '2026-05-20'),
(1, 30,  'Underground electrical conduit and draw-wire installation', 'IN_PROGRESS', 'Electrical Conduit',         6.9248, 79.8585, NOW(), NOW(), '2026-07-05'),
(1, 55,  'Stormwater and foul drainage pipe laying',                 'IN_PROGRESS', 'Drainage Installation',      6.9275, 79.8610, NOW(), NOW(), '2026-06-30');
