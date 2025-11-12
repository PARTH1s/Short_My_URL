import logger from '../config/logger.config';
import { Url, IUrl } from '../models/Url';

export interface CreateUrl {
    originalUrl: string;
    shortUrl: string;
}

export interface UrlStats {
    id: string;
    originalUrl: string;
    shortUrl: string;
    clicks: number;
    createdAt: Date;
    updatedAt: Date;
}

export class UrlRepository {
    async create(data: CreateUrl): Promise<IUrl> {
        const url = new Url(data);
        logger.info("Created new url mapping in DB")
        return await url.save();
    }

    async findByShortUrl(shortUrl: string): Promise<IUrl | null> {
        logger.info("Fetching url mapping from DB");
        return await Url.findOne({ shortUrl });
    }

    async findAll() {
        logger.info("Fetching all the url mappings from DB");
        const urls = await Url.find().select({
            _id: 1,
            originalUrl: 1,
            shortUrl: 1,
            clicks: 1,
            createdAt: 1,
            updatedAt: 1
        }).sort({ createdAt: -1 });
        logger.info("Fetched all url from DB for mapping");
        return urls.map(url => ({
            id: url._id?.toString() || '',
            originalUrl: url.originalUrl,
            shortUrl: url.shortUrl,
            clicks: url.clicks,
            createdAt: url.createdAt,
            updatedAt: url.updatedAt
        }));
    }

    async incrementClicks(shortUrl: string): Promise<void> {
        logger.info("Incrementing click count for short url in DB");
        await Url.findOneAndUpdate(
            { shortUrl },
            { $inc: { clicks: 1 } }
        );
        return;
    }

    async findStatsByShortUrl(shortUrl: string): Promise<UrlStats | null> {
        logger.info("Finding Stats by short url from DB");
        const url = await Url.findOne({ shortUrl }).select({
            _id: 1,
            originalUrl: 1,
            shortUrl: 1,
            clicks: 1,
            createdAt: 1,
            updatedAt: 1
        });

        if (!url) return null;
        logger.info("Fetched url status DB for mapping");
        return {
            id: url._id?.toString() || '',
            originalUrl: url.originalUrl,
            shortUrl: url.shortUrl,
            clicks: url.clicks,
            createdAt: url.createdAt,
            updatedAt: url.updatedAt
        }
    }
}