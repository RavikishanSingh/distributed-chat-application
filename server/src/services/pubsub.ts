import Redis from 'ioredis';
import { EventEmitter } from 'events';

class PubSubService extends EventEmitter {
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private isRedisConnected: boolean = false;

  constructor() {
    super();
    this.initRedis();
  }

  private initRedis() {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    try {
      this.publisher = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      });

      this.subscriber = new Redis(redisUrl, {
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
    } catch {
      console.log('[PubSub] Using In-Memory fallback pub-sub channel');
      this.isRedisConnected = false;
    }
  }

  private subscribeChannels() {
    if (this.subscriber) {
      this.subscriber.subscribe('CHAT_CHANNEL', 'PRESENCE_CHANNEL', (err) => {
        if (err) console.error('[Redis Pub/Sub] Subscription failed:', err);
      });

      this.subscriber.on('message', (channel, message) => {
        try {
          const parsed = JSON.parse(message);
          this.emit(channel, parsed);
        } catch (e) {
          console.error('[PubSub] Failed to parse Redis message:', e);
        }
      });
    }
  }

  public publish(channel: string, payload: any) {
    if (this.isRedisConnected && this.publisher) {
      this.publisher.publish(channel, JSON.stringify(payload));
    } else {
      // Internal event emitter fallback for single or memory-bridged nodes
      this.emit(channel, payload);
    }
  }

  public getStatus() {
    return {
      redisConnected: this.isRedisConnected,
      mode: this.isRedisConnected ? 'Redis Distributed Cluster' : 'In-Memory Distributed Emulator'
    };
  }
}

export const pubSubService = new PubSubService();
