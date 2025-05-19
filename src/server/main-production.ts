import http from "http";
import next from "next";
import { parse } from "url";
import { createTRPCwebSocketServer } from "./common-server";
import { matchStore } from "./match-store";

const port = parseInt(process.env.WS_PORT ?? "3001", 10);
const app = next({ dev: process.env.NODE_ENV !== "production" });
const handler = app.getRequestHandler();

void (async () => {
  await matchStore.rebuild();
  await app.prepare();

  const server = http.createServer((req, res) => {
    if (req.url === undefined) {
      throw new Error("Request url is undefined");
    }

    if (req.headers["x-forwarded-proto"] === "http") {
      if (req.headers.host === undefined || typeof req.headers.url !== "string") {
        throw new Error("Headers are incorrect");
      }

      // redirect to ssl
      res.writeHead(303, {
        location: `https://` + req.headers.host + req.headers.url,
      });
      res.end();

      return;
    }

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        // Use dynamic origin based on environment
        "Access-Control-Allow-Origin":
          process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : process.env.RAILWAY_NEXT_SERVER!,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      });
      res.end();
      return;
    }

    // Use dynamic origin based on environment
    res.setHeader(
      "Access-Control-Allow-Origin",
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.RAILWAY_NEXT_SERVER!,
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Security headers (these are good, keep them)
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self'");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");

    const parsedUrl = parse(req.url, true);
    void handler(req, res, parsedUrl);
  });

  createTRPCwebSocketServer({ server });
  server.listen(port, "0.0.0.0");

  console.log(`Server listening at port ${port} in ${process.env.NODE_ENV} mode`);
})();
