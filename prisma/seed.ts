/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import matter from "gray-matter";
import { hashPassword } from "server/hashPassword";
import { importAWBWMap } from "server/tools/map-importer-utilities";
import { developmentPlayerNamePrefix as Prefix } from "server/trpc/middleware/player";
import { articleSchema } from "shared/schemas/article";

const prisma = new PrismaClient();

const developmentPlayerNames = ["Grimm Guy", "Incuggarch", "Master Chief Z", "Dev Player 4"].map(
  (name) => `${Prefix} ${name}`,
);

const news = [
  "Good Girl Lash",
  "Maintenance 2025-05-19",
  "Master League",
  "Welcome back Flak! Patch 1.01",
];

const guides = [
  "Resource Management",
  "Create or join a match",
  "Enter the Global League",
  "Fog of War 2",
  "Fog of War",
  "Indirect Units",
  "Map Awareness",
  "Master the Basics",
  "Play in a tournament",
  "Tech-ups",
];

async function seedArticles(articles: string[], type: string, authorId: string) {
  for (const article of articles) {
    const file = await fs.readFile(
      `src/frontend/utils/articles/${type.toLowerCase()}/${article}.md`,
      "utf-8",
    );
    const metaData = matter(file);
    metaData.data.title = article;
    metaData.data.type = type.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    metaData.data.category = metaData.data.category.toLowerCase();
    metaData.data.body = file;

    const articleData = articleSchema.parse(metaData.data);

    await prisma.article.create({
      data: {
        title: articleData.title,
        description: articleData.description,
        Authors: {
          create: [
            {
              author: {
                connect: {
                  id: authorId,
                },
              },
            },
          ],
        },
        thumbnail: articleData.thumbnail,
        category: articleData.category,
        body: articleData.body,
      },
    });
  }
}

async function main() {
  const hashedPassword = await hashPassword("secret");

  const { id: userId } = await prisma.user.create({
    data: {
      name: "development_user",
      password: hashedPassword,
      email: "development@example.com",
    },
  });

  const devPlayers = await Promise.all(
    developmentPlayerNames.map((name) => prisma.player.create({ data: { name, userId } })),
  );

  await seedArticles(news, "News", devPlayers[0].id);
  await seedArticles(guides, "Guide", devPlayers[1].id);

  /**
   * author: "Hellraider",
   * published: "05/11/2008",
   */

  const causticFinaleDBMap = await importAWBWMap({
    name: "Caustic Finale",
    numberOfPlayers: 2,
    tileDataString: `
    34,3,1,5,1,1,34,3,2,2,3,7,9,2,34,26,28,111
    1,1,34,26,3,1,1,1,39,1,1,5,35,1,1,32,33,28
    3,7,27,9,34,1,3,1,3,1,42,26,3,1,3,1,30,27
    27,9,1,1,1,29,28,28,4,27,4,9,1,1,2,3,1,34
    16,34,3,2,32,30,30,28,41,16,34,1,1,3,1,1,1,2
    16,1,2,2,3,34,1,3,18,20,3,1,3,1,1,3,35,7
    35,1,1,1,1,21,15,15,20,1,1,34,1,1,7,27,4,9
    3,1,34,19,1,3,1,34,3,3,1,1,3,34,5,47,1,3
    1,1,3,16,1,1,1,2,2,2,3,1,18,15,26,1,1,2
    2,44,1,21,15,34,1,3,2,2,3,18,20,41,5,3,44,2
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

  void importAWBWMap({
    name: "1v1 Issus",
    numberOfPlayers: 2,
    tileDataString: `
  1,34,28,31,44,32,28,28,28,30,34,1,1,3,1,34,19,3,1,34,28
  28,29,28,30,16,2,30,30,1,18,24,15,15,19,1,1,25,15,15,20,32
  28,28,30,18,24,15,34,1,2,16,1,3,1,34,1,3,16,1,2,1,32
  30,30,35,20,3,1,1,112,1,21,19,1,112,20,1,18,34,1,1,1,3
  40,1,16,2,1,28,29,1,3,1,34,1,1,3,1,16,1,3,18,34,1
  21,22,20,1,28,28,28,31,1,1,1,29,29,29,1,21,15,15,20,29,29
  1,44,28,1,32,28,33,28,31,1,3,32,133,31,1,3,1,1,1,32,42
  29,28,28,3,1,30,28,28,28,1,1,30,30,30,1,1,34,19,3,32,28
  28,28,2,1,34,1,30,28,34,19,1,1,1,1,112,19,1,16,1,1,32
  33,28,31,1,16,1,3,1,1,16,1,3,1,34,1,16,3,16,1,41,28
  28,28,31,18,24,19,1,18,15,24,145,22,15,20,1,21,22,20,32,28,28
  28,41,1,16,3,16,1,34,1,3,1,16,1,1,3,1,16,1,32,28,33
  31,1,1,16,1,21,112,1,1,1,1,21,34,28,29,1,34,1,2,28,28
  28,31,3,21,34,1,1,29,29,29,1,1,28,28,28,29,1,3,28,28,30
  47,31,1,1,1,3,1,32,133,31,3,1,32,28,33,28,31,1,28,39,1
  30,30,18,15,15,19,1,30,30,30,1,1,1,32,28,28,28,1,18,24,19
  1,34,20,3,1,16,1,3,1,1,34,1,3,1,30,28,1,2,16,1,45
  3,1,1,1,34,20,1,18,112,1,21,19,1,112,1,1,3,18,35,29,29
  31,1,2,1,16,3,1,34,1,3,1,16,2,1,34,15,22,20,29,28,28
  31,18,15,15,23,1,1,21,15,15,22,20,1,29,29,2,16,29,28,30,28
  28,34,1,3,21,34,1,3,1,1,34,29,28,28,28,31,39,32,28,34,32
  `,
  });

  void importAWBWMap({
    name: "Dubious Procession",
    numberOfPlayers: 2,
    tileDataString: `
2,2,1,34,2,1,34,1,28,110,105,40,3,3,1,1,1,29,31
34,3,1,21,19,3,1,32,31,3,103,113,108,18,34,1,3,39,31
21,19,1,1,34,1,28,28,1,1,1,1,18,20,1,2,1,1,3
1,39,3,2,1,1,28,1,1,18,15,34,20,1,1,34,2,3,2
28,3,2,1,1,32,30,31,1,34,1,3,1,2,1,1,3,18,34
28,28,18,34,19,28,108,30,3,1,2,1,1,32,29,28,18,20,3
28,31,34,32,27,28,3,18,19,1,1,42,1,28,30,31,133,1,2
2,32,29,31,16,1,1,21,34,1,3,1,1,3,1,32,31,1,34
1,3,1,28,21,34,3,1,1,2,1,1,3,34,19,28,1,3,1
34,1,32,31,1,3,1,1,3,1,34,19,1,1,16,32,30,31,2
2,1,133,32,29,28,1,47,1,1,21,20,3,28,27,31,34,32,28
3,18,20,28,30,31,1,1,2,1,3,29,110,28,21,34,20,28,28
34,20,3,1,1,2,1,3,1,34,1,32,29,31,1,1,2,3,28
2,3,2,34,1,1,18,34,15,20,1,1,28,1,1,2,3,44,1
3,1,1,2,1,18,20,1,1,1,1,28,28,1,34,1,1,21,19
32,44,3,1,34,20,110,113,105,3,32,31,1,3,21,19,1,3,34
32,30,1,1,1,3,3,45,103,108,28,1,34,1,2,34,1,2,2`,
  });

  void importAWBWMap({
    name: "1v1 Chosin Reservoir",
    numberOfPlayers: 2,
    tileDataString: `
28,28,28,33,28,28,28,28,28,28,33,28,28,28,28,28,28,33,28,28,28,28,28,28,28,28,28,28,33
28,31,34,28,28,30,30,30,41,30,28,30,28,30,30,30,28,28,30,30,30,28,28,33,28,28,30,28,28
33,28,29,28,31,3,1,1,16,3,32,34,31,1,1,34,32,31,18,34,112,32,28,28,28,31,41,28,28
28,28,28,28,30,1,34,15,23,1,30,30,30,1,3,16,28,28,25,20,3,32,31,44,28,28,29,28,28
34,32,28,31,1,1,1,3,21,34,1,3,1,34,22,20,1,1,16,2,32,28,28,29,28,28,28,33,28
29,28,28,31,34,1,1,1,1,21,15,19,1,1,16,1,3,18,34,32,28,28,28,31,1,35,28,28,28
28,28,30,1,16,3,1,133,1,3,1,34,1,3,21,34,15,20,1,32,31,3,45,32,28,29,28,28,28
28,31,34,1,21,15,22,20,1,1,1,1,1,1,1,1,2,1,3,28,28,28,28,28,28,30,28,44,28
33,28,31,1,1,1,16,3,1,34,22,15,15,34,1,1,1,112,1,47,30,28,28,28,30,1,28,29,28
28,30,30,3,1,1,34,29,29,1,16,3,1,1,1,3,1,21,15,24,19,28,30,30,3,28,28,30,28
28,34,15,19,1,2,1,30,30,1,21,19,1,29,29,29,1,1,1,1,21,41,1,112,19,30,30,3,28
28,1,1,21,19,1,3,1,1,3,1,34,1,32,145,31,1,34,1,3,1,1,3,1,21,19,1,1,28
28,3,29,29,21,112,1,41,19,1,1,1,1,30,30,30,1,21,19,1,29,29,1,2,1,21,15,34,28
28,29,28,28,3,29,29,28,21,22,15,19,1,3,1,1,1,3,16,1,30,30,34,1,1,3,29,29,28
28,30,28,1,29,28,28,28,29,42,1,112,1,1,1,34,15,15,24,34,1,3,16,1,1,1,32,28,33
28,39,28,29,28,28,28,28,28,28,3,1,2,1,1,1,1,1,1,1,1,18,24,15,19,1,34,32,28
28,28,28,30,28,31,40,3,32,31,1,18,15,34,19,3,1,34,1,3,1,133,1,3,16,1,29,28,28
28,28,28,35,1,32,28,28,28,31,34,20,3,1,16,1,1,21,15,19,1,1,1,1,34,32,28,28,30
28,33,28,28,28,30,28,28,31,2,16,1,1,18,24,34,1,3,1,34,19,3,1,1,1,32,28,31,34
28,28,30,28,28,39,32,31,3,18,23,28,28,16,3,1,29,29,29,1,25,15,34,1,29,28,28,28,28
28,28,46,32,28,28,28,31,112,34,20,32,31,34,1,1,32,34,31,3,16,1,1,3,32,28,30,28,33
28,28,29,28,28,33,28,28,29,29,29,28,28,29,29,29,28,29,28,29,46,29,29,29,28,28,34,32,28
33,28,28,28,28,28,28,28,28,28,28,33,28,28,28,28,28,28,33,28,28,28,28,28,28,33,28,28,28
`,
  });

  void importAWBWMap({
    name: "Love and Literature",
    numberOfPlayers: 2,
    tileDataString: `
34,31,3,39,1,5,2,30,29,29,34,29,3,2,2,1,34,1,112,2,32,31
  32,31,1,21,22,26,1,3,30,30,30,30,34,3,1,1,1,39,1,34,32,31
  31,3,1,3,34,10,8,112,15,19,3,1,1,1,1,1,1,16,3,116,40,31
  31,1,1,18,24,115,5,35,8,27,1,112,1,34,3,2,34,16,1,103,113,115
  2,1,1,3,1,1,5,2,5,34,1,1,2,2,2,2,1,16,1,34,2,32
  1,133,1,1,1,34,26,18,112,20,1,1,34,3,3,1,1,21,15,19,2,32
  1,1,112,3,1,2,26,20,3,1,1,3,16,1,1,34,1,1,42,16,1,32
  34,1,18,20,1,3,10,4,115,34,15,15,20,34,1,112,1,2,3,16,1,3
  1,1,34,1,1,1,1,3,1,1,1,1,1,1,3,1,1,1,1,34,1,1
  3,1,16,3,2,1,112,1,34,18,15,15,34,115,4,8,3,1,18,20,1,34
  31,1,16,47,1,1,34,1,1,16,3,1,1,3,18,26,2,1,3,112,1,1
  31,2,21,15,19,1,1,3,3,34,1,1,18,112,20,26,34,1,1,1,133,1
  31,2,34,1,16,1,2,2,2,2,1,1,34,5,2,5,1,1,3,1,1,2
  115,113,105,1,16,34,2,3,34,1,112,1,27,10,35,5,115,22,20,1,1,32
  32,45,116,3,16,1,1,1,1,1,1,3,21,15,112,10,8,34,3,1,3,32
  32,31,34,1,44,1,1,1,3,34,29,29,29,29,3,1,26,24,19,1,32,31
  32,31,2,112,1,34,1,2,2,3,30,34,30,30,29,2,5,1,44,3,32,34
`,
  });

  await prisma.match.create({
    data: {
      leagueType: "fog",
      rules: {
        bannedUnitTypes: [],
        captureLimit: 50,
        dayLimit: 50,
        fogOfWar: true,
        fundsPerProperty: 1000,
        unitCapPerPlayer: 50,
        weatherSetting: "clear",
        labUnitTypes: [],
        teamMapping: [0, 1],
      },
      status: "playing",
      mapId: causticFinaleDBMap.id,
      playerState: [
        {
          slot: 0,
          hasCurrentTurn: true,
          id: devPlayers[0].id,
          name: devPlayers[0].name,
          ready: true,
          coId: {
            name: "andy",
            version: "AW2",
          },
          eliminated: false,
          funds: 10000,
          powerMeter: 0,
          timesPowerUsed: 0,
          army: "orange-star",
          COPowerState: "no-power",
        },
        {
          slot: 1,
          hasCurrentTurn: false,
          id: devPlayers[1].id,
          name: devPlayers[1].name,
          ready: true,
          coId: {
            name: "flak",
            version: "AW2",
          },
          eliminated: false,
          funds: 10000,
          powerMeter: 0,
          timesPowerUsed: 0,
          army: "black-hole",
          COPowerState: "no-power",
        },
      ],
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
