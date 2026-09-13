-- AlterTable
ALTER TABLE "post" ADD COLUMN     "deadline" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "post_deadline_isArchive_idx" ON "post"("deadline", "isArchive");
