import { Injectable, OnModuleInit } from "@nestjs/common"
import { RedisClientType, createClient } from "redis"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class RedisService implements OnModuleInit {
    private client: RedisClientType; //solo se puede usar dentro de la misma clase

    constructor(private configService: ConfigService) {
        const host = this.configService.get('REDIS_HOST', 'localhost');
        const port = this.configService.get('REDIS_PORT', 6379);
        console.log(`Connecting to Redis at ${host}:${port}`);

        this.client = createClient({
            url: `redis://${host}:${port}`,
            socket: {
                reconnectStrategy: (retries) => {
                    console.log(`Redis reconnection attempt ${retries}`);
                    return Math.min(retries * 100, 3000);
                }
            }
        });

        this.client.on('error', (err) => console.log('Redis Client Error:', err));
        this.client.on('connect', () => console.log('Redis Client Connected'));
        this.client.on('ready', () => console.log('Redis Client Ready'));
        this.client.on('end', () => console.log('Redis Client Connection Ended'));
    }

    async onModuleInit() {
        try {
            await this.client.connect();
            console.log('Redis connection established');
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            throw error;
        }
    }

    async getClient(): Promise<RedisClientType> {
        if (!this.client.isOpen) {
            console.log('Redis client not open, attempting to connect...');
            await this.client.connect();
        }
        return this.client;
    }
}