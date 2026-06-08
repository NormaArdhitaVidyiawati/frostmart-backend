import { db } from "../../config/db.config.js";

export const getAddressesByUserId = async (userId) => {
  const { rows } = await db.query(
    `SELECT id, user_id, address_type, recipient_name, city_district, postal_code, full_address, is_primary, created_at
     FROM addresses
     WHERE user_id = $1
     ORDER BY is_primary DESC, id DESC`,
    [userId],
  );

  return rows;
};

export const getAddressById = async (id, userId) => {
  const { rows } = await db.query(
    `SELECT id, user_id, address_type, recipient_name, city_district, postal_code, full_address, is_primary, created_at
     FROM addresses
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  return rows[0];
};

export const countAddressesByUserId = async (userId) => {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count
     FROM addresses
     WHERE user_id = $1`,
    [userId],
  );

  return rows[0].count;
};

export const clearPrimaryAddresses = async (userId) => {
  await db.query(
    `UPDATE addresses
     SET is_primary = FALSE
     WHERE user_id = $1`,
    [userId],
  );
};

export const createAddress = async (userId, data) => {
  const { rows } = await db.query(
    `INSERT INTO addresses(user_id, address_type, recipient_name, city_district, postal_code, full_address, is_primary)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id, address_type, recipient_name, city_district, postal_code, full_address, is_primary, created_at`,
    [
      userId,
      data.address_type,
      data.recipient_name,
      data.city_district,
      data.postal_code,
      data.full_address,
      data.is_primary ?? false,
    ],
  );

  return rows[0];
};

export const updateAddress = async (id, userId, data) => {
  const { rows } = await db.query(
    `UPDATE addresses
     SET address_type = COALESCE($1, address_type),
         recipient_name = COALESCE($2, recipient_name),
         city_district = COALESCE($3, city_district),
         postal_code = COALESCE($4, postal_code),
         full_address = COALESCE($5, full_address),
         is_primary = COALESCE($6, is_primary)
     WHERE id = $7 AND user_id = $8
     RETURNING id, user_id, address_type, recipient_name, city_district, postal_code, full_address, is_primary, created_at`,
    [
      data.address_type,
      data.recipient_name,
      data.city_district,
      data.postal_code,
      data.full_address,
      data.is_primary,
      id,
      userId,
    ],
  );

  return rows[0];
};

export const deleteAddress = async (id, userId) => {
  const { rows } = await db.query(
    `DELETE FROM addresses
     WHERE id = $1 AND user_id = $2
     RETURNING id, is_primary`,
    [id, userId],
  );

  return rows[0];
};