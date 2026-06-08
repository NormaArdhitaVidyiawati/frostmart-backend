import { db } from "../../config/db.config.js";

export const getUsers = async (page, limit, search) => {
  const offset = (page - 1) * limit;
  const normalizedSearch = search.trim();
  const searchPattern = `%${normalizedSearch}%`;

  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email, u.role, u.created_at,
            COUNT(o.id)::int AS total_orders
     FROM users u
     LEFT JOIN orders o ON o.user_id = u.id
     WHERE ($3 = '' OR u.name ILIKE $4 OR u.email ILIKE $4)
     GROUP BY u.id
     ORDER BY u.id
     LIMIT $1 OFFSET $2`,
    [limit, offset, normalizedSearch, searchPattern],
  );

  return rows;
};

export const getUsersPages = async (limit, search) => {
  const normalizedSearch = search.trim();
  const searchPattern = `%${normalizedSearch}%`;

  const { rows } = await db.query(
    `SELECT CEIL(COUNT(*)::decimal / $1) AS total_pages
     FROM users
     WHERE ($2 = '' OR name ILIKE $3 OR email ILIKE $3)`,
    [limit, normalizedSearch, searchPattern],
  );

  return rows[0];
};

export const getUserById = async (id) => {
  const { rows } = await db.query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
    [id],
  );
  return rows[0];
};

export const updateUserRole = async (id, role) => {
  const { rows } = await db.query(
    `UPDATE users
     SET role = $1
     WHERE id = $2
     RETURNING id, name, email, role, created_at`,
    [role, id],
  );

  return rows[0];
};

export const deleteUser = async (id) => {
  await db.query("DELETE FROM users WHERE id = $1", [id]);
};
