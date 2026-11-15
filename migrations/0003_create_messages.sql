
-- AppNook: Messages system
-- Supports feedback, app requests and developer submissions.

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    type TEXT NOT NULL CHECK (
        type IN (
            'feedback_support',
            'app_request',
            'developer_submission'
        )
    ),

    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,

    subject TEXT,
    message TEXT,

    -- Stores additional form-specific information as JSON.
    details_json TEXT NOT NULL DEFAULT '{}'
        CHECK (json_valid(details_json)),

    status TEXT NOT NULL DEFAULT 'new' CHECK (
        status IN ('new', 'in_progress', 'resolved')
    ),

    is_read INTEGER NOT NULL DEFAULT 0 CHECK (
        is_read IN (0, 1)
    ),

    admin_notes TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for admin message listing and filtering.
CREATE INDEX IF NOT EXISTS idx_messages_type
ON messages(type);

CREATE INDEX IF NOT EXISTS idx_messages_status
ON messages(status);

CREATE INDEX IF NOT EXISTS idx_messages_created_at
ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_messages_is_read
ON messages(is_read);
