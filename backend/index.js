const http = require("http");

const PORT = process.env.PORT || 4321;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Backend server is running",
      })
    );
    return;
  }

  if (req.method === "GET" && req.url === "/site-health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      error: "Not Found",
    })
  );
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
