ALTER TABLE notification
    ALTER COLUMN task_id DROP NOT NULL;

ALTER TABLE notification
    DROP CONSTRAINT IF EXISTS chk_notification_type;

ALTER TABLE notification
    ADD CONSTRAINT chk_notification_type CHECK (
      type IN (
               'TASK_ASSIGNED',
               'TASK_UPDATED',
               'COMMENT_ADDED',
               'DUE_SOON',
               'OVERDUE',
               'GENERAL',
               'TEAM_MEMBER_ADDED',
               'TEAM_MEMBER_REMOVED'
          )
      );