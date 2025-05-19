/*
  Warnings:

  - You are about to drop the column `location_name` on the `notes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notes" DROP COLUMN "location_name",
ADD COLUMN     "linked_entity_id" INTEGER,
ADD COLUMN     "linked_entity_name" TEXT,
ADD COLUMN     "linked_entity_type" TEXT;
