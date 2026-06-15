const { randomUUID } = require("crypto");
const SENSITIVE_KEYS = [
  "authorization",
  "password",
  "token",
  "secret",
  "x-api-key",
];
const log = {
  debug: (message, extra) => write("DEBUG", message, extra),
  info: (message, extra) => write("INFO", message, extra),
  warn: (message, extra) => write("WARN", message, extra),
  error: (message, extra) => write("ERROR", message, extra),
  fatal: (message, extra) => write("FATAL", message, extra),
};

function sanitizeHeaders(headers) {
  const safe = { ...headers };

  for (const key of SENSITIVE_KEYS) {
    if (safe[key]) {
      safe[key] = "[REDACTED]";
    }
  }

  return safe;
}

function write(level, message, extra = {}) {
  console.log(
    JSON.stringify({
      level,
      message,
      ...extra,
      timestamp: new Date().toISOString(),
    }),
  );
}

function middleware(req, res, next) {
  req.requestId = randomUUID();
  const startedAt = Date.now();

  log.info("incoming request", {
    request_id: req.requestId,
    method: req.method,
    path: req.originalUrl,
    headers: sanitizeHeaders(req.headers),
  });

  res.on("finish", () => {
    const level =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    write(level, "request completed", {
      request_id: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: Date.now() - startedAt,
    });
  });

  next();
}

module.exports = { middleware, log };
