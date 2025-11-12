import { serverConfig } from "../config";
import logger from "../config/logger.config";
import { redisClient } from "../config/redis";
export class CacheRepository {

    async getNextId(): Promise<number> {
        const key = serverConfig.REDIS_COUNTER_KEY;
        logger.info(`Generating new Id frm Redis KEy: {key}`);
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        const result = await redisClient.incr(key);
        logger.info(`Generated new Id from Redis: ${result}`)
        return result;
    }

    async setUrlMapping(shortUrl: string, originalUrl: string) {
        const key = `url:${shortUrl}`;
        logger.info(`Mapping url in cache with key: ${key}`);
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        await redisClient.set(key, originalUrl, { EX: 86400 });
        logger.info("URL mapped in redis cache");
        return;
    }

    async getUrlMapping(shortUrl: string): Promise<string | null> {
        const key = `url:${shortUrl}`;
        logger.info(`Get URL for mapping: ${key}`);
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        const result = await redisClient.get(key);
        logger.info("Fetched url for mapping to add in cache");
        return result;
    }

    async deleteUrlMapping(shortUrl: string) {
        const key = `url:${shortUrl}`;
        logger.info("Deleting url mapping from cache");
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        await redisClient.del(key);
        logger.info("Deleted url mactching from cache");
        return;
    }
}