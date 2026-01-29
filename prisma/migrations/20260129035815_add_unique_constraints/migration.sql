/*
  Warnings:

  - A unique constraint covering the columns `[userIntegrationId,type]` on the table `ContentIntegration` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."ContentIntegration_userIntegrationId_type_idx";

-- CreateIndex
CREATE UNIQUE INDEX "ContentIntegration_userIntegrationId_type_key" ON "ContentIntegration"("userIntegrationId", "type");
