import { db } from "../../config/db.config.js";

export const findUserByEmail = async (email) => {
  const { rows } = await db.query("SELECT * FROM users WHERE email=$1", [email]);
  return rows[0];
};

export const findUserById = async (id) => {
  const { rows } = await db.query(
    "SELECT id, name, email, phone, address, role, is_deleted FROM users WHERE id=$1",
    [id],
  );
  return rows[0];
};

export const createUser = async ({ name, email, password }) => {
  const { rows } = await db.query(
    `INSERT INTO users(name,email,password)
     VALUES($1,$2,$3) RETURNING *`,
    [name, email, password],
  );
  return rows[0];
};

// UPDATE USER
export const updateUser = async (id, data) => {
  const { name, email, password, phone, address } = data;

  const { rows } = await db.query(
    `UPDATE users
     SET name = COALESCE($1, name),
         email = COALESCE($2, email),
         password = COALESCE($3, password),
         phone = COALESCE($4, phone),
         address = COALESCE(NULLIF($5, ''), address)
     WHERE id = $6
     RETURNING id, name, email, phone, address, role`,
    [name, email, password, phone, address, id],
  );

  return rows[0];
};

export const updatePassword = async (id, password) => {
  await db.query("UPDATE users SET password=$1 WHERE id=$2", [password, id]);
};

export const softDeleteUser = async (id) => {
  await db.query("UPDATE users SET is_deleted = TRUE WHERE id = $1", [id]);
};
