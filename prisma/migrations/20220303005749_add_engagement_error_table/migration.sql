-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "engagementErrorId" INTEGER;

-- CreateTable
CREATE TABLE "EngagementErrorRecord" (
    "id" SERIAL NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "prospectUsername" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngagementErrorRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EngagementErrorRecord_prospectUsername_key" ON "EngagementErrorRecord"("prospectUsername");

-- AddForeignKey
ALTER TABLE "EngagementErrorRecord" ADD CONSTRAINT "EngagementErrorRecord_prospectUsername_fkey" FOREIGN KEY ("prospectUsername") REFERENCES "Prospect"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
