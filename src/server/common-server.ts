import { createContext } from "./trpc/trpc-context";
import { appRouter } from "./routers/root";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import ws from "ws";

export const createTRPCwebSocketServer = (wssConfig: ws.ServerOptions) => {
  const wss = new ws.Server(wssConfig);

  const handler = applyWSSHandler({ wss, router: appRouter, createContext });

  process.on("SIGTERM", () => {
    console.log("SIGTERM");
    handler.broadcastReconnectNotification();
    wss.close();
  });

  return wss;
};
