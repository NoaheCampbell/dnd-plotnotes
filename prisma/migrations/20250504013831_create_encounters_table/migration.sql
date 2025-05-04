/*
  Warnings:

  - You are about to drop the column `campaign` on the `items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "items" DROP COLUMN "campaign",
ADD COLUMN     "campaign_id" INTEGER;

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "campaign_id" INTEGER;

-- CreateTable
CREATE TABLE "encounters" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER,
    "title" TEXT NOT NULL,
    "difficulty" TEXT,
    "location" TEXT,
    "creatures" INTEGER,

    CONSTRAINT "encounters_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
