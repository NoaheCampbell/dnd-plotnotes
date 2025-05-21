/*
  Warnings:

  - You are about to drop the column `location` on the `encounters` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "encounters" DROP COLUMN "location",
ADD COLUMN     "location_id" INTEGER;

-- CreateTable
CREATE TABLE "NotesOnNPCs" (
    "npc_id" INTEGER NOT NULL,
    "note_id" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotesOnNPCs_pkey" PRIMARY KEY ("npc_id","note_id")
);

-- CreateTable
CREATE TABLE "_encountersTonpcs" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_encountersTonpcs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "NotesOnNPCs_note_id_idx" ON "NotesOnNPCs"("note_id");

-- CreateIndex
CREATE INDEX "_encountersTonpcs_B_index" ON "_encountersTonpcs"("B");

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotesOnNPCs" ADD CONSTRAINT "NotesOnNPCs_npc_id_fkey" FOREIGN KEY ("npc_id") REFERENCES "npcs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotesOnNPCs" ADD CONSTRAINT "NotesOnNPCs_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_encountersTonpcs" ADD CONSTRAINT "_encountersTonpcs_A_fkey" FOREIGN KEY ("A") REFERENCES "encounters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_encountersTonpcs" ADD CONSTRAINT "_encountersTonpcs_B_fkey" FOREIGN KEY ("B") REFERENCES "npcs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
