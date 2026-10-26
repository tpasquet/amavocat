CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`locale` text,
	`translation_group` text NOT NULL,
	`slug` text NOT NULL,
	`publish_at` integer,
	`data` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `entries_type_locale_slug_idx` ON `entries` (`type`,`locale`,`slug`);--> statement-breakpoint
CREATE INDEX `entries_type_publish_at_idx` ON `entries` (`type`,`publish_at`);--> statement-breakpoint
CREATE INDEX `entries_translation_group_idx` ON `entries` (`translation_group`);