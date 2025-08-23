import { PrismaClient } from "@prisma/client";

// Re-export the loadFixtures function from the dedicated loader
export { loadFixtures } from "./load-fixtures";

const prisma = new PrismaClient();

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