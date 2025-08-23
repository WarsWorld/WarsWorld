import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const TEST_DATABASE_NAME = "trpc-starter-websockets-test";

export async function createTestDatabase() {
  console.log("Creating test database if it doesn't exist...");
  
  // Create database if it doesn't exist
  try {
    execSync(
      `psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE \\"${TEST_DATABASE_NAME}\\""`,
      { stdio: "ignore" }
    );
    console.log("Test database created");
  } catch (error) {
    // Database might already exist, which is fine
    console.log("Test database already exists or creation failed (this might be okay)");
  }
}

export async function dropTestDatabase() {
  console.log("Dropping test database...");
  
  try {
    // Terminate all connections to the test database
    execSync(
      `psql -U postgres -h localhost -p 5432 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${TEST_DATABASE_NAME}' AND pid <> pg_backend_pid()"`,
      { stdio: "ignore" }
    );
    
    // Drop the database
    execSync(
      `psql -U postgres -h localhost -p 5432 -c "DROP DATABASE IF EXISTS \\"${TEST_DATABASE_NAME}\\""`,
      { stdio: "ignore" }
    );
    console.log("Test database dropped");
  } catch (error) {
    console.error("Failed to drop test database:", error);
  }
}

export async function resetTestDatabase() {
  await dropTestDatabase();
  await createTestDatabase();
  
  // Push schema to test database
  console.log("Applying Prisma schema to test database...");
  execSync("npm run prisma:push", {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "test" }
  });
}

export async function clearTestDatabase() {
  const prisma = new PrismaClient();
  
  try {
    // Clear all tables in reverse order of dependencies
    await prisma.event.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.notes.deleteMany();
    await prisma.mMR.deleteMany();
    await prisma.match.deleteMany();
    await prisma.wWMap.deleteMany();
    await prisma.articleComment.deleteMany();
    await prisma.articleAuthors.deleteMany();
    await prisma.article.deleteMany();
    await prisma.player.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    await prisma.clan.deleteMany();
    
    console.log("Test database cleared");
  } catch (error) {
    console.error("Failed to clear test database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}