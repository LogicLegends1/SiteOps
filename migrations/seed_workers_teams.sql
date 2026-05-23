-- ═══════════════════════════════════════════════════════════════════════════
-- Seed workers & workforce_team for 20 activities (project_id = 1)
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

-- Piling Team A (Piling Work)
('Sarah Johnson',         'civil',      'Site Engineer',               10, NULL, true, NOW(), 1),
('Rohan Gunawardena',     'civil',      'Piling Rig Operator',         7,  NULL, true, NOW(), 1),
('Chamara Wickramasinghe','civil',      'Piling Technician',           5,  NULL, true, NOW(), 1),
('Tharanga Mendis',       'civil',      'General Labourer',            3,  NULL, true, NOW(), 1),

-- Rebar Team A (Rebar Installation)
('Michael Chen',          'civil',      'Site Engineer',               9, NULL, true, NOW(), 1),
('Ajith Bandara',         'civil',      'Skilled Rebar Fixer',         6, NULL, true, NOW(), 1),
('Saman Kumara',          'civil',      'Skilled Rebar Fixer',         4, NULL, true, NOW(), 1),
('Ruwan Herath',          'civil',      'General Labourer',            2, NULL, true, NOW(), 1),

-- Concrete Team A (Concrete Pouring)
('Anna Williams',         'civil',      'Site Engineer',               7, NULL, true, NOW(), 1),
('Prasad Senanayake',     'civil',      'Skilled Concrete Finisher',   5, NULL, true, NOW(), 1),
('Chathura Rajapaksa',    'civil',      'Concrete Pump Operator',      6, NULL, true, NOW(), 1),
('Lakmal Wijesinghe',     'civil',      'Skilled Concrete Finisher',   4, NULL, true, NOW(), 1),
('Nadeesha Colombage',    'civil',      'General Labourer',            2, NULL, true, NOW(), 1),

-- Electrical Team A (Electrical Conduit)
('David Lee',             'electrical', 'Site Engineer',               8, NULL, true, NOW(), 1),
('Indika Samarasinghe',   'electrical', 'Electrician Operator',        6, NULL, true, NOW(), 1),
('Nuwan Pathirana',       'electrical', 'Electrical Technician',       5, NULL, true, NOW(), 1),
('Samantha Jayawardena',  'electrical', 'General Labourer',            2, NULL, true, NOW(), 1),

-- Drainage Team A (Drainage Installation)
('Fiona Brown',           'civil',      'Site Engineer',               9, NULL, true, NOW(), 1),
('Asanka De Silva',       'civil',      'Excavator Operator',          5, NULL, true, NOW(), 1),
('Buddhika Nanayakkara',  'civil',      'Skilled Pipe Layer',          6, NULL, true, NOW(), 1),
('Chaminda Liyanage',     'civil',      'Skilled Pipe Layer',          4, NULL, true, NOW(), 1),
('Hasini Abeysekara',     'civil',      'General Labourer',            2, NULL, true, NOW(), 1),

-- Road Team A (Road Sub-base)
('George Thomas',         'civil',      'Site Engineer',               11, NULL, true, NOW(), 1),
('Janaka Madhushanka',    'civil',      'Grader Operator',             7,  NULL, true, NOW(), 1),
('Kasun Ratnaweera',      'civil',      'Roller Operator',             5,  NULL, true, NOW(), 1),
('Lakmali Rajendra',      'civil',      'General Labourer',            2,  NULL, true, NOW(), 1),

-- Structural Team A (Retaining Wall)
('Helen Martinez',        'civil',      'Site Engineer',               8, NULL, true, NOW(), 1),
('Madushan Wickrama',     'civil',      'Skilled Rebar Fixer',         5, NULL, true, NOW(), 1),
('Nishan Fernando',       'civil',      'Skilled Formwork Carpenter',  6, NULL, true, NOW(), 1),
('Oshada Kumara',         'civil',      'Skilled Concrete Finisher',   4, NULL, true, NOW(), 1),
('Pavithra Seneviratne',  'civil',      'General Labourer',            3, NULL, true, NOW(), 1),

-- Backfill Team A (Structural Backfill)
('Ian Wilson',            'civil',      'Site Engineer',               7, NULL, true, NOW(), 1),
('Qasim Perera',          'civil',      'Roller Operator',             5, NULL, true, NOW(), 1),
('Rajitha Gunawardena',   'civil',      'Dozer Operator',              6, NULL, true, NOW(), 1),
('Sachini Wijeratne',     'civil',      'General Labourer',            2, NULL, true, NOW(), 1),

-- Waterproofing Team A (Waterproofing)
('Julia Anderson',        'civil',      'Site Engineer',               6, NULL, true, NOW(), 1),
('Thilina Silva',         'civil',      'Skilled Waterproof Applicator', 5, NULL, true, NOW(), 1),
('Upul Dissanayake',      'civil',      'Skilled Waterproof Applicator', 4, NULL, true, NOW(), 1),
('Vindya Mendis',         'civil',      'General Labourer',            2, NULL, true, NOW(), 1),

-- Utility Team A (Utility Trenching)
('Kevin Taylor',          'civil',      'Site Engineer',               9, NULL, true, NOW(), 1),
('Waruna Fernando',       'civil',      'Excavator Operator',          5, NULL, true, NOW(), 1),
('Xavier Rathnayake',     'civil',      'Skilled Pipe Layer',          4, NULL, true, NOW(), 1),
('Yasoda Bandara',        'civil',      'General Labourer',            2, NULL, true, NOW(), 1),

-- Compaction Team A (Compaction Work)
('Laura Davis',           'civil',      'Site Engineer',               7, NULL, true, NOW(), 1),
('Zeshan Jayasuriya',     'civil',      'Roller Operator',             5, NULL, true, NOW(), 1),
('Anura Herath',          'civil',      'Roller Operator',             4, NULL, true, NOW(), 1),
('Binara Senanayake',     'civil',      'General Labourer',            3, NULL, true, NOW(), 1),

-- Formwork Team A (Slab Formwork)
('Martin Clark',          'civil',      'Site Engineer',               10, NULL, true, NOW(), 1),
('Chamara Rajapaksa',     'civil',      'Skilled Formwork Carpenter',  7,  NULL, true, NOW(), 1),
('Dulani Wijesinghe',     'civil',      'Skilled Formwork Carpenter',  5,  NULL, true, NOW(), 1),
('Eranga Colombage',      'civil',      'Skilled Formwork Carpenter',  4,  NULL, true, NOW(), 1),
('Fathima Samarasinghe',  'civil',      'General Labourer',            2,  NULL, true, NOW(), 1),

-- Rebar Team B (Column Reinforcement)
('Nancy Robinson',        'civil',      'Site Engineer',               8, NULL, true, NOW(), 1),
('Gayan Pathirana',       'civil',      'Skilled Rebar Fixer',         6, NULL, true, NOW(), 1),
('Hiruni Jayawardena',    'civil',      'Skilled Rebar Fixer',         5, NULL, true, NOW(), 1),
('Isuru Madhushanka',     'civil',      'General Labourer',            2, NULL, true, NOW(), 1),

-- Concrete Team B (Beam Casting)
('Oliver Lewis',          'civil',      'Site Engineer',               9, NULL, true, NOW(), 1),
('Janani Ratnaweera',     'civil',      'Skilled Concrete Finisher',   5, NULL, true, NOW(), 1),
('Kavinda Rajendra',      'civil',      'Concrete Pump Operator',      6, NULL, true, NOW(), 1),
('Lasith Seneviratne',    'civil',      'General Labourer',            3, NULL, true, NOW(), 1),

-- Road Team B (Road Formation)
('Patricia Hall',         'civil',      'Site Engineer',               7, NULL, true, NOW(), 1),
('Mahesh Wijeratne',      'civil',      'Grader Operator',             5, NULL, true, NOW(), 1),
('Nadeeka Silva',         'civil',      'Roller Operator',             4, NULL, true, NOW(), 1),
('Oshini Dissanayake',    'civil',      'General Labourer',            2, NULL, true, NOW(), 1),

-- Earthwork Team A (Site Leveling)
('Robert Young',          'civil',      'Site Engineer',               12, NULL, true, NOW(), 1),
('Pradeep Mendis',        'civil',      'Dozer Operator',              8,  NULL, true, NOW(), 1),
('Qanita Fernando',       'civil',      'Grader Operator',             6,  NULL, true, NOW(), 1),
('Rasika Bandara',        'civil',      'General Labourer',            3,  NULL, true, NOW(), 1),

-- QA Team A (Inspection & QA)
('Susan King',            'qa',         'Site Engineer',               11, NULL, true, NOW(), 1),
('Samitha Jayasuriya',    'qa',         'QA Supervisor',               7,  NULL, true, NOW(), 1),
('Thusitha Herath',       'qa',         'QA Technician',               5,  NULL, true, NOW(), 1),
('Uma Senanayake',        'qa',         'Lab Technician',              4,  NULL, true, NOW(), 1),

-- Haul Road Team A (Haul Road Construction)
('Thomas Wright',         'civil',      'Site Engineer',               8, NULL, true, NOW(), 1),
('Vimukthi Rajapaksa',    'civil',      'Dozer Operator',              6, NULL, true, NOW(), 1),
('Wathsala Wijesinghe',   'civil',      'Grader Operator',             5, NULL, true, NOW(), 1),
('Xandria Colombage',     'civil',      'Roller Operator',             4, NULL, true, NOW(), 1),

-- Earthwork Team B (Bulk Earthwork)
('Ursula Scott',          'civil',      'Site Engineer',               10, NULL, true, NOW(), 1),
('Yasiru Samarasinghe',   'civil',      'Excavator Operator',          7,  NULL, true, NOW(), 1),
('Zara Pathirana',        'civil',      'Dozer Operator',              6,  NULL, true, NOW(), 1),
('Abhaya Jayawardena',    'civil',      'Tipper Truck Operator',       5,  NULL, true, NOW(), 1),
('Bimali Madhushanka',    'civil',      'General Labourer',            3,  NULL, true, NOW(), 1);


-- ─── STEP 2: Insert workforce teams (team_lead_id = NULL, activityid from subquery) ──

INSERT INTO workforce_team (teamname, activityid, createdat, team_lead_id) VALUES
('Excavation Team A',    (SELECT activityid FROM activity WHERE name = 'Foundation Excavation'   AND projectid = 1 LIMIT 1), NOW(), NULL),
('Piling Team A',        (SELECT activityid FROM activity WHERE name = 'Piling Work'             AND projectid = 1 LIMIT 1), NOW(), NULL),
('Rebar Team A',         (SELECT activityid FROM activity WHERE name = 'Rebar Installation'      AND projectid = 1 LIMIT 1), NOW(), NULL),
('Concrete Team A',      (SELECT activityid FROM activity WHERE name = 'Concrete Pouring'        AND projectid = 1 LIMIT 1), NOW(), NULL),
('Electrical Team A',    (SELECT activityid FROM activity WHERE name = 'Electrical Conduit'      AND projectid = 1 LIMIT 1), NOW(), NULL),
('Drainage Team A',      (SELECT activityid FROM activity WHERE name = 'Drainage Installation'   AND projectid = 1 LIMIT 1), NOW(), NULL),
('Road Team A',          (SELECT activityid FROM activity WHERE name = 'Road Sub-base'           AND projectid = 1 LIMIT 1), NOW(), NULL),
('Structural Team A',    (SELECT activityid FROM activity WHERE name = 'Retaining Wall'          AND projectid = 1 LIMIT 1), NOW(), NULL),
('Backfill Team A',      (SELECT activityid FROM activity WHERE name = 'Structural Backfill'     AND projectid = 1 LIMIT 1), NOW(), NULL),
('Waterproofing Team A', (SELECT activityid FROM activity WHERE name = 'Waterproofing'           AND projectid = 1 LIMIT 1), NOW(), NULL),
('Utility Team A',       (SELECT activityid FROM activity WHERE name = 'Utility Trenching'       AND projectid = 1 LIMIT 1), NOW(), NULL),
('Compaction Team A',    (SELECT activityid FROM activity WHERE name = 'Compaction Work'         AND projectid = 1 LIMIT 1), NOW(), NULL),
('Formwork Team A',      (SELECT activityid FROM activity WHERE name = 'Slab Formwork'           AND projectid = 1 LIMIT 1), NOW(), NULL),
('Rebar Team B',         (SELECT activityid FROM activity WHERE name = 'Column Reinforcement'    AND projectid = 1 LIMIT 1), NOW(), NULL),
('Concrete Team B',      (SELECT activityid FROM activity WHERE name = 'Beam Casting'            AND projectid = 1 LIMIT 1), NOW(), NULL),
('Road Team B',          (SELECT activityid FROM activity WHERE name = 'Road Formation'          AND projectid = 1 LIMIT 1), NOW(), NULL),
('Earthwork Team A',     (SELECT activityid FROM activity WHERE name = 'Site Leveling'           AND projectid = 1 LIMIT 1), NOW(), NULL),
('QA Team A',            (SELECT activityid FROM activity WHERE name = 'Inspection & QA'         AND projectid = 1 LIMIT 1), NOW(), NULL),
('Haul Road Team A',     (SELECT activityid FROM activity WHERE name = 'Haul Road Construction'  AND projectid = 1 LIMIT 1), NOW(), NULL),
('Earthwork Team B',     (SELECT activityid FROM activity WHERE name = 'Bulk Earthwork'          AND projectid = 1 LIMIT 1), NOW(), NULL);


-- ─── STEP 3: Assign workers to their teams ──────────────────────────────────

UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Excavation Team A'   LIMIT 1) WHERE name IN ('James Perera','Kamal Silva','Nimal Fernando','Suresh Dissanayake','Priya Rathnayake') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Piling Team A'        LIMIT 1) WHERE name IN ('Sarah Johnson','Rohan Gunawardena','Chamara Wickramasinghe','Tharanga Mendis') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team A'         LIMIT 1) WHERE name IN ('Michael Chen','Ajith Bandara','Saman Kumara','Ruwan Herath') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team A'      LIMIT 1) WHERE name IN ('Anna Williams','Prasad Senanayake','Chathura Rajapaksa','Lakmal Wijesinghe','Nadeesha Colombage') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Electrical Team A'    LIMIT 1) WHERE name IN ('David Lee','Indika Samarasinghe','Nuwan Pathirana','Samantha Jayawardena') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Drainage Team A'      LIMIT 1) WHERE name IN ('Fiona Brown','Asanka De Silva','Buddhika Nanayakkara','Chaminda Liyanage','Hasini Abeysekara') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Road Team A'          LIMIT 1) WHERE name IN ('George Thomas','Janaka Madhushanka','Kasun Ratnaweera','Lakmali Rajendra') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Structural Team A'    LIMIT 1) WHERE name IN ('Helen Martinez','Madushan Wickrama','Nishan Fernando','Oshada Kumara','Pavithra Seneviratne') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Backfill Team A'      LIMIT 1) WHERE name IN ('Ian Wilson','Qasim Perera','Rajitha Gunawardena','Sachini Wijeratne') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Waterproofing Team A' LIMIT 1) WHERE name IN ('Julia Anderson','Thilina Silva','Upul Dissanayake','Vindya Mendis') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Utility Team A'       LIMIT 1) WHERE name IN ('Kevin Taylor','Waruna Fernando','Xavier Rathnayake','Yasoda Bandara') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Compaction Team A'    LIMIT 1) WHERE name IN ('Laura Davis','Zeshan Jayasuriya','Anura Herath','Binara Senanayake') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Formwork Team A'      LIMIT 1) WHERE name IN ('Martin Clark','Chamara Rajapaksa','Dulani Wijesinghe','Eranga Colombage','Fathima Samarasinghe') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Rebar Team B'         LIMIT 1) WHERE name IN ('Nancy Robinson','Gayan Pathirana','Hiruni Jayawardena','Isuru Madhushanka') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Concrete Team B'      LIMIT 1) WHERE name IN ('Oliver Lewis','Janani Ratnaweera','Kavinda Rajendra','Lasith Seneviratne') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Road Team B'          LIMIT 1) WHERE name IN ('Patricia Hall','Mahesh Wijeratne','Nadeeka Silva','Oshini Dissanayake') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Earthwork Team A'     LIMIT 1) WHERE name IN ('Robert Young','Pradeep Mendis','Qanita Fernando','Rasika Bandara') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'QA Team A'            LIMIT 1) WHERE name IN ('Susan King','Samitha Jayasuriya','Thusitha Herath','Uma Senanayake') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Haul Road Team A'     LIMIT 1) WHERE name IN ('Thomas Wright','Vimukthi Rajapaksa','Wathsala Wijesinghe','Xandria Colombage') AND project_id = 1;
UPDATE worker SET teamid = (SELECT teamid FROM workforce_team WHERE teamname = 'Earthwork Team B'     LIMIT 1) WHERE name IN ('Ursula Scott','Yasiru Samarasinghe','Zara Pathirana','Abhaya Jayawardena','Bimali Madhushanka') AND project_id = 1;


-- ─── STEP 4: Set team lead (site engineer) for each team ────────────────────

UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'James Perera'       AND project_id = 1 LIMIT 1) WHERE teamname = 'Excavation Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Sarah Johnson'      AND project_id = 1 LIMIT 1) WHERE teamname = 'Piling Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Michael Chen'       AND project_id = 1 LIMIT 1) WHERE teamname = 'Rebar Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Anna Williams'      AND project_id = 1 LIMIT 1) WHERE teamname = 'Concrete Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'David Lee'          AND project_id = 1 LIMIT 1) WHERE teamname = 'Electrical Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Fiona Brown'        AND project_id = 1 LIMIT 1) WHERE teamname = 'Drainage Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'George Thomas'      AND project_id = 1 LIMIT 1) WHERE teamname = 'Road Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Helen Martinez'     AND project_id = 1 LIMIT 1) WHERE teamname = 'Structural Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Ian Wilson'         AND project_id = 1 LIMIT 1) WHERE teamname = 'Backfill Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Julia Anderson'     AND project_id = 1 LIMIT 1) WHERE teamname = 'Waterproofing Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Kevin Taylor'       AND project_id = 1 LIMIT 1) WHERE teamname = 'Utility Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Laura Davis'        AND project_id = 1 LIMIT 1) WHERE teamname = 'Compaction Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Martin Clark'       AND project_id = 1 LIMIT 1) WHERE teamname = 'Formwork Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Nancy Robinson'     AND project_id = 1 LIMIT 1) WHERE teamname = 'Rebar Team B';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Oliver Lewis'       AND project_id = 1 LIMIT 1) WHERE teamname = 'Concrete Team B';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Patricia Hall'      AND project_id = 1 LIMIT 1) WHERE teamname = 'Road Team B';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Robert Young'       AND project_id = 1 LIMIT 1) WHERE teamname = 'Earthwork Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Susan King'         AND project_id = 1 LIMIT 1) WHERE teamname = 'QA Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Thomas Wright'      AND project_id = 1 LIMIT 1) WHERE teamname = 'Haul Road Team A';
UPDATE workforce_team SET team_lead_id = (SELECT id FROM worker WHERE name = 'Ursula Scott'       AND project_id = 1 LIMIT 1) WHERE teamname = 'Earthwork Team B';
