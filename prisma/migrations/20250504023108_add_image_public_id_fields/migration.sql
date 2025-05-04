-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "image_public_id" TEXT;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "image_public_id" TEXT;

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "map_public_id" TEXT;

-- AlterTable
ALTER TABLE "npcs" ADD COLUMN     "image_public_id" TEXT;
