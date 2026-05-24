-- ═══════════════════════════════════════════════════════════════════════════
-- Seed workers & workforce_team for 6 activities (project_id = 1)
-- Strategy:
--   1. Insert workforce_teams first (team_lead_id = NULL)
--   2. Insert workers directly with teamid from subquery (no name collisions)
--   3. UPDATE workforce_teams to set team_lead_id (site engineer)
-- NOTE: All worker names are UNIQUE to avoid UPDATE-by-name conflicts.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── STEP 1: Insert workforce teams ────────────────────────────────────────

INSERT INTO workforce_team (teamname, activityid, createdat, team_lead_id) VALUES
('Excavation Team A',    (SELECT activityid FROM activity WHERE name = 'Foundation Excavation'   AND projectid = 1 LIMIT 1), NOW(), NULL),
('Piling Team A',        (SELECT activityid FROM activity WHERE name = 'Piling Work'             AND projectid = 1 LIMIT 1), NOW(), NULL),
('Rebar Team A',         (SELECT activityid FROM activity WHERE name = 'Rebar Installation'      AND projectid = 1 LIMIT 1), NOW(), NULL),
('Concrete Team A',      (SELECT activityid FROM activity WHERE name = 'Concrete Pouring'        AND projectid = 1 LIMIT 1), NOW(), NULL),
('Electrical Team A',    (SELECT activityid FROM activity WHERE name = 'Electrical Conduit'      AND projectid = 1 LIMIT 1), NOW(), NULL),
('Drainage Team A',      (SELECT activityid FROM activity WHERE name = 'Drainage Installation'   AND projectid = 1 LIMIT 1), NOW(), NULL);


-- ─── STEP 2: Insert workers directly with teamid ───────────────────────────

-- Excavation Team A (Foundation Excavation) — 12 workers
INSERT INTO worker (name, discipline, role, experience, teamid, isavailable, createdat, project_id) VALUES
('James Perera',          'civil', 'Site Engineer',        8, (SELECT teamid FROM workforce_team WHERE teamname = 'Excavation Team A' LIMIT 1), true, NOW(), 1),
('Kamal Silva',           'civil', 'Excavator Operator',   6, (SELECT teamid FROM workforce_team WHERE teamname = 'Excavation Team A' LIMIT 1), true, NOW(), 1),
('Nimal Fernando',        'civil', 'Excavator Operator',   4, (SELECT teamid FROM workforce_team WHERE teamname = 'Excavation Team A' LIMIT 1), true, NOW(), 1),
('Suresh Dissanayake',    'civil', 'Dozer Operator',       5, (SELECT teamid FROM workforce_team WHERE teamname = 'Excavation Team A' LIMIT 1), true, NOW(), 1),
('Priya Rathnayake',      'civil', 'General Labourer',     2, (SELECT teamid FROM workforce_team WHERE teamname = 'Excavation Team A' LIMIT 1), true, NOW(), 1),
('Sunil Abeywickrama',    'civil', 'Dozer Operator',       5, (SELECT teamid FROM workforce_team WHERE teamname = 'Excavation Team A' LIMIT 1), true, NOW(), 1),
('Ruwan Jayasinghe',      'civil', 'General Labourer',     3, (SELECT teamid FROM workforce_team WHERE teamname = 'Excavation Team A' LIMIT 1), true, NOW(), 1),
('Samantha Bandara',      'civil', 'General Labourer',     2, (SELECT teamid FROM workforce_team WHERE teamname = 'Excavation Team A' LIMIT 1), true, NOW(), 1),
('Tharindu Wickrama',     'civil', 'Excavator Operator',   5, (SELECT teamid FROM workforce_team WHERE teamname = 'Excavation Team A' LIMIT 1), true, NOW(), 1),
('Jagath Kumara',         'civil', 'General Labourer',     3, (SELECT teamid FROM workforce_team WHERE teamname = 'Excavation Team A' LIMIT 1), true, NOW(), 1),
('Manjula Herath',        'civil', 'General Labourer',     2, (SELECT teamid FROM workforce_team WHERE teamname = 'Excavation Team A' LIMIT 1), true, NOW(), 1),
('Upul Chandrasena',      'civil', 'Dump Truck Driver',    4, (SELECT teamid FROM workforce_team WHERE teamname = 'Excavation Team A' LIMIT 1), true, NOW(), 1);

-- Piling Team A (Piling Work) — 11 workers
INSERT INTO worker (name, discipline, role, experience, teamid, isavailable, createdat, project_id) VALUES
('Sarah Johnson',           'civil', 'Site Engineer',        10, (SELECT teamid FROM workforce_team WHERE teamname = 'Piling Team A' LIMIT 1), true, NOW(), 1),
('Rohan Gunawardena',       'civil', 'Piling Rig Operator',  7, (SELECT teamid FROM workforce_team WHERE teamname = 'Piling Team A' LIMIT 1), true, NOW(), 1),
('Chamara Wickramasinghe',  'civil', 'Piling Technician',    5, (SELECT teamid FROM workforce_team WHERE teamname = 'Piling Team A' LIMIT 1), true, NOW(), 1),
('Tharanga Mendis',         'civil', 'General Labourer',     3, (SELECT teamid FROM workforce_team WHERE teamname = 'Piling Team A' LIMIT 1), true, NOW(), 1),
('Kasun Perera',            'civil', 'Piling Rig Operator',  6, (SELECT teamid FROM workforce_team WHERE teamname = 'Piling Team A' LIMIT 1), true, NOW(), 1),
('Nimal Jayasinghe',        'civil', 'Piling Technician',    4, (SELECT teamid FROM workforce_team WHERE teamname = 'Piling Team A' LIMIT 1), true, NOW(), 1),
('Priyantha Fernando',      'civil', 'General Labourer',     2, (SELECT teamid FROM workforce_team WHERE teamname = 'Piling Team A' LIMIT 1), true, NOW(), 1),
('Ruwan Dissanayake',       'civil', 'Crane Operator',       5, (SELECT teamid FROM workforce_team WHERE teamname = 'Piling Team A' LIMIT 1), true, NOW(), 1),
('Nalaka Sirisena',         'civil', 'Piling Technician',    3, (SELECT teamid FROM workforce_team WHERE teamname = 'Piling Team A' LIMIT 1), true, NOW(), 1),
('Gamini Rathnasiri',       'civil', 'General Labourer',     2, (SELECT teamid FROM workforce_team WHERE teamname = 'Piling Team A' LIMIT 1), true, NOW(), 1),
('Asitha Weerasinghe',      'civil', 'General Labourer',     3, (SELECT teamid FROM workforce_team WHERE teamname = 'Piling Team A' LIMIT 1), true, NOW(), 1);

-- Rebar Team A (Rebar Installation) — 14 workers
INSERT INTO worker (name, discipline, role, experience, teamid, isavailable, createdat, project_id) VALUES
('Michael Chen',         'civil', 'Site Engineer',        9, (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A' LIMIT 1), true, NOW(), 1),
('Ajith Bandara',        'civil', 'Skilled Rebar Fixer',  6, (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A' LIMIT 1), true, NOW(), 1),
('Lakshan Kumara',       'civil', 'Skilled Rebar Fixer',  4, (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A' LIMIT 1), true, NOW(), 1),
('Ruwan Herath',         'civil', 'Skilled Rebar Fixer',  5, (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A' LIMIT 1), true, NOW(), 1),
('Dinuka Pathirana',     'civil', 'Skilled Rebar Fixer',  3, (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A' LIMIT 1), true, NOW(), 1),
('Harsha Jayawardena',   'civil', 'Skilled Rebar Fixer',  4, (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A' LIMIT 1), true, NOW(), 1),
('Kumara Wijesinghe',    'civil', 'General Labourer',     3, (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A' LIMIT 1), true, NOW(), 1),
('Malini Jayasooriya',   'civil', 'General Labourer',     2, (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A' LIMIT 1), true, NOW(), 1),
('Saman Priyankara',     'civil', 'Skilled Rebar Fixer',  5, (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A' LIMIT 1), true, NOW(), 1),
('Wasantha Perera',      'civil', 'General Labourer',     2, (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A' LIMIT 1), true, NOW(), 1),
('Kelum Dissanayake',    'civil', 'General Labourer',     3, (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A' LIMIT 1), true, NOW(), 1),
('Namal Rajapaksa',      'civil', 'Crane Operator',       6, (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A' LIMIT 1), true, NOW(), 1),
('Sanjeewa Bandara',     'civil', 'General Labourer',     2, (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A' LIMIT 1), true, NOW(), 1),
('Heshan Karunaratne',   'civil', 'General Labourer',     3, (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A' LIMIT 1), true, NOW(), 1);

-- Concrete Team A (Concrete Pouring) — 13 workers
INSERT INTO worker (name, discipline, role, experience, teamid, isavailable, createdat, project_id) VALUES
('Anna Williams',          'civil', 'Site Engineer',             7, (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A' LIMIT 1), true, NOW(), 1),
('Prasad Senanayake',      'civil', 'Skilled Concrete Finisher', 5, (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A' LIMIT 1), true, NOW(), 1),
('Chathura Rajapaksa',     'civil', 'Concrete Pump Operator',    6, (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A' LIMIT 1), true, NOW(), 1),
('Lakmal Wijesinghe',      'civil', 'Skilled Concrete Finisher', 4, (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A' LIMIT 1), true, NOW(), 1),
('Nadeesha Colombage',     'civil', 'General Labourer',          2, (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A' LIMIT 1), true, NOW(), 1),
('Chandima Samarakoon',    'civil', 'Skilled Concrete Finisher', 5, (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A' LIMIT 1), true, NOW(), 1),
('Thilak Gunasekara',      'civil', 'Concrete Pump Operator',    4, (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A' LIMIT 1), true, NOW(), 1),
('Niranjan De Mel',        'civil', 'General Labourer',          3, (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A' LIMIT 1), true, NOW(), 1),
('Isuru Wimalasena',       'civil', 'Vibrator Operator',         3, (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A' LIMIT 1), true, NOW(), 1),
('Ravindu Amarasinghe',    'civil', 'General Labourer',          2, (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A' LIMIT 1), true, NOW(), 1),
('Dulshan Perera',         'civil', 'Skilled Concrete Finisher', 4, (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A' LIMIT 1), true, NOW(), 1),
('Charith Mendis',         'civil', 'General Labourer',          2, (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A' LIMIT 1), true, NOW(), 1),
('Buddhika Ranasinghe',    'civil', 'General Labourer',          3, (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A' LIMIT 1), true, NOW(), 1);

-- Electrical Team A (Electrical Conduit) — 10 workers
INSERT INTO worker (name, discipline, role, experience, teamid, isavailable, createdat, project_id) VALUES
('David Lee',              'electrical', 'Site Engineer',          8, (SELECT teamid FROM workforce_team WHERE teamname = 'Electrical Team A' LIMIT 1), true, NOW(), 1),
('Indika Samarasinghe',    'electrical', 'Electrician Operator',   6, (SELECT teamid FROM workforce_team WHERE teamname = 'Electrical Team A' LIMIT 1), true, NOW(), 1),
('Nuwan Pathirana',        'electrical', 'Electrical Technician',  5, (SELECT teamid FROM workforce_team WHERE teamname = 'Electrical Team A' LIMIT 1), true, NOW(), 1),
('Samantha Jayawardena',   'electrical', 'Electrician Operator',   4, (SELECT teamid FROM workforce_team WHERE teamname = 'Electrical Team A' LIMIT 1), true, NOW(), 1),
('Mahesh Bandara',         'electrical', 'Electrician Operator',   5, (SELECT teamid FROM workforce_team WHERE teamname = 'Electrical Team A' LIMIT 1), true, NOW(), 1),
('Chathura Wijesinghe',    'electrical', 'Electrical Technician',  4, (SELECT teamid FROM workforce_team WHERE teamname = 'Electrical Team A' LIMIT 1), true, NOW(), 1),
('Lasantha Perera',        'electrical', 'General Labourer',       2, (SELECT teamid FROM workforce_team WHERE teamname = 'Electrical Team A' LIMIT 1), true, NOW(), 1),
('Dilshan Wickramasinghe', 'electrical', 'General Labourer',       3, (SELECT teamid FROM workforce_team WHERE teamname = 'Electrical Team A' LIMIT 1), true, NOW(), 1),
('Hasitha Gunawardena',    'electrical', 'Cable Jointer',          5, (SELECT teamid FROM workforce_team WHERE teamname = 'Electrical Team A' LIMIT 1), true, NOW(), 1),
('Ranga Samaraweera',      'electrical', 'General Labourer',       2, (SELECT teamid FROM workforce_team WHERE teamname = 'Electrical Team A' LIMIT 1), true, NOW(), 1);

-- Drainage Team A (Drainage Installation) — 12 workers
INSERT INTO worker (name, discipline, role, experience, teamid, isavailable, createdat, project_id) VALUES
('Fiona Brown',            'civil', 'Site Engineer',        9, (SELECT teamid FROM workforce_team WHERE teamname = 'Drainage Team A' LIMIT 1), true, NOW(), 1),
('Asanka De Silva',        'civil', 'Excavator Operator',   5, (SELECT teamid FROM workforce_team WHERE teamname = 'Drainage Team A' LIMIT 1), true, NOW(), 1),
('Buddhika Nanayakkara',   'civil', 'Skilled Pipe Layer',   6, (SELECT teamid FROM workforce_team WHERE teamname = 'Drainage Team A' LIMIT 1), true, NOW(), 1),
('Chaminda Liyanage',      'civil', 'Skilled Pipe Layer',   4, (SELECT teamid FROM workforce_team WHERE teamname = 'Drainage Team A' LIMIT 1), true, NOW(), 1),
('Hasini Abeysekara',      'civil', 'General Labourer',     2, (SELECT teamid FROM workforce_team WHERE teamname = 'Drainage Team A' LIMIT 1), true, NOW(), 1),
('Dinesh Perera',          'civil', 'Excavator Operator',   5, (SELECT teamid FROM workforce_team WHERE teamname = 'Drainage Team A' LIMIT 1), true, NOW(), 1),
('Anula Fernando',         'civil', 'Skilled Pipe Layer',   4, (SELECT teamid FROM workforce_team WHERE teamname = 'Drainage Team A' LIMIT 1), true, NOW(), 1),
('Sandun Ratnayake',       'civil', 'General Labourer',     3, (SELECT teamid FROM workforce_team WHERE teamname = 'Drainage Team A' LIMIT 1), true, NOW(), 1),
('Prabath Weerasekara',    'civil', 'Skilled Pipe Layer',   5, (SELECT teamid FROM workforce_team WHERE teamname = 'Drainage Team A' LIMIT 1), true, NOW(), 1),
('Niroshan Alwis',         'civil', 'General Labourer',     2, (SELECT teamid FROM workforce_team WHERE teamname = 'Drainage Team A' LIMIT 1), true, NOW(), 1),
('Gayan Madushanka',       'civil', 'General Labourer',     3, (SELECT teamid FROM workforce_team WHERE teamname = 'Drainage Team A' LIMIT 1), true, NOW(), 1),
('Thusitha Karunanayake',  'civil', 'Dump Truck Driver',    4, (SELECT teamid FROM workforce_team WHERE teamname = 'Drainage Team A' LIMIT 1), true, NOW(), 1);


-- ─── STEP 3: Set team lead (site engineer) for each team ────────────────────

UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'James Perera'       AND project_id = 1 LIMIT 1) WHERE teamname = 'Excavation Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Sarah Johnson'      AND project_id = 1 LIMIT 1) WHERE teamname = 'Piling Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Michael Chen'       AND project_id = 1 LIMIT 1) WHERE teamname = 'Rebar Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Anna Williams'      AND project_id = 1 LIMIT 1) WHERE teamname = 'Concrete Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'David Lee'          AND project_id = 1 LIMIT 1) WHERE teamname = 'Electrical Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Fiona Brown'        AND project_id = 1 LIMIT 1) WHERE teamname = 'Drainage Team A';
