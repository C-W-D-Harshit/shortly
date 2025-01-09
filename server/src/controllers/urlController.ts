import { catchAsyncErrors } from "@/utils/catchAsyncErrors";
import { prisma } from "@/utils/prisma";
import { generateShortId, isValidUrl } from "@/utils/urlUtils";
import redis from "@/utils/redis";
import { Request, Response } from "express";

// Constants for cache configuration
const CACHE_TTL_SECONDS = 3600; // 1 hour cache duration

/**
 * Custom error class for HTTP errors with status codes
 */
class HTTPError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "HTTPError";
  }
}

interface CreateURLRequest {
  longUrl: string;
}

/**
 * Ensures URL has a proper protocol prefix
 * @param url URL to normalize
 * @returns Normalized URL with protocol
 */
function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

export const createURL = catchAsyncErrors(
  async (req: Request, res: Response) => {
    let { longUrl } = req.body as CreateURLRequest;

    if (!longUrl) {
      throw new HTTPError("URL is required", 400);
    }

    // Normalize the URL before validation and storage
    longUrl = normalizeUrl(longUrl);

    if (!isValidUrl(longUrl)) {
      throw new HTTPError("Invalid URL format", 400);
    }

    const shortId = generateShortId();
    const shortUrl = `${process.env.BASE_URL}/${shortId}`;

    // Create URL mapping in database
    const urlMapping = await prisma.uRLMapping.create({
      data: {
        longUrl,
        shortId,
      },
    });

    // Cache the URL mapping
    await redis.set(shortId, urlMapping.longUrl, {
      ex: CACHE_TTL_SECONDS,
    });

    res.status(201).json({
      shortUrl,
      shortId,
      longUrl: urlMapping.longUrl,
    });
  }
);

export const redirectToLongUrl = catchAsyncErrors(async (req, res) => {
  const { shortId } = req.params;

  if (!shortId) {
    throw new HTTPError("Short ID is required", 400);
  }

  console.log("Attempting to redirect shortId:", shortId);

  // Try to get the URL from cache first
  const cachedUrl = await redis.get<string>(shortId);

  if (cachedUrl) {
    const normalizedUrl = normalizeUrl(cachedUrl);
    console.log("Redirecting to cached URL:", normalizedUrl);
    return res.redirect(301, normalizedUrl);
  }

  // If not in cache, query the database
  const urlMapping = await prisma.uRLMapping.findUnique({
    where: { shortId: shortId },
  });

  if (!urlMapping) {
    throw new HTTPError("URL not found", 404);
  }

  // Cache the result for future requests
  await redis.set(shortId, urlMapping.longUrl, {
    ex: CACHE_TTL_SECONDS,
  });

  const normalizedUrl = normalizeUrl(urlMapping.longUrl);
  console.log("Redirecting to database URL:", normalizedUrl);
  return res.redirect(301, normalizedUrl);
});
