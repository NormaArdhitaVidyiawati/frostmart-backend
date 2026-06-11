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
    bank_account_name VARCHAR(150),
    ewallet_owner_name VARCHAR(150),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

const addPhoneColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS phone VARCHAR(30)`;
const addProductProof1ColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS product_proof_1_url VARCHAR(255)`;
const addProductProof2ColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS product_proof_2_url VARCHAR(255)`;
const addPaymentMethodTypeColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS payment_method_type VARCHAR(50)`;
const addBankAccountNameColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(150)`;
const addEwalletOwnerNameColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS ewallet_owner_name VARCHAR(150)`;
const addUserDeletedColumnQuery = `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE`;

const addBank1ColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS bank_1 VARCHAR(50)`;
const addBank2ColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS bank_2 VARCHAR(50)`;
const addBank3ColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS bank_3 VARCHAR(50)`;
const addBank4ColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS bank_4 VARCHAR(50)`;
const addEwallet1ColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS ewallet_1 VARCHAR(50)`;
const addEwallet2ColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS ewallet_2 VARCHAR(50)`;
const addEwallet3ColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS ewallet_3 VARCHAR(50)`;
const addEwallet4ColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS ewallet_4 VARCHAR(50)`;
const addQrisUrlColumnToStoreQuery = `ALTER TABLE store_registrations ADD COLUMN IF NOT EXISTS qris_url VARCHAR(255)`;
const addPaymentProofUrlToTransactionsQuery = `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_proof_url VARCHAR(255)`;

const addProductBrandColumnQuery = `ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100) DEFAULT 'Frostmart'`;
const addProductSizeColumnQuery = `ALTER TABLE products ADD COLUMN IF NOT EXISTS size VARCHAR(100)`;
const addProductShelfLifeColumnQuery = `ALTER TABLE products ADD COLUMN IF NOT EXISTS shelf_life VARCHAR(100)`;
const addProductCertificationColumnQuery = `ALTER TABLE products ADD COLUMN IF NOT EXISTS certification VARCHAR(100)`;
const addOrderShippingAddressColumnQuery = `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT`;

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
  await db.query(addBankAccountNameColumnToStoreQuery);
  await db.query(addEwalletOwnerNameColumnToStoreQuery);
  await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP`);
  await db.query(addUserDeletedColumnQuery);

  await db.query(addBank1ColumnToStoreQuery);
  await db.query(addBank2ColumnToStoreQuery);
  await db.query(addBank3ColumnToStoreQuery);
  await db.query(addBank4ColumnToStoreQuery);
  await db.query(addEwallet1ColumnToStoreQuery);
  await db.query(addEwallet2ColumnToStoreQuery);
  await db.query(addEwallet3ColumnToStoreQuery);
  await db.query(addEwallet4ColumnToStoreQuery);
  await db.query(addQrisUrlColumnToStoreQuery);
  await db.query(addPaymentProofUrlToTransactionsQuery);

  // New columns from approved plan
  await db.query(addProductBrandColumnQuery);
  await db.query(addProductSizeColumnQuery);
  await db.query(addProductShelfLifeColumnQuery);
  await db.query(addProductCertificationColumnQuery);
  await db.query(addOrderShippingAddressColumnQuery);
};