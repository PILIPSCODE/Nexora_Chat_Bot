/*
  Warnings:

  - You are about to drop the column `limitToken` on the `Subcribtion` table. All the data in the column will be lost.
  - You are about to drop the column `tokenUsage` on the `UserSubcribtion` table. All the data in the column will be lost.
  - Added the required column `initialToken` to the `Subcribtion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenRemain` to the `UserSubcribtion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subcribtion" DROP COLUMN "limitToken",
ADD COLUMN     "initialToken" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserSubcribtion" DROP COLUMN "tokenUsage",
ADD COLUMN     "tokenRemain" INTEGER NOT NULL;
