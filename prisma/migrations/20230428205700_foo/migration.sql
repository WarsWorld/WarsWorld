/*
  Warnings:

  - The values [ready] on the enum `MatchStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `matchState` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `favouriteCOs` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `favouriteGames` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `favouriteUnits` on the `Player` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MatchStatus_new" AS ENUM ('setup', 'playing', 'finished');
ALTER TABLE "Match" ALTER COLUMN "status" TYPE "MatchStatus_new" USING ("status"::text::"MatchStatus_new");
ALTER TYPE "MatchStatus" RENAME TO "MatchStatus_old";
ALTER TYPE "MatchStatus_new" RENAME TO "MatchStatus";
DROP TYPE "MatchStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "matchState";

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "favouriteCOs",
DROP COLUMN "favouriteGames",
DROP COLUMN "favouriteUnits";
