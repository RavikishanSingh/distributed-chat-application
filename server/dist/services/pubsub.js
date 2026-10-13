"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pubSubService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const events_1 = require("events");
class PubSubService extends events_1.EventEmitter {
    publisher = null;
    subscriber = null;
    isRedisConnected = false;
    constructor() {
        super();
        this.initRedis();
    }
    initRedis() {
        const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
        try {
            this.publisher = new ioredis_1.default(redisUrl, {
                maxRetriesPerRequest: 1,
                retryStrategy: () => null,
            });
            this.subscriber = new ioredis_1.default(redisUrl, {
                maxRetriesPerRequest: 1,
                retryStrategy: () => null,
            });
            this.publisher.on('connect', () => {
                console.log('[Redis Pub/Sub] Publisher connected to Redis');
                this.isRedisConnected = true;
            });
            this.subscriber.on('connect', () => {
                console.log('[Redis Pub/Sub] Subscriber connected to Redis');
                this.subscribeChannels();
            });
            this.publisher.on('error', (err) => {
                if (this.isRedisConnected) {
                    console.warn('[Redis Pub/Sub] Redis Publisher Error:', err.message);
                }
                this.isRedisConnected = false;
            });
            this.subscriber.on('error', () => {
                this.isRedisConnected = false;
            });
        }
        catch {
            console.log('[PubSub] Using In-Memory fallback pub-sub channel');
            this.isRedisConnected = false;
        }
    }
    subscribeChannels() {
        if (this.subscriber) {
            this.subscriber.subscribe('CHAT_CHANNEL', 'PRESENCE_CHANNEL', (err) => {
                if (err)
                    console.error('[Redis Pub/Sub] Subscription failed:', err);
            });
            this.subscriber.on('message', (channel, message) => {
                try {
                    const parsed = JSON.parse(message);
                    this.emit(channel, parsed);
                }
                catch (e) {
                    console.error('[PubSub] Failed to parse Redis message:', e);
                }
            });
        }
    }
    publish(channel, payload) {
        if (this.isRedisConnected && this.publisher) {
            this.publisher.publish(channel, JSON.stringify(payload));
        }
        else {
            // Internal event emitter fallback for single or memory-bridged nodes
            this.emit(channel, payload);
        }
    }
    getStatus() {
        return {
            redisConnected: this.isRedisConnected,
            mode: this.isRedisConnected ? 'Redis Distributed Cluster' : 'In-Memory Distributed Emulator'
        };
    }
}
exports.pubSubService = new PubSubService();
