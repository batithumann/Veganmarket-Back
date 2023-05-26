const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const {
  nuevoUsuario,
  verificarCredenciales,
  getUser,
  nuevoProducto,
  getProductos,
  getProducto,
  agregarFavorito,
  getFavoritos,
  eliminarFavorito,
} = require("./consultas");

const app = express();

app.listen(4000, console.log("Servidor iniciado en puerto 4000"));

app.use(cors());
app.use(express.json());

// Registrar nuevo usuario
app.post("/usuario", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const result = await nuevoUsuario(nombre, email, password);
    res.status(200).send(`Usuario ${email} registrado`);
  } catch (error) {
    res.status(error.code || 500).send(error);
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    await verificarCredenciales(email, password);
    const token = jwt.sign({ email: email }, "az_AZ");
    res.status(200).send(token);
  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});

// Obtener usuario
app.get("/usuario", async (req, res) => {
  try {
    const auth = req.header("Authorization");
    if (!auth) {
      res.status(401).send("Credenciales inválidas");
      return;
    }
    const token = auth.split("Bearer ")[1];
    jwt.verify(token, "az_AZ");
    const { email } = jwt.decode(token);
    const usuario = await getUser(email);
    if (usuario) {
      res.status(200).send(usuario);
    } else {
      res.status(401).send("Credenciales inválidas");
    }
  } catch (error) {
    res.status(error.code || 500).send(error.message || "Ocurrió un error");
  }
});

// Nuevo producto
app.post("/productos", async (req, res) => {
  try {
    const auth = req.header("Authorization");
    const token = auth.split("Bearer ")[1];
    jwt.verify(token, "az_AZ");
    const { email } = jwt.decode(token);
    const usuario = await getUser(email);
    const id_vendedor = usuario.id;
    const { nombre, descripcion, url_imagen, precio, stock, categoria } =
      req.body;
    const result = await nuevoProducto(
      id_vendedor,
      nombre,
      descripcion,
      url_imagen,
      precio,
      stock,
      categoria
    );
    res.status(200).send(`Producto ${nombre} creado`);
  } catch (error) {
    res.status(error.code || 500).send(error.message || "Ocurrió un error");
  }
});

// Ver todos los productos
app.get("/productos", async (req, res) => {
  try {
    const productos = await getProductos();
    res.status(200).send(productos);
  } catch (error) {
    res.status(error.code || 500).send(error.message || "Ocurrió un error");
  }
});

// Ver detalle de un producto
app.get("/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await getProducto(id);
    res.status(200).send(producto);
  } catch (error) {
    res.status(error.code || 500).send(error.message || "Ocurrió un error");
  }
});

// Obtener favoritos
app.get("/favoritos", async (req, res) => {
  try {
    const auth = req.header("Authorization");
    const token = auth.split("Bearer ")[1];
    jwt.verify(token, "az_AZ");
    const { email } = jwt.decode(token);
    const usuario = await getUser(email);
    const id_usuario = usuario.id;
    const favoritos = await getFavoritos(id_usuario);
    res.status(200).send(favoritos);
  } catch (error) {
    res.status(error.code || 500).send(error.message || "Ocurrió un error");
  }
});

// Agregar producto a favoritos
app.post("/favoritos", async (req, res) => {
  try {
    const { id_producto } = req.body;
    const auth = req.header("Authorization");
    const token = auth.split("Bearer ")[1];
    jwt.verify(token, "az_AZ");
    const { email } = jwt.decode(token);
    const usuario = await getUser(email);
    const id_usuario = usuario.id;
    const result = await agregarFavorito(id_usuario, id_producto);
    res.status(200).send(result);
  } catch (error) {
    res.status(error.code || 500).send(error.message || "Ocurrió un error");
  }
});

// Eliminar de favoritos
app.delete("/favoritos", async (req, res) => {
  try {
    const { id_producto } = req.body;
    const auth = req.header("Authorization");
    const token = auth.split("Bearer ")[1];
    jwt.verify(token, "az_AZ");
    const { email } = jwt.decode(token);
    const usuario = await getUser(email);
    const id_usuario = usuario.id;
    const result = await eliminarFavorito(id_usuario, id_producto);
    res.status(200).send(result);
  } catch (error) {
    res.status(error.code || 500).send(error.message || "Ocurrió un error");
  }
});

app.get("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});

app.post("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});

app.delete("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});

app.put("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});

module.exports = app;
