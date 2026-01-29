/*
  Warnings:

  - You are about to drop the column `apiKey` on the `UserAgent` table. All the data in the column will be lost.
  - You are about to drop the column `llm` on the `UserAgent` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `UserAgent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserAgent" DROP COLUMN "apiKey",
DROP COLUMN "llm",
DROP COLUMN "model";
