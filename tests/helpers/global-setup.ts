import { createTestDatabase, resetTestDatabase } from "./database";

export default async function globalSetup() {
  console.log("Running global setup for tests...");
  
  // Set test environment
  process.env.NODE_ENV = "test";
  
  // Setup test database
  await createTestDatabase();
  
  // If you want to reset the database before all tests, uncomment this:
  // await resetTestDatabase();
  
  console.log("Global setup complete");
}