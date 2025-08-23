import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";
import { clearTestDatabase } from "./database";

const prisma = new PrismaClient();

export async function loadFixtures() {
  console.log("Loading fixtures into test database...");
  
  try {
    // Clear existing data
    await clearTestDatabase();
    
    // Read fixtures file
    const fixturesPath = path.join(process.cwd(), "tests", "fixtures", "data.json");
    const fixturesData = await fs.readFile(fixturesPath, "utf-8");
    const fixtures = JSON.parse(fixturesData);
    
    // Load users
    if (fixtures.users && fixtures.users.length > 0) {
      for (const user of fixtures.users) {
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
      console.log(`Loaded ${fixtures.users.length} user(s)`);
    }
    
    // Load players
    if (fixtures.players && fixtures.players.length > 0) {
      for (const player of fixtures.players) {
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
      console.log(`Loaded ${fixtures.players.length} player(s)`);
    }
    
    // Load maps
    if (fixtures.maps && fixtures.maps.length > 0) {
      for (const map of fixtures.maps) {
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
      console.log(`Loaded ${fixtures.maps.length} map(s)`);
    }
    
    // Load matches
    if (fixtures.matches && fixtures.matches.length > 0) {
      for (const match of fixtures.matches) {
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
              connect: fixtures.players
                .filter((p: any) => p.kind === "human")
                .map((p: any) => ({ id: p.id }))
            }
          }
        });
        
        // Then create events if any
        if (match.Event && match.Event.length > 0) {
          for (const event of match.Event) {
            await prisma.event.create({
              data: {
                matchId: match.id,
                index: event.index,
                content: event.content,
                createdAt: new Date(event.createdAt)
              }
            });
          }
        }
      }
      console.log(`Loaded ${fixtures.matches.length} match(es)`);
    }
    
    console.log("Fixtures loaded successfully");
  } catch (error) {
    console.error("Failed to load fixtures:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getTestUser() {
  const user = await prisma.user.findFirst({
    where: {
      name: "development_user"
    }
  });
  
  if (!user) {
    throw new Error("Test user not found in database");
  }
  
  return user;
}

export async function getTestPlayer() {
  const player = await prisma.player.findFirst({
    where: {
      name: "DevPlayer"
    }
  });
  
  if (!player) {
    throw new Error("Test player not found in database");
  }
  
  return player;
}