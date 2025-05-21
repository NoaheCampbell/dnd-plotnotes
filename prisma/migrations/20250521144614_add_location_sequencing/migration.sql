/*
  Warnings:

  - A unique constraint covering the columns `[next_location_id]` on the table `locations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "next_location_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "locations_next_location_id_key" ON "locations"("next_location_id");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_next_location_id_fkey" FOREIGN KEY ("next_location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
