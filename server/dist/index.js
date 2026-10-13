"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const chatHandler_1 = require("./socket/chatHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static uploads
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'public', 'uploads')));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        serverNode: process.env.SERVER_ID || 'server-node-1',
        port: process.env.PORT || 5000,
        timestamp: new Date().toISOString(),
    });
});
// Setup Socket handlers
(0, chatHandler_1.setupSocketHandlers)(io);
const PORT = process.env.PORT || 5000;
// Connect Database & Start Server
(0, db_1.connectDB)().then(() => {
    server.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🚀 Distributed Chat Server Node running on PORT ${PORT}`);
        console.log(`🌐 Server Node ID: ${process.env.SERVER_ID || 'server-node-1'}`);
        console.log(`=======================================================`);
    });
});
