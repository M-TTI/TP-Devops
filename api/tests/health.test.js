jest.mock("../src/db");

const db = require("../src/db");
const request = require("supertest");
const app = require("../src/app");

beforeAll(() => {
  process.env.npm_package_version = "1.0.0";
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
});

beforeEach(() => {
  db.query.mockResolvedValue({ rows: [] });
});

test("GET / retourne le nom de l'API", async () => {
  const res = await request(app).get("/");
  expect(res.status).toBe(200);
  expect(res.body.name).toBe("ShopLite API");
});

test("GET /health retourne 200 avec les champs attendus", async () => {
  const res = await request(app).get("/health");
  expect(res.status).toBe(200);
  expect(res.body.status).toBe("ok");
  expect(res.body.api).toBe("OK");
  expect(res.body.db).toBe("OK");
  expect(res.body.version).toBeDefined();
  expect(res.body.timestamp).toBeDefined();
});

test("GET /health retourne 503 quand la DB est indisponible", async () => {
  db.query.mockRejectedValueOnce(new Error("connection refused"));
  const res = await request(app).get("/health");
  expect(res.status).toBe(503);
  expect(res.body.status).toBe("error");
  expect(res.body.db).toBe("ERROR");
});

test("GET /ready retourne 200 quand la DB est disponible", async () => {
  const res = await request(app).get("/ready");
  expect(res.status).toBe(200);
  expect(res.body.status).toBe("ok");
});

test("GET /ready retourne 503 quand la DB est indisponible", async () => {
  db.query.mockRejectedValueOnce(new Error("connection refused"));
  const res = await request(app).get("/ready");
  expect(res.status).toBe(503);
  expect(res.body.status).toBe("error");
});

test("GET /route-inconnue retourne 404", async () => {
  const res = await request(app).get("/route-inconnue");
  expect(res.status).toBe(404);
  expect(res.body.error).toBe("Route not found");
});
