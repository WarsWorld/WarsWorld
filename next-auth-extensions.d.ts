import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  type User = {
    id: number;
  } & DefaultUser;
  type Session = {
    user?: {
      id: string;
    } & DefaultSession["user"];
  };
}
