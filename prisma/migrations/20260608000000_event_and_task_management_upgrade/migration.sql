ALTER TABLE "Project" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "Project" ADD COLUMN "endDate" TIMESTAMP(3);

UPDATE "Project"
SET
  "startDate" = "eventDate",
  "endDate" = "eventDate";

ALTER TABLE "Project" ALTER COLUMN "startDate" SET NOT NULL;
ALTER TABLE "Project" ALTER COLUMN "endDate" SET NOT NULL;

CREATE TABLE "TaskAssignment" (
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("taskId","userId")
);

INSERT INTO "TaskAssignment" ("taskId", "userId")
SELECT "id", "assigneeId"
FROM "Task";

CREATE INDEX "Project_startDate_idx" ON "Project"("startDate");
CREATE INDEX "Project_endDate_idx" ON "Project"("endDate");
CREATE INDEX "TaskAssignment_userId_idx" ON "TaskAssignment"("userId");

ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX "Project_eventDate_idx";
DROP INDEX "Task_assigneeId_idx";

ALTER TABLE "Task" DROP CONSTRAINT "Task_assigneeId_fkey";
ALTER TABLE "Task" DROP COLUMN "assigneeId";
ALTER TABLE "Project" DROP COLUMN "eventDate";
