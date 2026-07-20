import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
        },
        keyHash: {
            type: String,
            required: true,
            unique: true,
        },
        keyPrefix: {
            type: String, 
            required: true,
        },
        revoked: {
            type: Boolean,
            default: false,
        },
        lastUsedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const ApiKey = mongoose.model("ApiKey", apiKeySchema);
export default ApiKey;