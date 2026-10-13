"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsersAdmin = exports.getStats = void 0;
const store_1 = require("../services/store");
const pubsub_1 = require("../services/pubsub");
const getStats = async (req, res) => {
    try {
        const stats = await store_1.StoreService.getAdminStats();
        const pubSubStatus = pubsub_1.pubSubService.getStatus();
        res.json({
            ...stats,
            pubSubStatus,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getStats = getStats;
const getAllUsersAdmin = async (req, res) => {
    try {
        const users = await store_1.StoreService.getAllUsers();
        res.json({ users });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllUsersAdmin = getAllUsersAdmin;
