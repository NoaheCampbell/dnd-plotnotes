/*
  Warnings:

  - You are about to drop the column `linked_entity_id` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `linked_entity_name` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `linked_entity_type` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the `NotesOnNPCs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NotesOnNPCs" DROP CONSTRAINT "NotesOnNPCs_note_id_fkey";

-- DropForeignKey
ALTER TABLE "NotesOnNPCs" DROP CONSTRAINT "NotesOnNPCs_npc_id_fkey";

-- AlterTable
ALTER TABLE "notes" DROP COLUMN "linked_entity_id",
DROP COLUMN "linked_entity_name",
DROP COLUMN "linked_entity_type";

-- DropTable
DROP TABLE "NotesOnNPCs";

-- CreateTable
CREATE TABLE "EntityNoteLink" (
    "note_id" INTEGER NOT NULL,
    "linked_entity_id" INTEGER NOT NULL,
    "linked_entity_type" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityNoteLink_pkey" PRIMARY KEY ("note_id","linked_entity_id","linked_entity_type")
);

-- CreateIndex
CREATE INDEX "EntityNoteLink_linked_entity_id_linked_entity_type_idx" ON "EntityNoteLink"("linked_entity_id", "linked_entity_type");

-- AddForeignKey
ALTER TABLE "EntityNoteLink" ADD CONSTRAINT "EntityNoteLink_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
