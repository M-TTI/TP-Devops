const { log } = require("../src/middleware/logger");

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
});

beforeEach(() => {
  console.log.mockClear();
});

test("log.debug émet un log niveau DEBUG", () => {
  log.debug("test debug");
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('"level":"DEBUG"'),
  );
});

test("log.info émet un log niveau INFO", () => {
  log.info("test info");
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('"level":"INFO"'),
  );
});

test("log.warn émet un log niveau WARN", () => {
  log.warn("test warn");
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('"level":"WARN"'),
  );
});

test("log.error émet un log niveau ERROR", () => {
  log.error("test error");
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('"level":"ERROR"'),
  );
});

test("log.fatal émet un log niveau FATAL", () => {
  log.fatal("test fatal");
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('"level":"FATAL"'),
  );
});

test("les champs sensibles sont masqués dans les headers", () => {
  const request = require("supertest");
  const app = require("../src/app");
  return request(app)
    .get("/")
    .set("authorization", "Bearer secret-token")
    .then(() => {
      const calls = console.log.mock.calls.map((c) => c[0]);
      const logWithAuth = calls.find((c) => c.includes("authorization"));
      expect(logWithAuth).toContain("[REDACTED]");
    });
});
