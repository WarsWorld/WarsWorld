import http from "http";
import next from "next";
import { parse } from "url";
import { createTRPCwebSocketServer } from "./common-server";
import { rebuildServerState } from "./match-logic/server-match-states";

const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev: false });
const handler = app.getRequestHandler();

(async () => {
  await rebuildServerState();
  await app.prepare();

  const server = http.createServer((req, res) => {
    if (req.headers["x-forwarded-proto"] === "http") {
      // redirect to ssl
      res.writeHead(303, {
        location: `https://` + req.headers.host + (req.headers.url ?? ""),
      });
      res.end();

      return;
    }

    // set browsers to deny framing into an iframe (framebusting)
    res.setHeader('X-Frame-Options', 'DENY');

    // set content security policy
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");

    // prevent MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // prevents cross origin script loading
    res.setHeader('Referrer-Policy', 'same-origin');

    
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const parsedUrl = parse(req.url!, true);
    void handler(req, res, parsedUrl);
  });

  createTRPCwebSocketServer({ server });
  server.listen(port);

  console.log(`Production mode: Server listening at http://localhost:${port}`);
})();
