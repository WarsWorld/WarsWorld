/**
 * Loads static test fixtures into the test database
 * These fixtures are pre-exported JSON files that provide consistent test data
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";
import { clearTestDatabase } from "./database";

const prisma = new PrismaClient();

export async function loadFixtures() {
  console.log("Loading static fixtures into test database...");
  
  try {
    // Clear existing data first
    await clearTestDatabase();
    
    const fixturesDir = path.join(process.cwd(), "tests", "fixtures");
    
    // Load users
    const usersPath = path.join(fixturesDir, "users.json");
    const usersExist = await fs.access(usersPath).then(() => true).catch(() => false);
    
    if (usersExist) {
      const usersData = await fs.readFile(usersPath, "utf-8");
      const users = JSON.parse(usersData);
      
      for (const user of users) {
        await prisma.user.create({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            state: user.state,
            role: user.role,
            emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
            image: user.image,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }
        });
      }
      console.log(`Loaded ${users.length} user(s)`);
    }
    
    // Load players
    const playersPath = path.join(fixturesDir, "players.json");
    const playersExist = await fs.access(playersPath).then(() => true).catch(() => false);
    
    if (playersExist) {
      const playersData = await fs.readFile(playersPath, "utf-8");
      const players = JSON.parse(playersData);
      
      for (const player of players) {
        await prisma.player.create({
          data: {
            id: player.id,
            name: player.name,
            displayName: player.displayName,
            secret: player.secret,
            kind: player.kind,
            preferences: player.preferences,
            achievements: player.achievements || [],
            userId: player.userId
          }
        });
      }
      console.log(`Loaded ${players.length} player(s)`);
    }
    
    // Load maps
    const mapsPath = path.join(fixturesDir, "maps.json");
    const mapsExist = await fs.access(mapsPath).then(() => true).catch(() => false);
    
    if (mapsExist) {
      const mapsData = await fs.readFile(mapsPath, "utf-8");
      const maps = JSON.parse(mapsData);
      
      for (const map of maps) {
        await prisma.wWMap.create({
          data: {
            id: map.id,
            name: map.name,
            tiles: map.tiles,
            predeployedUnits: map.predeployedUnits,
            numberOfPlayers: map.numberOfPlayers,
            createdAt: new Date(map.createdAt)
          }
        });
      }
      console.log(`Loaded ${maps.length} map(s)`);
    }
    
    // Load matches
    const matchesPath = path.join(fixturesDir, "matches.json");
    const matchesExist = await fs.access(matchesPath).then(() => true).catch(() => false);
    
    if (matchesExist) {
      const matchesData = await fs.readFile(matchesPath, "utf-8");
      const matches = JSON.parse(matchesData);
      
      for (const match of matches) {
        // First create the match
        await prisma.match.create({
          data: {
            id: match.id,
            leagueType: match.leagueType,
            mode: match.mode,
            rules: match.rules,
            status: match.status,
            playerState: match.playerState,
            chatIsPublic: match.chatIsPublic,
            createdAt: new Date(match.createdAt),
            mapId: match.mapId,
            Player: {
              connect: match.Player?.map((p: any) => ({ id: p.id })) || []
            }
          }
        });
        
        // Events are intentionally not loaded - we want matches to start in initial state
      }
      console.log(`Loaded ${matches.length} match(es)`);
    }
    
    console.log("Static fixtures loaded successfully");
  } catch (error) {
    console.error("Failed to load fixtures:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}