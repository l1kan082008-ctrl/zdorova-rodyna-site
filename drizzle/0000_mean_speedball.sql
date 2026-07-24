CREATE TABLE `doctors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`specialty` text NOT NULL,
	`experience_years` integer,
	`branch` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`schedule` text DEFAULT '{}' NOT NULL,
	`photo_key` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
