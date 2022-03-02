-- CreateEnum
CREATE TYPE "PreDMEngagement" AS ENUM ('FOLLOW_ONLY', 'LIKE_AND_REPLY');

-- CreateTable
CREATE TABLE "EngagementRecord" (
    "id" SERIAL NOT NULL,
    "repliedTweetsCount" INTEGER NOT NULL DEFAULT 0,
    "replied" BOOLEAN NOT NULL DEFAULT false,
    "preDMEngagement" "PreDMEngagement" NOT NULL DEFAULT E'FOLLOW_ONLY',
    "prospectUsername" TEXT NOT NULL,
    "messageVariationIndex" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "withImage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngagementRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prospect" (
    "username" TEXT NOT NULL,
    "userId" TEXT,
    "projectName" TEXT,
    "greetingName" TEXT,
    "preDMEngagement" "PreDMEngagement" NOT NULL DEFAULT E'FOLLOW_ONLY',
    "engagementId" INTEGER,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("username")
);

-- CreateIndex
CREATE UNIQUE INDEX "EngagementRecord_prospectUsername_key" ON "EngagementRecord"("prospectUsername");

-- AddForeignKey
ALTER TABLE "EngagementRecord" ADD CONSTRAINT "EngagementRecord_prospectUsername_fkey" FOREIGN KEY ("prospectUsername") REFERENCES "Prospect"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
