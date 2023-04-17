/*
  Warnings:

  - You are about to drop the column `name` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Post` table. All the data in the column will be lost.
  - Added the required column `playerId` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserState" AS ENUM ('active', 'disabled', 'banned');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'moderator');

-- CreateEnum
CREATE TYPE "CO" AS ENUM ('adder');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('pipe_runner');

-- CreateEnum
CREATE TYPE "Game" AS ENUM ('advance_dating_by_web');

-- CreateEnum
CREATE TYPE "Achievement" AS ENUM ('field_training_complete', 'win_streak', 'underdog', 'handicap', 'lightning_strike', 'destroyer', 'fixer', 'gold_rush', 'champion', 'grizzled_yet');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('ready', 'playing', 'finished');

-- CreateEnum
CREATE TYPE "LeagueType" AS ENUM ('standard', 'fog', 'high_funds', 'dual_league', 'standard_teams', 'broken');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "name",
DROP COLUMN "source",
ADD COLUMN     "playerId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "state" "UserState" NOT NULL DEFAULT 'active',
    "role" "Role",
    "name" TEXT NOT NULL,
    "discordId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clan" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Clan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "secret" BOOLEAN NOT NULL,
    "mmr" INTEGER NOT NULL DEFAULT 1300,
    "top_mmr" INTEGER NOT NULL DEFAULT 1300,
    "youtubeChannelId" TEXT,
    "twitchUserName" TEXT,
    "userId" TEXT,
    "preferences" JSONB,
    "achievements" "Achievement"[],
    "favourite_COs" "CO"[],
    "favourite_units" "Unit"[],
    "favourite_games" "Game"[],
    "matchId" TEXT,
    "matchConsentId" TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Map" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "matchId" TEXT,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notes" (
    "content" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "playerId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,

    CONSTRAINT "Notes_pkey" PRIMARY KEY ("playerId","matchId")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "leagueType" "LeagueType",
    "status" "MatchStatus" NOT NULL,
    "matchState" JSONB NOT NULL,
    "chatIsPublic" BOOLEAN NOT NULL DEFAULT false,
    "mapId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_member" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "_member_AB_unique" ON "_member"("A", "B");

-- CreateIndex
CREATE INDEX "_member_B_index" ON "_member"("B");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clan" ADD CONSTRAINT "Clan_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_matchConsentId_fkey" FOREIGN KEY ("matchConsentId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_member" ADD CONSTRAINT "_member_A_fkey" FOREIGN KEY ("A") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_member" ADD CONSTRAINT "_member_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
