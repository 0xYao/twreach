/*
  Warnings:

  - You are about to drop the column `replied` on the `EngagementRecord` table. All the data in the column will be lost.
  - You are about to drop the column `withImage` on the `EngagementRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EngagementRecord" DROP COLUMN "replied",
DROP COLUMN "withImage",
ADD COLUMN     "imagePath" TEXT,
ADD COLUMN     "repliedAt" BIGINT;
