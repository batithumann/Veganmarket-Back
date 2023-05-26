const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "postgres",
  database: "marketplace",
  allowExitOnIdle: true,
});

const nuevoUsuario = async (nombre, email, password) => {
  const queryRevision = "SELECT * FROM usuario WHERE email = $1";
  const {
    rows: [usuario],
  } = await pool.query(queryRevision, [email]);
  if (usuario) {
    throw {
      code: 401,
      message: "Ya existe un usuario registrado con ese email",
    };
  }
  const passwordEncriptada = bcrypt.hashSync(password);
  const query = "INSERT INTO usuario VALUES (DEFAULT, $1, $2, $3)";
  const values = [nombre, email, passwordEncriptada];
  const result = await pool.query(query, values);
  return result;
};

const verificarCredenciales = async (email, password) => {
  const consulta = "SELECT * FROM usuario WHERE email = $1";
  const values = [email];

  const {
    rows: [usuario],
    rowCount,
  } = await pool.query(consulta, values);
  if (!usuario) {
    throw {
      code: 401,
      message: "Credenciales inválidas",
    };
  }
  const { password_hash: password_hash } = usuario;
  const passwordEsCorrecta = bcrypt.compareSync(password, password_hash);

  if (!passwordEsCorrecta || !rowCount) {
    throw {
      code: 401,
      message: "Credenciales inválidas",
    };
  }
};

const getUser = async (email) => {
  const consulta = "SELECT id, nombre, email FROM usuario WHERE email = $1";
  const values = [email];
  const {
    rowCount,
    rows: [usuario],
  } = await pool.query(consulta, values);
  if (!rowCount)
    throw { code: 404, message: "No se encontró ningún usuario con este ID" };
  return usuario;
};

const nuevoProducto = async (
  id_vendedor,
  nombre,
  descripcion,
  url_imagen,
  precio,
  stock,
  categoria
) => {
  const query =
    "INSERT INTO producto VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7)";
  const values = [
    id_vendedor,
    nombre,
    descripcion,
    url_imagen,
    precio,
    stock,
    categoria,
  ];
  const result = await pool.query(query, values);
  return result;
};

const getProductos = async () => {
  const query = "SELECT * FROM producto ORDER BY id DESC";
  const { rowCount, rows: productos } = await pool.query(query);
  return productos;
};

const getProducto = async (id) => {
  const query =
    "SELECT p.*, u.nombre vendedor FROM producto p left join usuario u on p.id_vendedor = u.id WHERE p.id = $1";
  const values = [id];
  const {
    rowCount,
    rows: [producto],
  } = await pool.query(query, values);
  if (!rowCount)
    throw { code: 404, message: "No se encontró ningún producto con este ID" };
  return producto;
};

const agregarFavorito = async (id_usuario, id_producto) => {
  const queryRevision =
    "SELECT * FROM favoritos WHERE id_usuario = $1 AND id_producto = $2";
  const values = [id_usuario, id_producto];
  const {
    rowCount,
    rows: [existe],
  } = await pool.query(queryRevision, values);
  if (existe)
    throw { code: 403, message: "Este producto ya está en sus favoritos" };
  const query = "INSERT INTO favoritos VALUES (DEFAULT, $1, $2)";
  await pool.query(query, values);
  return getFavoritos(id_usuario);
};

const getFavoritos = async (id_usuario) => {
  const query =
    "SELECT * FROM producto WHERE id IN (SELECT id_producto FROM favoritos WHERE id_usuario = $1);";
  const values = [id_usuario];
  const { rowCount, rows: favoritos } = await pool.query(query, values);
  return favoritos;
};

const eliminarFavorito = async (id_usuario, id_producto) => {
  const query =
    "DELETE FROM favoritos WHERE id_usuario = $1 AND id_producto = $2";
  const values = [id_usuario, id_producto];
  const result = await pool.query(query, values);
  return getFavoritos(id_usuario);
};

module.exports = {
  nuevoUsuario,
  verificarCredenciales,
  getUser,
  nuevoProducto,
  getProductos,
  getProducto,
  agregarFavorito,
  getFavoritos,
  eliminarFavorito,
};
