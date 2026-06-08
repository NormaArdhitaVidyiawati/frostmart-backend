import * as service from "./store-registrations.service.js";

export const registerStore = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await service.registerStore(userId, req.body, req.files);
    res.status(201).json({
      success: true,
      message: "Pendaftaran toko berhasil diajukan.",
      data: result,
    });
  } catch (error) {
    console.error("[registerStore] Error:", error.message, error.stack);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyRegistration = async (req, res) => {
  try {
    const userId = req.user.id;
    const registration = await service.getMyRegistration(userId);
    res.json({
      success: true,
      data: registration || null,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActiveStore = async (req, res) => {
  try {
    const activeStore = await service.getActiveStore();
    res.json({
      success: true,
      data: activeStore || null,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateStore = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await service.updateStore(id, req.body, req.files);
    res.json({
      success: true,
      message: "Data pendaftaran toko berhasil diperbarui.",
      data: result,
    });
  } catch (error) {
    console.error("[updateStore] Error:", error.message, error.stack);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteStore = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await service.deleteStore(id);
    res.json({
      success: true,
      message: "Data pendaftaran toko berhasil dihapus.",
      data: result,
    });
  } catch (error) {
    console.error("[deleteStore] Error:", error.message, error.stack);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
