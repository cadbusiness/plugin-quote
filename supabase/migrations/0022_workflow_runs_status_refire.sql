-- Autopilot: status-changed workflows must be able to start again on the same quote.
-- One-shot triggers (submitted / abandoned) stay single-run in the engine.
-- At most one running/waiting run per workflow+subject remains enforced.

alter table public.workflow_runs
  drop constraint if exists workflow_runs_workflow_id_subject_type_subject_id_key;

drop index if exists workflow_runs_workflow_id_subject_type_subject_id_key;

create unique index if not exists workflow_runs_active_subject_uidx
  on public.workflow_runs (workflow_id, subject_type, subject_id)
  where status in ('running', 'waiting');
