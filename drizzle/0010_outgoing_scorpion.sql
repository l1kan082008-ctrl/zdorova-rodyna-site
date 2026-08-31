CREATE TABLE IF NOT EXISTS `admin_login_attempts` (
	`fingerprint` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`window_started_at` integer NOT NULL,
	`blocked_until` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `admin_login_attempts_updated_idx` ON `admin_login_attempts` (`updated_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `admin_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`idle_expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `admin_sessions_expiry_idx` ON `admin_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `public_submission_attempts` (
	`fingerprint` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`window_started_at` integer NOT NULL,
	`blocked_until` integer NOT NULL,
	`updated_at` integer NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `public_submission_attempts_updated_idx` ON `public_submission_attempts` (`updated_at`);
