/*
  Warnings:

  - You are about to drop the `Kilometre` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Kilometre" DROP CONSTRAINT "Kilometre_userId_fkey";

-- DropTable
DROP TABLE "Kilometre";
