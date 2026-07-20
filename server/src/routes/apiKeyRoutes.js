import express from "express";
import ApiKey from "../models/ApiKey.js";
import { generateApiKey } from "../utils/apiKey.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/keys — generate a new API key (dashboard, JWT-protected)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Key name is required" });
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
    const keys = await ApiKey.find({ userId: req.user.userId }).select(
        "name keyPrefix revoked lastUsedAt createdAt"
    );
    res.json({ keys });
});

// DELETE /api/keys/:id — revoke a key
router.delete("/:id", authMiddleware, async (req, res) => {
    const key = await ApiKey.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { revoked: true },
        { new: true }
    );
    if (!key) return res.status(404).json({ error: "Key not found" });
    res.json({ message: "Key revoked" });
});

export default router;