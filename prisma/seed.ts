/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from "@prisma/client";
import { importAWBWMap } from "server/tools/map-importer-utilities";
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
            // TODO i thought prisma could do this better with direct relationships and not ids...
            id: developmentUser.id,
          },
        },
      },
    });
  }

  /**
   * author: "Hellraider",
   * published: "05/11/2008",
   */

  importAWBWMap({
    name: "Caustic Finale",
    numberOfPlayers: 2,
    tileDataString: `
    34,3,1,5,1,1,34,3,2,2,3,7,9,2,34,26,28,111
    1,1,34,26,3,1,1,1,39,1,1,5,35,1,1,32,33,28
    3,7,27,9,34,1,3,1,3,1,42,26,3,1,3,1,30,27
    27,9,1,1,1,29,28,28,4,27,4,9,1,1,2,3,1,34
    16,34,3,2,32,30,30,28,37,16,34,1,1,3,1,1,1,2
    16,1,2,2,3,34,1,3,18,20,3,1,3,1,1,3,35,7
    35,1,1,1,1,21,15,15,20,1,1,34,1,1,7,27,4,9
    3,1,34,19,1,3,1,34,3,3,1,1,3,34,5,47,1,3
    1,1,3,16,1,1,1,2,2,2,3,1,18,15,26,1,1,2
    2,44,1,21,15,34,1,3,2,2,3,18,20,37,5,3,44,2
    3,1,1,34,1,1,3,1,3,2,34,16,3,28,28,1,1,3
    4,27,8,1,3,1,34,3,1,1,1,16,1,32,28,3,1,34
    2,16,28,29,29,2,1,1,34,1,3,21,34,32,31,1,1,1
    34,21,19,3,30,31,3,1,16,1,1,1,3,30,1,34,3,1
    1,3,21,19,3,31,1,34,21,15,19,1,2,2,1,7,27,4
    133,2,1,21,19,28,8,1,1,3,34,1,2,3,1,26,34,1
    110,105,2,3,21,15,26,1,39,1,1,1,1,34,7,9,1,3
    111,109,133,1,34,2,5,3,2,1,3,35,15,15,26,3,1,34
    `,
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
