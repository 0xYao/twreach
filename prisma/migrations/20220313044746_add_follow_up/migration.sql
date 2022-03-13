-- CreateTable
CREATE TABLE "FollowUp" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "imagePath" TEXT,
    "variationIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "prospectUsername" TEXT NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_prospectUsername_fkey" FOREIGN KEY ("prospectUsername") REFERENCES "Prospect"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
