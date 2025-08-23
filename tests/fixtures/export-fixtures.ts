/**
 * Script to export fixtures from development database
 * Run with: npx tsx tests/fixtures/export-fixtures.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";

// Use development database
process.env.DATABASE_URL = "postgresql://postgres@localhost:5432/trpc-starter-websockets?schema=public";

const prisma = new PrismaClient();

async function exportFixtures() {
  console.log("Exporting fixtures from development database...");
  
  try {
    // Find the development user
    const devUser = await prisma.user.findFirst({
      where: {
        name: "development_user"
      }
    });
    
    if (!devUser) {
      console.error("No development_user found in database");
      console.log("Creating a development user...");
      
      // Create development user if it doesn't exist
      const bcrypt = await import("bcrypt");
      const hashedPassword = await bcrypt.hash("secret", 10);
      
      const newUser = await prisma.user.create({
        data: {
          id: "dev-user-001",
          name: "development_user",
          email: "dev@example.com",
          password: hashedPassword,
          state: "active"
        }
      });
      
      console.log("Created development user:", newUser.id);
    }
    
    // Find or create a player for the development user
    let devPlayer = await prisma.player.findFirst({
      where: {
        userId: devUser?.id || "dev-user-001"
      }
    });
    
    if (!devPlayer) {
      console.log("Creating a player for development user...");
      devPlayer = await prisma.player.create({
        data: {
          id: "dev-player-001",
          name: "DevPlayer",
          displayName: "Development Player",
          userId: devUser?.id || "dev-user-001",
          kind: "human"
        }
      });
    }
    
    // Find a small map (or the first available map)
    let map = await prisma.wWMap.findFirst({
      orderBy: {
        numberOfPlayers: "asc"
      }
    });
    
    if (!map) {
      console.log("No maps found, creating a simple 2-player map...");
      map = await prisma.wWMap.create({
        data: {
          id: "test-map-001",
          name: "Test Map",
          numberOfPlayers: 2,
          tiles: [
            [
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" },
              { type: "base", variant: "default", owner: 0 },
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" }
            ],
            [
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" }
            ],
            [
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" }
            ],
            [
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" }
            ],
            [
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" },
              { type: "base", variant: "default", owner: 1 },
              { type: "plain", variant: "default" },
              { type: "plain", variant: "default" }
            ]
          ],
          predeployedUnits: []
        }
      });
    }
    
    // Find or create a PvC match
    let match = await prisma.match.findFirst({
      where: {
        mode: "pvc",
        Player: {
          some: {
            id: devPlayer.id
          }
        }
      },
      include: {
        Event: {
          orderBy: {
            index: "asc"
          },
          take: 5 // Only export first 5 events to keep fixture small
        }
      }
    });
    
    if (!match) {
      console.log("Creating a PvC match...");
      
      const playerState = [
        {
          slot: 0,
          hasCurrentTurn: true,
          id: devPlayer.id,
          name: devPlayer.name,
          ready: false,
          coId: {
            name: "andy",
            version: "AW2"
          },
          status: "alive",
          funds: 10000,
          powerMeter: 0,
          timesPowerUsed: 0,
          army: "orange-star",
          COPowerState: "no-power"
        },
        {
          slot: 1,
          hasCurrentTurn: false,
          id: "computer-player-001",
          name: "Computer",
          ready: true,
          coId: {
            name: "andy",
            version: "AW2"
          },
          status: "alive",
          funds: 10000,
          powerMeter: 0,
          timesPowerUsed: 0,
          army: "blue-moon",
          COPowerState: "no-power"
        }
      ];
      
      match = await prisma.match.create({
        data: {
          id: "test-match-001",
          status: "playing",
          leagueType: "standard",
          mode: "pvc",
          playerState: playerState,
          mapId: map.id,
          rules: {
            unitCapPerPlayer: 50,
            fogOfWar: false,
            fundsPerProperty: 1000,
            labUnitTypes: ["infantry"],
            bannedUnitTypes: [],
            captureLimit: 0,
            dayLimit: 0,
            weatherSetting: "clear",
            teamMapping: [0, 1]
          },
          Player: {
            connect: {
              id: devPlayer.id
            }
          }
        },
        include: {
          Event: true
        }
      });
    }
    
    // Create the fixtures object
    const fixtures = {
      users: devUser ? [devUser] : [],
      players: devPlayer ? [devPlayer] : [],
      maps: map ? [map] : [],
      matches: match ? [{
        ...match,
        Event: match.Event || []
      }] : []
    };
    
    // Write fixtures to file
    const fixturesPath = path.join(process.cwd(), "tests", "fixtures", "data.json");
    await fs.writeFile(
      fixturesPath,
      JSON.stringify(fixtures, null, 2),
      "utf-8"
    );
    
    console.log("Fixtures exported successfully to:", fixturesPath);
    console.log("Exported:");
    console.log(`- ${fixtures.users.length} user(s)`);
    console.log(`- ${fixtures.players.length} player(s)`);
    console.log(`- ${fixtures.maps.length} map(s)`);
    console.log(`- ${fixtures.matches.length} match(es)`);
    
  } catch (error) {
    console.error("Failed to export fixtures:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the export
exportFixtures().catch(console.error);