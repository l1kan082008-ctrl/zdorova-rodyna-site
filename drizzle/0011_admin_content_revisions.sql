CREATE TABLE `admin_content_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`entity_label` text NOT NULL,
	`action` text NOT NULL,
	`snapshot_json` text NOT NULL,
	`changed_fields_json` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `admin_content_revisions_entity_idx` ON `admin_content_revisions` (`entity_type`,`entity_id`,`created_at`);
