jest.mock("../src/db");

const db = require("../src/db");
const request = require("supertest");
const app = require("../src/app");

const MOCK_PRODUCTS = [
  { id: 1, name: "Produit A", description: "Description A", price_cents: 999 },
  { id: 2, name: "Produit B", description: "Description B", price_cents: 1999 },
];

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
});

beforeEach(() => {
  db.query.mockResolvedValue({ rows: MOCK_PRODUCTS });
});

test("GET /products retourne 200 avec source et data", async () => {
  const res = await request(app).get("/products");
  expect(res.status).toBe(200);
  expect(res.body.source).toBe("database");
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body.data).toHaveLength(2);
  expect(res.body.data[0]).toMatchObject({
    id: 1,
    name: "Produit A",
    price_cents: 999,
  });
});

test("GET /products retourne 500 quand la DB est indisponible", async () => {
  db.query.mockRejectedValueOnce(new Error("DB error"));
  const res = await request(app).get("/products");
  expect(res.status).toBe(500);
  expect(res.body.error).toBe("Internal server error");
});

test("GET /products/:id retourne 200 avec le produit", async () => {
  db.query.mockResolvedValueOnce({ rows: [MOCK_PRODUCTS[0]] });
  const res = await request(app).get("/products/1");
  expect(res.status).toBe(200);
  expect(res.body.source).toBe("database");
  expect(res.body.data).toMatchObject({ id: 1, name: "Produit A" });
});

test("GET /products/:id retourne 400 si l'id n'est pas un entier valide", async () => {
  const res = await request(app).get("/products/abc");
  expect(res.status).toBe(400);
  expect(res.body.error).toBe("Invalid product id");
});

test("GET /products/:id retourne 400 si l'id est négatif", async () => {
  const res = await request(app).get("/products/-1");
  expect(res.status).toBe(400);
  expect(res.body.error).toBe("Invalid product id");
});

test("GET /products/:id retourne 404 si le produit n'existe pas", async () => {
  db.query.mockResolvedValueOnce({ rows: [] });
  const res = await request(app).get("/products/999");
  expect(res.status).toBe(404);
  expect(res.body.error).toBe("Product not found");
});

test("GET /products/:id retourne 500 quand la DB est indisponible", async () => {
  db.query.mockRejectedValueOnce(new Error("DB error"));
  const res = await request(app).get("/products/1");
  expect(res.status).toBe(500);
  expect(res.body.error).toBe("Internal server error");
});
