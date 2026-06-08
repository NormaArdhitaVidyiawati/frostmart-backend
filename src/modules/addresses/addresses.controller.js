import * as service from "./addresses.service.js";
import { createAddressSchema, updateAddressSchema } from "./addresses.validation.js";

export const getMyAddresses = async (req, res) => {
  try {
    const data = await service.getMyAddresses(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createAddress = async (req, res) => {
  try {
    const data = createAddressSchema.parse(req.body);
    const result = await service.createAddress(req.user.id, data);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = updateAddressSchema.parse(req.body);
    const result = await service.updateAddress(req.user.id, id, data);
    res.json(result);
  } catch (error) {
    if (error.message === "Address not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(400).json({ message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await service.deleteAddress(req.user.id, id);
    res.json(result);
  } catch (error) {
    if (error.message === "Address not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(400).json({ message: error.message });
  }
};