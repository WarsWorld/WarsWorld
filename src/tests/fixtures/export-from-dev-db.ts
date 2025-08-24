/**
 * Script to export fixtures from development database to static JSON files
 * This is a one-time export script to bootstrap test data
 * Run with: npx tsx src/tests/fixtures/export-from-dev-db.ts
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
    
    // Export ALL users
    const users = await prisma.user.findMany();
    
    await fs.writeFile(
      path.join(fixturesDir, "users.json"),
      JSON.stringify(users, null, 2),
      "utf-8"
    );
    console.log(`✅ Exported ${users.length} user(s) to users.json`);
    
    // Export ALL players (including computer players)
    const players = await prisma.player.findMany();
    
    await fs.writeFile(
      path.join(fixturesDir, "players.json"),
      JSON.stringify(players, null, 2),
      "utf-8"
    );
    console.log(`✅ Exported ${players.length} player(s) to players.json`);
    
    // Export ALL maps
    const maps = await prisma.wWMap.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });
    
    await fs.writeFile(
      path.join(fixturesDir, "maps.json"),
      JSON.stringify(maps, null, 2),
      "utf-8"
    );
    console.log(`✅ Exported ${maps.length} map(s) to maps.json`);
    
    // Export ALL matches
    const matches = await prisma.match.findMany({
      include: {
        Player: true, // Include the Player relationship
        Event: {
          orderBy: {
            index: "asc"
          }
          // Export all events, not just first 5
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    await fs.writeFile(
      path.join(fixturesDir, "matches.json"),
      JSON.stringify(matches, null, 2),
      "utf-8"
    );
    console.log(`✅ Exported ${matches.length} match(es) to matches.json`);
    
    console.log("\n📋 Export Summary:");
    console.log(JSON.stringify({
      users: users.length,
      players: players.length,
      maps: maps.length,
      matches: matches.length
    }, null, 2));
    
    console.log("\n✅ Export completed successfully!");
    console.log("   The exported JSON files should be committed to git.");
    
    if (users.length === 0 || players.length === 0 || maps.length === 0 || matches.length === 0) {
      console.log("\n⚠️  Warning: Some tables had no data.");
      console.log("   You may want to add test data to your dev database.");
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