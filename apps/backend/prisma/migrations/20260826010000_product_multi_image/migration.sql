ALTER TABLE "Product" ADD COLUMN "imageKeys" TEXT[] NOT NULL DEFAULT '{}';
UPDATE "Product" SET "imageKeys" = ARRAY["imageKey"] WHERE "imageKey" IS NOT NULL;
ALTER TABLE "Product" DROP COLUMN "imageKey";
