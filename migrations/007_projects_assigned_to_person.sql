-- ============================================================
-- SiteOps Database Schema Update 007
-- Projects assigned to a person
-- ============================================================

CREATE OR REPLACE FUNCTION get_projects_assigned_to_person(
  p_person_id INT
)
RETURNS TABLE (
  projectid INT,
  name VARCHAR,
  locationlongitude NUMERIC,
  locationlatitude NUMERIC,
  projectdiagram VARCHAR,
  status workflow_status
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.projectid,
    p.name,
    p.locationlongitude,
    p.locationlatitude,
    p.projectdiagram,
    p.status
  FROM project_assignment pa
  INNER JOIN project p
    ON p.projectid = pa.projectid
  WHERE pa.personid = p_person_id
  ORDER BY p.projectid;
END;
$$;