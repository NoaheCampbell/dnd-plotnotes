-- CreateTable
CREATE TABLE "Flowchart" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flowchart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Flowchart_campaignId_idx" ON "Flowchart"("campaignId");

-- AddForeignKey
ALTER TABLE "Flowchart" ADD CONSTRAINT "Flowchart_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
