import { applyWSSHandler } from "@trpc/server/adapters/ws";
import type { ServerOptions } from "ws";
import { WebSocketServer } from "ws";
import { logger } from "shared/utils/logger";
import { appRouter } from "./routers/app";
import { createContext } from "./trpc/trpc-context";

export const createTRPCwebSocketServer = (wssConfig: ServerOptions) => {
  const wss = new WebSocketServer(wssConfig);

  const handler = applyWSSHandler({ wss, router: appRouter, createContext });

  // SIGTERM is a node.js process event
  // like ctrl + c, it means signal/program termination.
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received — closing WebSocket server");
    handler.broadcastReconnectNotification();
    wss.close();
  });

  return wss;
};
