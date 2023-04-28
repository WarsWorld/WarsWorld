/*
  Warnings:

  - You are about to drop the column `twitchUserName` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeChannelId` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "twitchUserName",
DROP COLUMN "youtubeChannelId",
ALTER COLUMN "secret" SET DEFAULT false;
