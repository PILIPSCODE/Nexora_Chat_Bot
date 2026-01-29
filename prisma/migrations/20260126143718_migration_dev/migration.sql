/*
  Warnings:

  - You are about to drop the `Feature` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `limitToken` to the `Subcribtion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenUsage` to the `UserSubcribtion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Feature" DROP CONSTRAINT "Feature_subcribtionId_fkey";

-- AlterTable
ALTER TABLE "Subcribtion" ADD COLUMN     "limitToken" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserSubcribtion" ADD COLUMN     "tokenUsage" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."Feature";
