import NextAuth from "next-auth";
import authConfig from "server/lib/authConfig";

export default NextAuth(authConfig);
