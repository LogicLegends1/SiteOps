-- Create equipment_requests table for storing equipment requests per activity
-- Run this migration against your Postgres DB (e.g. with psql or your migration tool)
CREATE TABLE IF NOT EXISTS public.equipment_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    projectid INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    details TEXT NOT NULL,
    quantity INTEGER DEFAULT NULL,
    requested_by INTEGER DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'requested',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS equipment_requests_activity_idx ON public.equipment_requests(activity_id);
CREATE INDEX IF NOT EXISTS equipment_requests_project_idx ON public.equipment_requests(projectid);
