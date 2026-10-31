-- Run once on an existing MySQL database before deploying the new backend.
ALTER TABLE user_rice
  ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE AFTER is_active;

-- Existing seeded accounts are trusted; new registrations remain unverified.
UPDATE user_rice SET email_verified = TRUE WHERE email_verified = FALSE;

CREATE TABLE IF NOT EXISTS email_verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    otp_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_verification_user (user_id),
    CONSTRAINT fk_email_verification_user FOREIGN KEY (user_id)
      REFERENCES user_rice(id) ON DELETE CASCADE
);
