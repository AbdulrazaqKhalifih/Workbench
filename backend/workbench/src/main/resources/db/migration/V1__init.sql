-- V1__init.sql

-- =========================
-- USERS / AUTH TABLES
-- =========================

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_status CHECK (
       status IN ('ACTIVE', 'DISABLED', 'LOCKED', 'PENDING_VERIFICATION')
       )
);


CREATE TABLE roles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_roles_name UNIQUE (name)
);


CREATE TABLE user_role (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_user_role_user
       FOREIGN KEY (user_id)
           REFERENCES users (id)
           ON DELETE CASCADE,

    CONSTRAINT fk_user_role_role
       FOREIGN KEY (role_id)
           REFERENCES roles (id)
           ON DELETE RESTRICT
);


CREATE TABLE refresh_token (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,

    user_agent VARCHAR(500),
    ip_address VARCHAR(100),
    device_name VARCHAR(100),

    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_refresh_token_hash UNIQUE (token_hash),

    CONSTRAINT fk_refresh_token_user
       FOREIGN KEY (user_id)
           REFERENCES users (id)
           ON DELETE CASCADE
);


CREATE TABLE password_reset_challenge (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL,
    code_hash VARCHAR(255) NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,

    attempt_count INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_password_reset_challenge_attempt_count
      CHECK (attempt_count >= 0),

    CONSTRAINT fk_password_reset_challenge_user
      FOREIGN KEY (user_id)
          REFERENCES users (id)
          ON DELETE CASCADE
);


CREATE TABLE password_reset_session (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL,
    session_hash VARCHAR(255) NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_password_reset_session_hash UNIQUE (session_hash),

    CONSTRAINT fk_password_reset_session_user
        FOREIGN KEY (user_id)
            REFERENCES users (id)
            ON DELETE CASCADE
);


-- =========================
-- TASK MANAGEMENT TABLES
-- =========================

CREATE TABLE team (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE team_member (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    team_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    role VARCHAR(30) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_team_member_team_user UNIQUE (team_id, user_id),

    CONSTRAINT chk_team_member_role CHECK (
     role IN ('ADMIN', 'MEMBER')
     ),

    CONSTRAINT fk_team_member_team
     FOREIGN KEY (team_id)
         REFERENCES team (id)
         ON DELETE CASCADE,

    CONSTRAINT fk_team_member_user
     FOREIGN KEY (user_id)
         REFERENCES users (id)
         ON DELETE CASCADE
);


CREATE TABLE project (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    team_id BIGINT NOT NULL,

    name VARCHAR(150) NOT NULL,

    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_project_team_name UNIQUE (team_id, name),

    CONSTRAINT chk_project_dates CHECK (
     end_date IS NULL OR start_date IS NULL OR end_date >= start_date
     ),

    CONSTRAINT fk_project_team
     FOREIGN KEY (team_id)
         REFERENCES team (id)
         ON DELETE CASCADE
);


CREATE TABLE task (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    project_id BIGINT NOT NULL,

    title VARCHAR(150) NOT NULL,
    description TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'TO_DO',

    assignee_id BIGINT,

    due_date TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_task_status CHECK (
      status IN ('TO_DO', 'IN_PROGRESS', 'DONE')
      ),

    CONSTRAINT fk_task_project
      FOREIGN KEY (project_id)
          REFERENCES project (id)
          ON DELETE CASCADE,

    CONSTRAINT fk_task_assignee
      FOREIGN KEY (assignee_id)
          REFERENCES users (id)
          ON DELETE SET NULL
);


CREATE TABLE comment (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    task_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    text TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_comment_task
     FOREIGN KEY (task_id)
         REFERENCES task (id)
         ON DELETE CASCADE,

    CONSTRAINT fk_comment_user
     FOREIGN KEY (user_id)
         REFERENCES users (id)
         ON DELETE CASCADE
);


CREATE TABLE notification (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,

    message VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL,

    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at TIMESTAMPTZ,

    CONSTRAINT chk_notification_type CHECK (
      type IN (
               'TASK_ASSIGNED',
               'TASK_UPDATED',
               'COMMENT_ADDED',
               'DUE_SOON',
               'OVERDUE',
               'GENERAL'
          )
      ),

    CONSTRAINT fk_notification_user
      FOREIGN KEY (user_id)
          REFERENCES users (id)
          ON DELETE CASCADE,

    CONSTRAINT fk_notification_task
      FOREIGN KEY (task_id)
          REFERENCES task (id)
          ON DELETE CASCADE
);


-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_user_role_role_id
    ON user_role (role_id);

CREATE INDEX idx_refresh_token_user_id
    ON refresh_token (user_id);

CREATE INDEX idx_password_reset_challenge_user_id
    ON password_reset_challenge (user_id);

CREATE INDEX idx_password_reset_session_user_id
    ON password_reset_session (user_id);

CREATE INDEX idx_team_member_user_id
    ON team_member (user_id);

CREATE INDEX idx_task_project_id
    ON task (project_id);

CREATE INDEX idx_task_assignee_id
    ON task (assignee_id);

CREATE INDEX idx_task_project_status
    ON task (project_id, status);

CREATE INDEX idx_comment_task_created_at
    ON comment (task_id, created_at);

CREATE INDEX idx_notification_user_sent_at
    ON notification (user_id, sent_at DESC);

CREATE INDEX idx_notification_unread_user_id
    ON notification (user_id)
    WHERE read_at IS NULL;


-- =========================
-- UPDATED_AT TRIGGER
-- =========================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();


CREATE TRIGGER trg_task_set_updated_at
    BEFORE UPDATE ON task
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();


-- =========================
-- DEFAULT GLOBAL ROLES
-- =========================

INSERT INTO roles (name, description)
VALUES
    ('USER', 'Default application user'),
    ('ADMIN', 'Application administrator'),
    ('MODERATOR', 'Application moderator')
    ON CONFLICT (name) DO NOTHING;
