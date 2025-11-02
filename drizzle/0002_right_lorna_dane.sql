DROP TABLE `forms`;--> statement-breakpoint
ALTER TABLE `questions` MODIFY COLUMN `isRequired` int NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `responses` MODIFY COLUMN `isCompleted` int NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `questions` DROP COLUMN `formId`;--> statement-breakpoint
ALTER TABLE `questions` DROP COLUMN `updatedAt`;--> statement-breakpoint
ALTER TABLE `responses` DROP COLUMN `formId`;