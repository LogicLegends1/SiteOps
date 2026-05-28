-- Track who created crew/equipment requests and allow crew request notes.
ALTER TABLE public.activity_worker_requirements
  ADD COLUMN IF NOT EXISTS request_notes TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS requested_by INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.equipment_requests
  ADD COLUMN IF NOT EXISTS requested_by INTEGER DEFAULT NULL;

CREATE INDEX IF NOT EXISTS activity_worker_requirements_requested_by_idx
  ON public.activity_worker_requirements(requested_by);

CREATE INDEX IF NOT EXISTS equipment_requests_requested_by_idx
  ON public.equipment_requests(requested_by);
