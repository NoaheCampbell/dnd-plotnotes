/*
  Warnings:

  - You are about to drop the column `description` on the `npcs` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `npcs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "npcs" DROP COLUMN "description",
DROP COLUMN "type",
ADD COLUMN     "age" TEXT,
ADD COLUMN     "alignment" TEXT,
ADD COLUMN     "backstory" TEXT,
ADD COLUMN     "bonds" TEXT,
ADD COLUMN     "class" TEXT,
ADD COLUMN     "eye_color" TEXT,
ADD COLUMN     "flaws" TEXT,
ADD COLUMN     "hair_color" TEXT,
ADD COLUMN     "height" TEXT,
ADD COLUMN     "ideals" TEXT,
ADD COLUMN     "personality_traits" TEXT,
ADD COLUMN     "race" TEXT,
ADD COLUMN     "skin_color" TEXT,
ADD COLUMN     "weight" TEXT;
