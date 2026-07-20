import crypto from "crypto";

const KEY_PREFIX = "csk_live_";

// new raw API key + its hash.shown to user once.
export function generateApiKey() {
    const rawSecret = crypto.randomBytes(32).toString("hex"); 
    const rawKey = `${KEY_PREFIX}${rawSecret}`;
    const keyHash = hashApiKey(rawKey);
    const keyPrefix = rawKey.slice(0, 16);

    return { rawKey, keyHash, keyPrefix };
}

// hash for lookup
export function hashApiKey(rawKey) {
    return crypto.createHash("sha256").update(rawKey).digest("hex");
}