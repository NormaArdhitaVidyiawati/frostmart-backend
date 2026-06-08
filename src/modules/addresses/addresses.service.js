import * as repository from "./addresses.repository.js";

const normalizeAddress = (address) => ({
  id: address.id,
  user_id: address.user_id,
  address_type: address.address_type,
  recipient_name: address.recipient_name,
  city_district: address.city_district,
  postal_code: address.postal_code,
  full_address: address.full_address,
  is_primary: address.is_primary,
  created_at: address.created_at,
});

export const getMyAddresses = async (userId) => {
  const addresses = await repository.getAddressesByUserId(userId);
  return addresses.map(normalizeAddress);
};

export const createAddress = async (userId, data) => {
  const count = await repository.countAddressesByUserId(userId);
  const payload = {
    ...data,
    is_primary: data.is_primary ?? count === 0,
  };

  if (payload.is_primary) {
    await repository.clearPrimaryAddresses(userId);
  }

  const created = await repository.createAddress(userId, payload);
  return normalizeAddress(created);
};

export const updateAddress = async (userId, id, data) => {
  const existing = await repository.getAddressById(id, userId);
  if (!existing) throw new Error("Address not found");

  const payload = {
    address_type: data.address_type ?? existing.address_type,
    recipient_name: data.recipient_name ?? existing.recipient_name,
    city_district: data.city_district ?? existing.city_district,
    postal_code: data.postal_code ?? existing.postal_code,
    full_address: data.full_address ?? existing.full_address,
    is_primary: data.is_primary ?? existing.is_primary,
  };

  if (payload.is_primary) {
    await repository.clearPrimaryAddresses(userId);
  }

  const updated = await repository.updateAddress(id, userId, payload);
  return normalizeAddress(updated);
};

export const deleteAddress = async (userId, id) => {
  const existing = await repository.getAddressById(id, userId);
  if (!existing) throw new Error("Address not found");

  const deleted = await repository.deleteAddress(id, userId);

  if (deleted?.is_primary) {
    const remaining = await repository.getAddressesByUserId(userId);
    if (remaining.length > 0) {
      await repository.clearPrimaryAddresses(userId);
      const first = remaining[0];
      await repository.updateAddress(first.id, userId, { is_primary: true });
    }
  }

  return { message: "Address deleted successfully" };
};