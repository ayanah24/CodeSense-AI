import express from "express";
import rateLimit from "express-rate-limit";
import ApiKey from "../models/ApiKey.js";
import { generateApiKey } from "../utils/apiKey.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

//Rate limiter for key generation
const generateKeyLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => req.user?.userId || req.ip,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many keys generated. Try again in an hour." },
});

const MAX_KEYS_PER_USER = 25;

// POST /api/keys
router.post("/", authMiddleware, generateKeyLimiter, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Key name is required" });
        }

        // Per-user key cap
        const activeKeyCount = await ApiKey.countDocuments({
            userId: req.user.userId,
            revoked: false,
        });
        if (activeKeyCount >= MAX_KEYS_PER_USER) {
            return res.status(403).json({
                error: `Maximum of ${MAX_KEYS_PER_USER} active keys allowed. Revoke an existing key first.`,
            });
        }

        const { rawKey, keyHash, keyPrefix } = generateApiKey();

        await ApiKey.create({
            userId: req.user.userId,
            name,
            keyHash,
            keyPrefix,
        });
        res.status(201).json({ apiKey: rawKey, keyPrefix, name });
    } catch (err) {
        console.error("API key generation error:", err);
        res.status(500).json({ error: "Failed to generate API key" });
    }
});

// GET /api/keys
router.get("/", authMiddleware, async (req, res) => {
    try {
        const keys = await ApiKey.find({ userId: req.user.userId }).select(
            "name keyPrefix revoked lastUsedAt createdAt"
        );
        res.json({ keys });
    } catch (err) {
        console.error("API key fetch error:", err);
        res.status(500).json({ error: "Failed to load API keys" });
    }
});

// DELETE /api/keys/:id
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const key = await ApiKey.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { revoked: true },
            { new: true }
        );
        if (!key) return res.status(404).json({ error: "Key not found" });
        res.json({ message: "Key revoked" });
    } catch (err) {
        console.error("API key revoke error:", err);
        res.status(500).json({ error: "Failed to revoke key" });
    }
});

export default router;