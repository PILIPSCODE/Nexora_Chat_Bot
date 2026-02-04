/*
  Warnings:

  - You are about to drop the column `data` on the `BOT` table. All the data in the column will be lost.
  - You are about to alter the column `userId` on the `BOT` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(225)`.
  - You are about to alter the column `agentId` on the `BOT` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(225)`.

*/
-- DropForeignKey
ALTER TABLE "BOT" DROP CONSTRAINT "BOT_agentId_fkey";

-- DropForeignKey
ALTER TABLE "BOT" DROP CONSTRAINT "BOT_userId_fkey";

-- AlterTable
ALTER TABLE "BOT" DROP COLUMN "data",
ADD COLUMN     "contentIntegrationId" VARCHAR(225),
ALTER COLUMN "userId" SET DATA TYPE VARCHAR(225),
ALTER COLUMN "agentId" SET DATA TYPE VARCHAR(225);

-- AddForeignKey
ALTER TABLE "BOT" ADD CONSTRAINT "BOT_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BOT" ADD CONSTRAINT "BOT_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "UserAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
