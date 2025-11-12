import { createClient } from "redis";
import { serverConfig } from ".";
import logger from "./logger.config";

export const redisClient = createClient({
    url: serverConfig.REDIS_URL
});

redisClient.on('error', (err) => {
    console.log("Redis error", err);
});

redisClient.on('connect', () => {
    console.log("Redis connected");
});

export async function initRedis() {
    try {
        logger.info("Connecting to Redis");
        await redisClient.connect();
        logger.info("Redis connected successfully");
    } catch (error) {
        logger.error("Redis connection error", error);
        throw error;
    }
}

export async function closeRedis() {
    logger.info("Closing Redis Connection");
    await redisClient.quit();
}
