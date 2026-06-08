import { db } from "./db.config.js";

const createAddressesTableQuery = `
  CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(30) NOT NULL DEFAULT 'rumah',
    recipient_name VARCHAR(150) NOT NULL,
    city_district VARCHAR(150) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    full_address TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

const addAddressTypeColumnQuery = `
  ALTER TABLE addresses
  ADD COLUMN IF NOT EXISTS address_type VARCHAR(30) NOT NULL DEFAULT 'rumah'
`;

const addProductCategoryColumn = `
  ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Uncategorized'
`;

const addProductSkuCodeColumn = `
  ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sku_code VARCHAR(100)
`;

const addProductVisibilityColumn = `
  ALTER TABLE products
  ADD COLUMN IF NOT EXISTS visibility_status VARCHAR(20) DEFAULT 'active'
`;

const createStoreRegistrationsTableQuery = `
  CREATE TABLE IF NOT EXISTS store_registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    store_type VARCHAR(50) NOT NULL,
    owner_name VARCHAR(150) NOT NULL,
    nik VARCHAR(20) NOT NULL,
    ktp_image_url VARCHAR(255) NOT NULL,
    store_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(30),
    product_proof_1_url VARCHAR(255),
    product_proof_2_url VARCHAR(255),
    payment_method_type VARCHAR(50),
    bank_name VARCHAR(100),
    bank_account_name VARCHAR(150),
    bank_account_number VARCHAR(50),
    ewallet_name VARCHAR(50),
    ewallet_owner_name VARCHAR(150),
    bank_qris_url VARCHAR(255),
    ewallet_qris_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

const addPhoneColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS phone VARCHAR(30)`;
const addProductProof1ColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS product_proof_1_url VARCHAR(255)`;
const addProductProof2ColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS product_proof_2_url VARCHAR(255)`;
const addPaymentMethodTypeColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS payment_method_type VARCHAR(50)`;
const addBankNameColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100)`;
const addBankAccountNameColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(150)`;
const addBankAccountNumberColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50)`;
const addEwalletNameColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS ewallet_name VARCHAR(50)`;
const addEwalletOwnerNameColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS ewallet_owner_name VARCHAR(150)`;
const addBankQrisUrlColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS bank_qris_url VARCHAR(255)`;
const addEwalletQrisUrlColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS ewallet_qris_url VARCHAR(255)`;

export const ensureSchema = async () => {
  await db.query(createAddressesTableQuery);
  await db.query(addAddressTypeColumnQuery);
  await db.query(addProductCategoryColumn);
  await db.query(addProductSkuCodeColumn);
  await db.query(addProductVisibilityColumn);
  await db.query(createStoreRegistrationsTableQuery);
  await db.query(addPhoneColumnToStoreQuery);
  await db.query(addProductProof1ColumnToStoreQuery);
  await db.query(addProductProof2ColumnToStoreQuery);
  await db.query(addPaymentMethodTypeColumnToStoreQuery);
  await db.query(addBankNameColumnToStoreQuery);
  await db.query(addBankAccountNameColumnToStoreQuery);
  await db.query(addBankAccountNumberColumnToStoreQuery);
  await db.query(addEwalletNameColumnToStoreQuery);
  await db.query(addEwalletOwnerNameColumnToStoreQuery);
  await db.query(addBankQrisUrlColumnToStoreQuery);
  await db.query(addEwalletQrisUrlColumnToStoreQuery);
  await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP`);
};