/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { Prisma, PrismaClient } from "@prisma/client";
import { developmentPlayerNamePrefix } from "server/trpc/middleware/player";

const prisma = new PrismaClient();

const developmentPlayerNames = Array(4)
  .fill(1)
  .map((_, i) => `${developmentPlayerNamePrefix}${i}`);

async function main() {
  const developmentUser = await prisma.user.create({
    data: {
      name: "development_user",
    },
  });

  for (const name of developmentPlayerNames) {
    await prisma.player.create({
      data: {
        name,
        User: {
          connect: {
            id: developmentUser.id, // TODO i thought prisma could do this better with direct relationships and not ids...
          },
        },
      },
    });
  }

  await prisma.wWMap.create({
    data: {
      name: "Caustic Finale",
      tiles: [],
      numberOfPlayers: 2,
    },
  });
  // TODO create match, make easy getting in
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
