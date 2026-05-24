-- ═══════════════════════════════════════════════════════════════════════════
-- Seed workers & workforce_team for 6 activities (project_id = 1)
-- Strategy:
--   1. Insert workers with teamid = NULL
--   2. Insert workforce_teams with team_lead_id = NULL
--   3. UPDATE workers to assign teamid
--   4. UPDATE workforce_teams to set team_lead_id (site engineer)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── STEP 1: Insert all workers ─────────────────────────────────────────────

INSERT INTO worker (name, discipline, role, experience, teamid, isavailable, createdat, project_id) VALUES

-- Excavation Team A (Foundation Excavation)
('James Perera',          'civil',      'Site Engineer',               8, NULL, true, NOW(), 1),
('Kamal Silva',           'civil',      'Excavator Operator',          6, NULL, true, NOW(), 1),
('Nimal Fernando',        'civil',      'Excavator Operator',          4, NULL, true, NOW(), 1),
('Suresh Dissanayake',    'civil',      'General Labourer',            3, NULL, true, NOW(), 1),
('Priya Rathnayake',      'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Sunil Abeywickrama',    'civil',      'Dozer Operator',              5, NULL, true, NOW(), 1),
('Kumara Wijesinghe',     'civil',      'General Labourer',            3, NULL, true, NOW(), 1),
('Malini Jayasooriya',    'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Dinesh Perera',         'civil',      'Excavator Operator',          5, NULL, true, NOW(), 1),
('Anula Fernando',        'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Ruwan Jayasinghe',      'civil',      'General Labourer',            3, NULL, true, NOW(), 1),
('Samantha Bandara',      'civil',      'General Labourer',            2, NULL, true, NOW(), 1),

-- Piling Team A (Piling Work)
('Sarah Johnson',         'civil',      'Site Engineer',               10, NULL, true, NOW(), 1),
('Rohan Gunawardena',     'civil',      'Piling Rig Operator',         7,  NULL, true, NOW(), 1),
('Chamara Wickramasinghe','civil',      'Piling Technician',           5,  NULL, true, NOW(), 1),
('Tharanga Mendis',       'civil',      'General Labourer',            3,  NULL, true, NOW(), 1),
('Kasun Perera',          'civil',      'Piling Rig Operator',         6,  NULL, true, NOW(), 1),
('Nimal Jayasinghe',      'civil',      'Piling Technician',           4,  NULL, true, NOW(), 1),
('Priyantha Fernando',    'civil',      'General Labourer',            2,  NULL, true, NOW(), 1),
('Samantha Kumara',       'civil',      'General Labourer',            3,  NULL, true, NOW(), 1),
('Ruwan Dissanayake',     'civil',      'Crane Operator',              5,  NULL, true, NOW(), 1),
('Mahesh Bandara',        'civil',      'General Labourer',            2,  NULL, true, NOW(), 1),
('Chathura Wijesinghe',   'civil',      'General Labourer',            3,  NULL, true, NOW(), 1),

-- Rebar Team A (Rebar Installation)
('Michael Chen',          'civil',      'Site Engineer',               9, NULL, true, NOW(), 1),
('Ajith Bandara',         'civil',      'Skilled Rebar Fixer',         6, NULL, true, NOW(), 1),
('Samantha Kumara',       'civil',      'Skilled Rebar Fixer',         4, NULL, true, NOW(), 1),
('Ruwan Herath',          'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Nimal Jayasinghe',      'civil',      'Skilled Rebar Fixer',         5, NULL, true, NOW(), 1),
('Kamal Silva',           'civil',      'Skilled Rebar Fixer',         3, NULL, true, NOW(), 1),
('Suresh Dissanayake',    'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Priya Rathnayake',      'civil',      'General Labourer',            3, NULL, true, NOW(), 1),
('Sunil Abeywickrama',    'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Kumara Wijesinghe',     'civil',      'General Labourer',            3, NULL, true, NOW(), 1),
('Malini Jayasooriya',    'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Dinesh Perera',         'civil',      'General Labourer',            3, NULL, true, NOW(), 1),
('Anula Fernando',        'civil',      'General Labourer',            2, NULL, true, NOW(), 1),

-- Concrete Team A (Concrete Pouring)
('Anna Williams',         'civil',      'Site Engineer',               7, NULL, true, NOW(), 1),
('Prasad Senanayake',     'civil',      'Skilled Concrete Finisher',   5, NULL, true, NOW(), 1),
('Chathura Rajapaksa',    'civil',      'Concrete Pump Operator',      6, NULL, true, NOW(), 1),
('Lakmal Wijesinghe',     'civil',      'Skilled Concrete Finisher',   4, NULL, true, NOW(), 1),
('Nadeesha Colombage',    'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Ruwan Herath',          'civil',      'Skilled Concrete Finisher',   5, NULL, true, NOW(), 1),
('Samantha Bandara',      'civil',      'General Labourer',            3, NULL, true, NOW(), 1),
('Sunil Abeywickrama',    'civil',      'Concrete Pump Operator',      4, NULL, true, NOW(), 1),
('Kumara Wijesinghe',     'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Malini Jayasooriya',    'civil',      'General Labourer',            3, NULL, true, NOW(), 1),
('Dinesh Perera',         'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Anula Fernando',        'civil',      'General Labourer',            3, NULL, true, NOW(), 1),
('Nimal Jayasinghe',      'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Kamal Silva',           'civil',      'General Labourer',            3, NULL, true, NOW(), 1),

-- Electrical Team A (Electrical Conduit)
('David Lee',             'electrical', 'Site Engineer',               8, NULL, true, NOW(), 1),
('Indika Samarasinghe',   'electrical', 'Electrician Operator',        6, NULL, true, NOW(), 1),
('Nuwan Pathirana',       'electrical', 'Electrical Technician',       5, NULL, true, NOW(), 1),
('Samantha Jayawardena',  'electrical', 'General Labourer',            2, NULL, true, NOW(), 1),
('Kasun Perera',          'electrical', 'Electrician Operator',        5, NULL, true, NOW(), 1),
('Nimal Jayasinghe',      'electrical', 'Electrical Technician',       4, NULL, true, NOW(), 1),
('Priyantha Fernando',    'electrical', 'General Labourer',            2, NULL, true, NOW(), 1),
('Samantha Kumara',       'electrical', 'General Labourer',            3, NULL, true, NOW(), 1),
('Ruwan Dissanayake',     'electrical', 'General Labourer',            2, NULL, true, NOW(), 1),
('Mahesh Bandara',        'electrical', 'General Labourer',            3, NULL, true, NOW(), 1),
('Chathura Wijesinghe',   'electrical', 'General Labourer',            2, NULL, true, NOW(), 1),
('Ruwan Herath',          'electrical', 'General Labourer',            3, NULL, true, NOW(), 1),

-- Drainage Team A (Drainage Installation)
('Fiona Brown',           'civil',      'Site Engineer',               9, NULL, true, NOW(), 1),
('Asanka De Silva',       'civil',      'Excavator Operator',          5, NULL, true, NOW(), 1),
('Buddhika Nanayakkara',  'civil',      'Skilled Pipe Layer',          6, NULL, true, NOW(), 1),
('Chaminda Liyanage',     'civil',      'Skilled Pipe Layer',          4, NULL, true, NOW(), 1),
('Hasini Abeysekara',     'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Ruwan Herath',          'civil',      'Excavator Operator',          5, NULL, true, NOW(), 1),
('Samantha Bandara',      'civil',      'Skilled Pipe Layer',          4, NULL, true, NOW(), 1),
('Sunil Abeywickrama',    'civil',      'Skilled Pipe Layer',          3, NULL, true, NOW(), 1),
('Kumara Wijesinghe',     'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Malini Jayasooriya',    'civil',      'General Labourer',            3, NULL, true, NOW(), 1),
('Dinesh Perera',         'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Anula Fernando',        'civil',      'General Labourer',            3, NULL, true, NOW(), 1),
('Nimal Jayasinghe',      'civil',      'General Labourer',            2, NULL, true, NOW(), 1),
('Kamal Silva',           'civil',      'General Labourer',            3, NULL, true, NOW(), 1),
('Suresh Dissanayake',    'civil',      'General Labourer',            2, NULL, true, NOW(), 1);


-- ─── STEP 2: Insert workforce teams (team_lead_id = NULL, activityid from subquery) ──

INSERT INTO workforce_team (teamname, activityid, createdat, team_lead_id) VALUES
('Excavation Team A',    (SELECT activityid FROM activity WHERE name = 'Foundation Excavation'   AND projectid = 1 LIMIT 1), NOW(), NULL),
('Piling Team A',        (SELECT activityid FROM activity WHERE name = 'Piling Work'             AND projectid = 1 LIMIT 1), NOW(), NULL),
('Rebar Team A',         (SELECT activityid FROM activity WHERE name = 'Rebar Installation'      AND projectid = 1 LIMIT 1), NOW(), NULL),
('Concrete Team A',      (SELECT activityid FROM activity WHERE name = 'Concrete Pouring'        AND projectid = 1 LIMIT 1), NOW(), NULL),
('Electrical Team A',    (SELECT activityid FROM activity WHERE name = 'Electrical Conduit'      AND projectid = 1 LIMIT 1), NOW(), NULL),
('Drainage Team A',      (SELECT activityid FROM activity WHERE name = 'Drainage Installation'   AND projectid = 1 LIMIT 1), NOW(), NULL);


-- ─── STEP 3: Assign workers to their teams ──────────────────────────────────

UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Excavation Team A'   LIMIT 1) WHERE name IN ('James Perera','Kamal Silva','Nimal Fernando','Suresh Dissanayake','Priya Rathnayake','Sunil Abeywickrama','Kumara Wijesinghe','Malini Jayasooriya','Dinesh Perera','Anula Fernando','Ruwan Jayasinghe','Samantha Bandara') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Piling Team A'        LIMIT 1) WHERE name IN ('Sarah Johnson','Rohan Gunawardena','Chamara Wickramasinghe','Tharanga Mendis','Kasun Perera','Nimal Jayasinghe','Priyantha Fernando','Samantha Kumara','Ruwan Dissanayake','Mahesh Bandara','Chathura Wijesinghe') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A'         LIMIT 1) WHERE name IN ('Michael Chen','Ajith Bandara','Samantha Kumara','Ruwan Herath','Nimal Jayasinghe','Kamal Silva','Suresh Dissanayake','Priya Rathnayake','Sunil Abeywickrama','Kumara Wijesinghe','Malini Jayasooriya','Dinesh Perera','Anula Fernando') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A'      LIMIT 1) WHERE name IN ('Anna Williams','Prasad Senanayake','Chathura Rajapaksa','Lakmal Wijesinghe','Nadeesha Colombage','Ruwan Herath','Samantha Bandara','Sunil Abeywickrama','Kumara Wijesinghe','Malini Jayasooriya','Dinesh Perera','Anula Fernando','Nimal Jayasinghe','Kamal Silva') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Electrical Team A'    LIMIT 1) WHERE name IN ('David Lee','Indika Samarasinghe','Nuwan Pathirana','Samantha Jayawardena','Kasun Perera','Nimal Jayasinghe','Priyantha Fernando','Samantha Kumara','Ruwan Dissanayake','Mahesh Bandara','Chathura Wijesinghe','Ruwan Herath') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Drainage Team A'      LIMIT 1) WHERE name IN ('Fiona Brown','Asanka De Silva','Buddhika Nanayakkara','Chaminda Liyanage','Hasini Abeysekara','Ruwan Herath','Samantha Bandara','Sunil Abeywickrama','Kumara Wijesinghe','Malini Jayasooriya','Dinesh Perera','Anula Fernando','Nimal Jayasinghe','Kamal Silva','Suresh Dissanayake') AND project_id = 1;


-- ─── STEP 4: Set team lead (site engineer) for each team ────────────────────

UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'James Perera'       AND project_id = 1 LIMIT 1) WHERE teamname = 'Excavation Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Sarah Johnson'      AND project_id = 1 LIMIT 1) WHERE teamname = 'Piling Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Michael Chen'       AND project_id = 1 LIMIT 1) WHERE teamname = 'Rebar Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Anna Williams'      AND project_id = 1 LIMIT 1) WHERE teamname = 'Concrete Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'David Lee'          AND project_id = 1 LIMIT 1) WHERE teamname = 'Electrical Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Fiona Brown'        AND project_id = 1 LIMIT 1) WHERE teamname = 'Drainage Team A';
