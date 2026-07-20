CREATE TABLE `arithmetic_race_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`room_code` text NOT NULL,
	`name` text NOT NULL,
	`participant_token` text NOT NULL,
	`joined_at` integer NOT NULL,
	`submitted_at` integer,
	`correct_count` integer,
	`total_count` integer,
	FOREIGN KEY (`room_code`) REFERENCES `arithmetic_races`(`room_code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `arithmetic_race_room_name_unique` ON `arithmetic_race_participants` (`room_code`,`name`);--> statement-breakpoint
CREATE TABLE `arithmetic_races` (
	`room_code` text PRIMARY KEY NOT NULL,
	`teacher_token` text NOT NULL,
	`worksheet_name` text NOT NULL,
	`worksheet_route` text NOT NULL,
	`seed` integer NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`created_at` integer NOT NULL,
	`started_at` integer
);
