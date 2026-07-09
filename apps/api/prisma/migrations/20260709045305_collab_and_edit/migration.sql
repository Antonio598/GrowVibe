/*
  Warnings:

  - Added the required column `updatedAt` to the `FitnessLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" DATETIME,
    "deliveredAt" DATETIME,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deliverable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Deliverable_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "endedAt" DATETIME,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectComment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FitnessLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "weightKg" REAL,
    "measurements" TEXT,
    "routineCompliance" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FitnessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FitnessLog" ("createdAt", "date", "id", "measurements", "routineCompliance", "userId", "weightKg", "updatedAt") SELECT "createdAt", "date", "id", "measurements", "routineCompliance", "userId", "weightKg", "createdAt" FROM "FitnessLog";
DROP TABLE "FitnessLog";
ALTER TABLE "new_FitnessLog" RENAME TO "FitnessLog";
CREATE INDEX "FitnessLog_userId_idx" ON "FitnessLog"("userId");
CREATE INDEX "FitnessLog_date_idx" ON "FitnessLog"("date");
CREATE TABLE "new_Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Group_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Group" ("createdAt", "createdBy", "id", "name", "updatedAt") SELECT "createdAt", "createdBy", "id", "name", "createdAt" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE TABLE "new_GroupMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GroupMember" ("groupId", "id", "role", "userId") SELECT "groupId", "id", "role", "userId" FROM "GroupMember";
DROP TABLE "GroupMember";
ALTER TABLE "new_GroupMember" RENAME TO "GroupMember";
CREATE INDEX "GroupMember_userId_idx" ON "GroupMember"("userId");
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");
CREATE TABLE "new_Invite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "groupId" TEXT,
    "invitedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invite_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invite_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invite" ("createdAt", "email", "expiresAt", "groupId", "id", "invitedBy", "status", "token") SELECT "createdAt", "email", "expiresAt", "groupId", "id", "invitedBy", "status", "token" FROM "Invite";
DROP TABLE "Invite";
ALTER TABLE "new_Invite" RENAME TO "Invite";
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");
CREATE INDEX "Invite_groupId_idx" ON "Invite"("groupId");
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "type" TEXT NOT NULL DEFAULT 'ongoing',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATETIME,
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("createdAt", "groupId", "id", "name", "progress", "updatedAt") SELECT "createdAt", "groupId", "id", "name", "progress", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE INDEX "Project_groupId_idx" ON "Project"("groupId");
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" DATETIME,
    "projectId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("createdAt", "description", "dueDate", "id", "priority", "projectId", "status", "title", "updatedAt", "userId") SELECT "createdAt", "description", "dueDate", "id", "priority", "projectId", "status", "title", "updatedAt", "userId" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_userId_idx" ON "Task"("userId");
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "categoryId" TEXT,
    "date" DATETIME NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "categoryId", "createdAt", "date", "id", "note", "type", "userId", "updatedAt") SELECT "amount", "categoryId", "createdAt", "date", "id", "note", "type", "userId", "createdAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Deliverable_projectId_idx" ON "Deliverable"("projectId");

-- CreateIndex
CREATE INDEX "WorkSession_projectId_idx" ON "WorkSession"("projectId");

-- CreateIndex
CREATE INDEX "WorkSession_userId_idx" ON "WorkSession"("userId");

-- CreateIndex
CREATE INDEX "ProjectComment_projectId_idx" ON "ProjectComment"("projectId");
