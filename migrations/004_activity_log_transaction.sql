-- ============================================================
-- SiteOps Database Schema Update 003
-- Atomic activity log creation + activity progress update
-- ============================================================

CREATE OR REPLACE FUNCTION create_activity_log_and_update_progress(
  p_activity_id INT,
  p_description VARCHAR,
  p_site_engineer_id INT,
  p_updated_progress INT DEFAULT NULL,
  p_evidence_photo VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  logentryid INT,
  activityid INT,
  "timestamp" TIMESTAMP,
  description VARCHAR,
  siteengineerid INT,
  updatedprogress INT,
  evidencephoto VARCHAR,
  activityprogress INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_progress INT;
  v_new_progress INT;
BEGIN
  -- Lock row to ensure consistent update within transaction
  SELECT a.progress
  INTO v_current_progress
  FROM activity a
  WHERE a.activityid = p_activity_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Activity not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF p_description IS NULL THEN
    RAISE EXCEPTION 'Description is required'
      USING ERRCODE = '22023';
  END IF;

  IF p_updated_progress IS NOT NULL AND (p_updated_progress < 0 OR p_updated_progress > 100) THEN
    RAISE EXCEPTION 'updatedProgress must be between 0 and 100'
      USING ERRCODE = '22003';
  END IF;

  v_new_progress := COALESCE(p_updated_progress, v_current_progress);

  UPDATE activity a
  SET progress = v_new_progress
  WHERE a.activityid = p_activity_id;

  RETURN QUERY
  WITH inserted_log AS (
    INSERT INTO activity_log_entry (
      activityid,
      description,
      siteengineerid,
      updatedprogress,
      evidencephoto
    )
    VALUES (
      p_activity_id,
      btrim(p_description),
      p_site_engineer_id,
      p_updated_progress,
      p_evidence_photo
    )
    RETURNING
      activity_log_entry.logentryid,
      activity_log_entry.activityid,
      activity_log_entry.timestamp,
      activity_log_entry.description,
      activity_log_entry.siteengineerid,
      activity_log_entry.updatedprogress,
      activity_log_entry.evidencephoto
  )
  SELECT
    inserted_log.logentryid,
    inserted_log.activityid,
    inserted_log.timestamp AS "timestamp",
    inserted_log.description,
    inserted_log.siteengineerid,
    inserted_log.updatedprogress,
    inserted_log.evidencephoto,
    v_new_progress AS activityprogress
  FROM inserted_log;
END;
$$;
