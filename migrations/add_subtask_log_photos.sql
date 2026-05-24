-- Migration: multi-photo support for subtask log entries
-- Run BEFORE seed_subtask_logs.sql

CREATE TABLE IF NOT EXISTS subtask_log_photos (
  photoid     int4        PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  logentryid  int4        NOT NULL REFERENCES subtask_log_entry(logentryid) ON DELETE CASCADE,
  photourl    varchar     NOT NULL,
  caption     varchar,
  createdat   timestamp   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subtask_log_photos_logentryid ON subtask_log_photos(logentryid);
