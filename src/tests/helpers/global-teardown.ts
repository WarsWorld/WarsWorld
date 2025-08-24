export default async function globalTeardown() {
  console.log("Running global teardown for tests...");
  
  // We keep the test database for debugging purposes
  // If you want to drop it after tests, uncomment this:
  // await dropTestDatabase();
  
  console.log("Global teardown complete");
}