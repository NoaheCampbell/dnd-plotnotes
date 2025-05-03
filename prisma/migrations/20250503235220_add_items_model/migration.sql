-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "rarity" TEXT,
    "campaign" TEXT,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);
