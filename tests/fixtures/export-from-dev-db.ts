/**
 * Script to export fixtures from development database to static JSON files
 * This is a one-time export script to bootstrap test data
 * Run with: npx tsx tests/fixtures/export-from-dev-db.ts
 * 
 * After running this script, the exported JSON files should be committed to git
 * and used as static test fixtures. The development database can change,
 * but tests will always use the same consistent data.
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";

// Use development database
process.env.DATABASE_URL = "postgresql://postgres@localhost:5432/trpc-starter-websockets?schema=public";

const prisma = new PrismaClient();

async function exportFixtures() {
  console.log("Exporting fixtures from development database...");
  console.log("Note: This only exports existing data, no fake data is created.");
  
  try {
    const fixturesDir = path.join(process.cwd(), "tests", "fixtures");
    
    // Export users
    const users = await prisma.user.findMany({
      where: {
        name: {
          in: ["development_user"] // Only export specific test users
        }
      }
    });
    
    if (users.length === 0) {
      console.warn("⚠️  No development_user found in database");
      console.log("   Please ensure development_user exists in your dev database");
    } else {
      await fs.writeFile(
        path.join(fixturesDir, "users.json"),
        JSON.stringify(users, null, 2),
        "utf-8"
      );
      console.log(`✅ Exported ${users.length} user(s) to users.json`);
    }
    
    // Export players (only those linked to our test users)
    const userIds = users.map(u => u.id);
    const players = await prisma.player.findMany({
      where: {
        userId: {
          in: userIds
        }
      }
    });
    
    if (players.length === 0) {
      console.warn("⚠️  No players found for test users");
    } else {
      await fs.writeFile(
        path.join(fixturesDir, "players.json"),
        JSON.stringify(players, null, 2),
        "utf-8"
      );
      console.log(`✅ Exported ${players.length} player(s) to players.json`);
    }
    
    // Export a small map (preferably 2-player for faster tests)
    const maps = await prisma.wWMap.findMany({
      where: {
        numberOfPlayers: 2
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 1 // Just take one small map
    });
    
    if (maps.length === 0) {
      console.warn("⚠️  No 2-player maps found in database");
      console.log("   You may want to create a small test map in your dev database");
    } else {
      await fs.writeFile(
        path.join(fixturesDir, "maps.json"),
        JSON.stringify(maps, null, 2),
        "utf-8"
      );
      console.log(`✅ Exported ${maps.length} map(s) to maps.json`);
    }
    
    // Export PvC matches for our test players
    const playerIds = players.map(p => p.id);
    const matches = await prisma.match.findMany({
      where: {
        mode: "pvc",
        Player: {
          some: {
            id: {
              in: playerIds
            }
          }
        }
      },
      include: {
        Player: true, // Include the Player relationship
        Event: {
          orderBy: {
            index: "asc"
          },
          take: 5 // Only export first 5 events to keep fixtures small
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 1 // Just take the most recent PvC match
    });
    
    if (matches.length === 0) {
      console.warn("⚠️  No PvC matches found for test players");
      console.log("   Please create a PvC match in your dev database with development_user");
    } else {
      await fs.writeFile(
        path.join(fixturesDir, "matches.json"),
        JSON.stringify(matches, null, 2),
        "utf-8"
      );
      console.log(`✅ Exported ${matches.length} match(es) to matches.json`);
    }
    
    // Create a summary file with metadata
    const summary = {
      exportedAt: new Date().toISOString(),
      counts: {
        users: users.length,
        players: players.length,
        maps: maps.length,
        matches: matches.length
      },
      notes: "These are static test fixtures. Do not regenerate unless adding new test scenarios."
    };
    
    await fs.writeFile(
      path.join(fixturesDir, "export-summary.json"),
      JSON.stringify(summary, null, 2),
      "utf-8"
    );
    
    console.log("\n📋 Export Summary:");
    console.log(JSON.stringify(summary.counts, null, 2));
    
    if (users.length > 0 && players.length > 0 && maps.length > 0) {
      console.log("\n✅ Export completed successfully!");
      console.log("   The exported JSON files should be committed to git.");
    } else {
      console.log("\n⚠️  Export completed with warnings.");
      console.log("   Please ensure your dev database has the necessary test data.");
    }
    
  } catch (error) {
    console.error("❌ Failed to export fixtures:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the export
exportFixtures().catch(console.error);