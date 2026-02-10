import { serverConfig } from "../config";
import logger from "../config/logger.config";
import { CacheRepository } from "../repositories/cache.repository";
import { UrlRepository } from "../repositories/url.repository";
import { toBase62 } from "../utils/base62";
import { NotFoundError } from "../utils/errors/app.error";

export class UrlService {
    constructor(
        private readonly urlRepository: UrlRepository,
        private readonly cacheRepository: CacheRepository
    ) { }

    async createShortUrl(originalUrl: string) {
        const nextId = await this.cacheRepository.getNextId();
        logger.info(`Next Id for URL shortening: ${nextId}`);

        const shortUrl = toBase62(nextId);
        logger.info(`Generated short url: ${shortUrl}`);

        const url = await this.urlRepository.create({
            originalUrl,
            shortUrl
        });
        logger.info(`Created URL for original URL`);
        // cache the url mapping
        await this.cacheRepository.setUrlMapping(shortUrl, originalUrl);

        const baseUrl = serverConfig.BASE_URL;
        const fullUrl = `${baseUrl}/${shortUrl}`;

        logger.info("Full URL generated for short URL");
        return {
            id: url.id.toString(),
            shortUrl,
            originalUrl,
            fullUrl,
            createdAt: url.createdAt,
            updatedAt: url.updatedAt
        };
    }


    async getOriginalUrl(shortUrl: string) {
        logger.info("Get Original URL for shor URL." + shortUrl);
        const originalUrl = await this.cacheRepository.getUrlMapping(shortUrl);
        logger.info("Fecthed original URL frim chache for short URL" + originalUrl)
        if (originalUrl) {
            await this.urlRepository.incrementClicks(shortUrl);

            return {
                originalUrl,
                shortUrl
            }
        }

        const url = await this.urlRepository.findByShortUrl(shortUrl);
        logger.info("Fetched original URL from db for short URL" + url)
        if (!url) {
            throw new NotFoundError('URL not found');
        }

        await this.urlRepository.incrementClicks(shortUrl);
        logger.info("Incremented click count for short URL in DB");

        await this.cacheRepository.setUrlMapping(shortUrl, url.originalUrl);
        logger.info("Cached original URL for short URL in Redis");
        return {
            originalUrl: url.originalUrl,
            shortUrl
        }
    }

    async incrementClicks(shortUrl: string) {
        logger.info("Incremented click count for short URL in DB");
        await this.urlRepository.incrementClicks(shortUrl);
        return;
    }
}