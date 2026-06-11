import jwt from "jsonwebtoken";
import { db } from "../config/db.config.js";

export const authMiddleware = async (req, res, next) => {
  const token =
    req.cookies.access_token || req.headers.authorization?.split(" ")[1];

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is soft deleted
    const { rows } = await db.query("SELECT is_deleted FROM users WHERE id = $1", [decoded.id]);
    if (!rows[0] || rows[0].is_deleted) {
      return res.status(403).json({ message: "Akun Anda telah dinonaktifkan atau dihapus." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.sendStatus(401);
  }
};
