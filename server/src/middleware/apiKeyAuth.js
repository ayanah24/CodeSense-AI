import ApiKey from "../models/ApiKey.js";
import { hashApiKey } from "../utils/apiKey.js";

export async function apiKeyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid API key" });
    }

    const rawKey = authHeader.slice(7).trim();

    if (!rawKey || !rawKey.startsWith("csk_live_")) {
      return res.status(401).json({ error: "Missing or invalid API key" });
    }

    const incomingHash = hashApiKey(rawKey);

    const keyDoc = await ApiKey.findOne({ keyHash: incomingHash });

    if (!keyDoc || keyDoc.revoked) {
      return res.status(401).json({ error: "Missing or invalid API key" });
    }

    req.user = { userId: keyDoc.userId.toString() };
    req.apiKeyId = keyDoc._id;

    //update last used
    ApiKey.updateOne({ _id: keyDoc._id }, { lastUsedAt: new Date() }).catch(
      (err) => console.error("Failed to update lastUsedAt:", err.message)
    );

    next();
  } catch (err) {
    console.error("API key auth error:", err.message);
    return res.status(401).json({ error: "Missing or invalid API key" });
  }
}