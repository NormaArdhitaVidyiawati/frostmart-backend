import { db } from "../../config/db.config.js";

export const createRegistration = async (userId, data) => {
  const {
    store_type,
    owner_name,
    nik,
    ktp_image_url,
    store_name,
    category,
    address,
    phone,
    product_proof_1_url,
    product_proof_2_url,
    payment_method_type,
    bank_account_name,
    ewallet_owner_name,
    bank_1,
    bank_2,
    bank_3,
    bank_4,
    ewallet_1,
    ewallet_2,
    ewallet_3,
    ewallet_4,
    qris_url,
  } = data;

  const { rows } = await db.query(
    `INSERT INTO store_registrations (
      user_id, store_type, owner_name, nik, ktp_image_url,
      store_name, category, address, phone,
      product_proof_1_url, product_proof_2_url, payment_method_type,
      bank_account_name, ewallet_owner_name,
      bank_1, bank_2, bank_3, bank_4,
      ewallet_1, ewallet_2, ewallet_3, ewallet_4,
      qris_url, status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
      $20, $21, $22, $23, 'pending'
    ) RETURNING *`,
    [
      userId,
      store_type,
      owner_name,
      nik,
      ktp_image_url,
      store_name,
      category,
      address,
      phone,
      product_proof_1_url,
      product_proof_2_url,
      payment_method_type,
      bank_account_name,
      ewallet_owner_name,
      bank_1,
      bank_2,
      bank_3,
      bank_4,
      ewallet_1,
      ewallet_2,
      ewallet_3,
      ewallet_4,
      qris_url,
    ]
  );
  return rows[0];
};

export const getRegistrationByUserId = async (userId) => {
  const { rows } = await db.query(
    `SELECT * FROM store_registrations WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
    [userId]
  );
  return rows[0];
};

export const getActiveStore = async () => {
  const { rows } = await db.query(
    `SELECT * FROM store_registrations WHERE status = 'approved' ORDER BY id ASC LIMIT 1`
  );
  return rows[0];
};

export const getRegistrationById = async (id) => {
  const { rows } = await db.query(
    `SELECT * FROM store_registrations WHERE id = $1`,
    [id]
  );
  return rows[0];
};

export const updateRegistration = async (id, data) => {
  const {
    store_type,
    owner_name,
    nik,
    ktp_image_url,
    store_name,
    category,
    address,
    phone,
    product_proof_1_url,
    product_proof_2_url,
    payment_method_type,
    bank_account_name,
    ewallet_owner_name,
    bank_1,
    bank_2,
    bank_3,
    bank_4,
    ewallet_1,
    ewallet_2,
    ewallet_3,
    ewallet_4,
    qris_url,
    status,
  } = data;

  const { rows } = await db.query(
    `UPDATE store_registrations SET
      store_type = COALESCE($1, store_type),
      owner_name = COALESCE($2, owner_name),
      nik = COALESCE($3, nik),
      ktp_image_url = COALESCE($4, ktp_image_url),
      store_name = COALESCE($5, store_name),
      category = COALESCE($6, category),
      address = COALESCE($7, address),
      phone = COALESCE($8, phone),
      product_proof_1_url = COALESCE($9, product_proof_1_url),
      product_proof_2_url = COALESCE($10, product_proof_2_url),
      payment_method_type = COALESCE($11, payment_method_type),
      bank_account_name = COALESCE($12, bank_account_name),
      ewallet_owner_name = COALESCE($13, ewallet_owner_name),
      bank_1 = COALESCE($14, bank_1),
      bank_2 = COALESCE($15, bank_2),
      bank_3 = COALESCE($16, bank_3),
      bank_4 = COALESCE($17, bank_4),
      ewallet_1 = COALESCE($18, ewallet_1),
      ewallet_2 = COALESCE($19, ewallet_2),
      ewallet_3 = COALESCE($20, ewallet_3),
      ewallet_4 = COALESCE($21, ewallet_4),
      qris_url = COALESCE($22, qris_url),
      status = COALESCE($23, status)
    WHERE id = $24
    RETURNING *`,
    [
      store_type,
      owner_name,
      nik,
      ktp_image_url,
      store_name,
      category,
      address,
      phone,
      product_proof_1_url,
      product_proof_2_url,
      payment_method_type,
      bank_account_name,
      ewallet_owner_name,
      bank_1,
      bank_2,
      bank_3,
      bank_4,
      ewallet_1,
      ewallet_2,
      ewallet_3,
      ewallet_4,
      qris_url,
      status,
      id,
    ]
  );
  return rows[0];
};

export const deleteRegistration = async (id) => {
  const { rows } = await db.query(
    `DELETE FROM store_registrations WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0];
};
