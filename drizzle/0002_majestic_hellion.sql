ALTER TABLE `doctors` ADD `biography` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `doctors` ADD `patient_groups` text DEFAULT '[]' NOT NULL;