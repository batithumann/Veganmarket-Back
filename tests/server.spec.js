const request = require("supertest");
const server = require("../index");

const test_token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZW1haWwuY29tIiwiaWF0IjoxNjg0ODU1NDY4fQ.D9nG2q-AGSPxtM2FTZYJlDYeKNFi71MvJYwYnCrj5H0";

describe("Tests a rutas API REST", () => {
  it("POST /usuario con datos invalidos devuelve error", async () => {
    const usuario = {
      nombre: "nombre",
    };
    const response = await request(server).post("/usuario").send(usuario);
    const error = response.error;
    expect(error).toBeInstanceOf(Error);
  });

  it("GET /productos devuelve status 200 sin errores y un arreglo", async () => {
    const response = await request(server).get("/productos").send();
    const status = response.statusCode;
    const error = response.error;
    const body = response.body;
    expect(error).toBe(false);
    expect(status).toBe(200);
    expect(body).toBeInstanceOf(Array);
  });

  it("POST /productos con usuario valido devuelve status 200", async () => {
    const producto = {
      nombre: "nuevo producto",
      descripcion: "descripcion producto",
      url_imagen:
        "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
      precio: 1000,
      stock: 10,
      categoria: "nueva categoria",
    };
    const response = await request(server)
      .post("/productos")
      .set("Authorization", "Bearer " + test_token)
      .send(producto);

    const status = response.statusCode;
    expect(status).toBe(200);
  });

  it("GET /favoritos con token valido devuelve status 200 sin errores y un arreglo", async () => {
    const response = await request(server)
      .get("/favoritos")
      .set("Authorization", "Bearer " + test_token)
      .send();
    const status = response.statusCode;
    const error = response.error;
    const body = response.body;
    expect(error).toBe(false);
    expect(status).toBe(200);
    expect(body).toBeInstanceOf(Array);
  });
});
