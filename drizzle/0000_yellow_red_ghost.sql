CREATE TABLE `work_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`occurred_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`project` text NOT NULL,
	`activity` text NOT NULL,
	`actor` text NOT NULL,
	`capability` text NOT NULL,
	`outcome` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`quality_score` integer,
	`cost_cents` integer DEFAULT 0 NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `work_events_owner_date_idx` ON `work_events` (`owner_email`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `work_events_owner_capability_idx` ON `work_events` (`owner_email`,`capability`);