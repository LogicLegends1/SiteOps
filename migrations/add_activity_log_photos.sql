-- Migration: add activity_log_photos table for multi-image support per log entry
-- Run this BEFORE seed_activity_logs.sql

CREATE TABLE IF NOT EXISTS activity_log_photos (
  photoid     int4        PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  logentryid  int4        NOT NULL REFERENCES activity_log_entry(logentryid) ON DELETE CASCADE,
  photourl    varchar     NOT NULL,
  caption     varchar,
  createdat   timestamp   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_photos_logentryid ON activity_log_photos(logentryid);
