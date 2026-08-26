-- Add imageKeys array column with empty default
ALTER TABLE "Portfolio" ADD COLUMN "imageKeys" TEXT[] NOT NULL DEFAULT '{}';

-- Migrate existing imageKey values into the array
UPDATE "Portfolio" SET "imageKeys" = ARRAY["imageKey"] WHERE "imageKey" IS NOT NULL;

-- Drop the old column
ALTER TABLE "Portfolio" DROP COLUMN "imageKey";
