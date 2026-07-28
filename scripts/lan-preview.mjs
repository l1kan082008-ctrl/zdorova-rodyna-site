import http from "node:http";

const listenPort = Number(process.env.LAN_PREVIEW_PORT || 4190);
const upstreamPort = Number(process.env.LAN_UPSTREAM_PORT || 4180);
const blockPrivateRoutes = process.env.BLOCK_PRIVATE_ROUTES === "1";

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", "http://preview.local");

  if (
    blockPrivateRoutes &&
    (requestUrl.pathname.startsWith("/admin") ||
      requestUrl.pathname.startsWith("/api/admin"))
  ) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Сторінку не знайдено.");
    return;
  }

  const upstreamOrigin = `http://localhost:${upstreamPort}`;
  const upstreamHeaders = {
    ...request.headers,
    host: `localhost:${upstreamPort}`,
  };

  if (upstreamHeaders.origin) {
    upstreamHeaders.origin = upstreamOrigin;
  }

  if (upstreamHeaders.referer) {
    const referer = new URL(upstreamHeaders.referer);
    upstreamHeaders.referer = `${upstreamOrigin}${referer.pathname}${referer.search}`;
  }

  const upstreamRequest = http.request(
    {
      hostname: "localhost",
      port: upstreamPort,
      path: request.url,
      method: request.method,
      headers: upstreamHeaders,
    },
    (upstreamResponse) => {
      response.writeHead(
        upstreamResponse.statusCode || 502,
        upstreamResponse.headers,
      );
      upstreamResponse.pipe(response);
    },
  );

  upstreamRequest.on("error", () => {
    if (!response.headersSent) {
      response.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    }
    response.end("Локальний сайт тимчасово недоступний.");
  });

  request.pipe(upstreamRequest);
});

server.listen(listenPort, "0.0.0.0", () => {
  console.log(`LAN preview ready on port ${listenPort}`);
});
