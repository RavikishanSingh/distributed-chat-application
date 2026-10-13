"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_1 = require("../services/store");
const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/distributed_chat_db';
    try {
        await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`[MongoDB] Connected successfully to ${mongoURI}`);
        await (0, store_1.seedDefaults)();
    }
    catch (err) {
        console.warn(`[MongoDB] Connection warning: ${err.message}. Running in fallback state...`);
    }
};
exports.connectDB = connectDB;
