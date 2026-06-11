import * as repository from "./store-registrations.repository.js";
import { uploadImage } from "../../utils/cloudinary.js";

export const registerStore = async (userId, data, files) => {
  // Check if user already has a pending or approved registration
  const existing = await repository.getRegistrationByUserId(userId);
  if (existing && (existing.status === "pending" || existing.status === "approved")) {
    throw new Error("Anda sudah memiliki pendaftaran toko yang aktif atau sedang ditinjau.");
  }

  // Upload KTP image (required)
  if (!files?.ktp_image?.[0]) {
    throw new Error("Foto KTP wajib diunggah.");
  }
  const ktpUpload = await uploadImage(files.ktp_image[0].buffer);
  data.ktp_image_url = ktpUpload.secure_url;

  // Upload product proofs (optional but highly recommended)
  if (files?.product_proof_1?.[0]) {
    const proof1Upload = await uploadImage(files.product_proof_1[0].buffer);
    data.product_proof_1_url = proof1Upload.secure_url;
  }
  if (files?.product_proof_2?.[0]) {
    const proof2Upload = await uploadImage(files.product_proof_2[0].buffer);
    data.product_proof_2_url = proof2Upload.secure_url;
  }

  // Upload QRIS image
  if (files?.qris_image?.[0]) {
    const qrisUpload = await uploadImage(files.qris_image[0].buffer);
    data.qris_url = qrisUpload.secure_url;
  }

  return await repository.createRegistration(userId, data);
};

export const getMyRegistration = async (userId) => {
  return await repository.getRegistrationByUserId(userId);
};

export const getActiveStore = async () => {
  return await repository.getActiveStore();
};

export const updateStore = async (id, data, files) => {
  const existing = await repository.getRegistrationById(id);
  if (!existing) {
    throw new Error("Pendaftaran toko tidak ditemukan.");
  }

  // Upload KTP image (if provided)
  if (files?.ktp_image?.[0]) {
    const ktpUpload = await uploadImage(files.ktp_image[0].buffer);
    data.ktp_image_url = ktpUpload.secure_url;
  } else {
    data.ktp_image_url = existing.ktp_image_url;
  }

  // Upload product proofs (if provided)
  if (files?.product_proof_1?.[0]) {
    const proof1Upload = await uploadImage(files.product_proof_1[0].buffer);
    data.product_proof_1_url = proof1Upload.secure_url;
  } else {
    data.product_proof_1_url = existing.product_proof_1_url;
  }

  if (files?.product_proof_2?.[0]) {
    const proof2Upload = await uploadImage(files.product_proof_2[0].buffer);
    data.product_proof_2_url = proof2Upload.secure_url;
  } else {
    data.product_proof_2_url = existing.product_proof_2_url;
  }

  // Upload QRIS image (if provided)
  if (files?.qris_image?.[0]) {
    const qrisUpload = await uploadImage(files.qris_image[0].buffer);
    data.qris_url = qrisUpload.secure_url;
  } else {
    data.qris_url = existing.qris_url;
  }

  return await repository.updateRegistration(id, data);
};

export const deleteStore = async (id) => {
  const existing = await repository.getRegistrationById(id);
  if (!existing) {
    throw new Error("Pendaftaran toko tidak ditemukan.");
  }
  return await repository.deleteRegistration(id);
};
