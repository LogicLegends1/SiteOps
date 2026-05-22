-- Migration: equipment_count_by_class
-- Creates a lightweight SQL function to return equipment counts grouped by class for a project

CREATE OR REPLACE FUNCTION public.equipment_count_by_class(p_project_id integer)
RETURNS TABLE(classid integer, class_name text, cnt bigint)
LANGUAGE sql STABLE AS $$
  SELECT
    i.classid::int AS classid,
    ec.name::text AS class_name,
    COUNT(*)::bigint AS cnt
  FROM equipment_item i
  LEFT JOIN equipment_class ec ON i.classid = ec.classid
  WHERE i.projectid = p_project_id
  GROUP BY i.classid, ec.name
  ORDER BY cnt DESC;
$$;

-- Grant execute to anon/role as required by your Supabase setup (uncomment and adjust if needed)
-- GRANT EXECUTE ON FUNCTION public.equipment_count_by_class(integer) TO anon;
