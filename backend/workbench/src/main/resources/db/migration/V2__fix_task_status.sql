ALTER TABLE task DROP CONSTRAINT IF EXISTS chk_task_status;
ALTER TABLE task ADD CONSTRAINT chk_task_status CHECK (
    status IN ('TODO', 'IN_PROGRESS', 'DONE')
);
