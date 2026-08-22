const required = (value: string | undefined, fallback: string) => value?.trim() || fallback;
const asNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const appConfig = {
  // Relative by default so requests go through the same-origin proxy in next.config.ts
  // (rewrites /api/* to the real backend) — keeps auth cookies first-party instead of
  // cross-site, which Safari blocks outright. Only override this for a setup that isn't
  // proxied through this Next.js app at all.
  apiBaseUrl: required(process.env.NEXT_PUBLIC_API_BASE_URL, '/api'),
  defaultLocale: required(process.env.NEXT_PUBLIC_DEFAULT_LOCALE, 'en'),
  requestTimeoutMs: asNumber(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT_MS, 20000),
  uploadTimeoutMs: asNumber(process.env.NEXT_PUBLIC_UPLOAD_TIMEOUT_MS, 120000),
  uploads: {
    maxImageBytes: asNumber(process.env.NEXT_PUBLIC_MAX_IMAGE_MB, 15) * 1024 * 1024,
    maxVideoBytes: asNumber(process.env.NEXT_PUBLIC_MAX_VIDEO_MB, 250) * 1024 * 1024,
    maxFilesPerUpload: asNumber(process.env.NEXT_PUBLIC_MAX_FILES_PER_UPLOAD, 20),
    maxConcurrentUploads: asNumber(process.env.NEXT_PUBLIC_MAX_CONCURRENT_UPLOADS, 3),
    maxRetries: asNumber(process.env.NEXT_PUBLIC_UPLOAD_MAX_RETRIES, 3),
    allowedImageMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
    allowedVideoMimeTypes: ['video/mp4', 'video/quicktime'] as const
  }
} as const;
