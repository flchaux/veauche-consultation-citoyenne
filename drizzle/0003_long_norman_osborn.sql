ALTER TABLE `questions` MODIFY COLUMN `isRequired` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `responses` MODIFY COLUMN `isCompleted` int NOT NULL DEFAULT 0;