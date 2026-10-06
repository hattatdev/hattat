import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("../apps/docs/dist/site/", import.meta.url));
const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
};

/** Serve the built site locally at both / and the GitHub project path /hattat/. */
export function createDocsServer() {
  return createServer(async (request, response) => {
    try {
      let pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
      if (pathname.startsWith("/hattat/")) pathname = pathname.slice(7);
      const file = resolve(ROOT, `.${pathname === "/" ? "/index.html" : pathname}`);
      const local = relative(ROOT, file);
      if (local.startsWith("..") || isAbsolute(local)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const content = await readFile(file);
      response
        .writeHead(200, {
          "content-type": TYPES[extname(file)] ?? "application/octet-stream",
          "cache-control": "no-store",
        })
        .end(content);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const server = createDocsServer();
  server.listen(4173, "127.0.0.1", () => console.log("Gallery: http://127.0.0.1:4173/hattat/"));
}
