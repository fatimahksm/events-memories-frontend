const required = (value: string | undefined, fallback: string) => value?.trim() || fallback;
const asNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const appConfig = {
  apiBaseUrl: required(process.env.NEXT_PUBLIC_API_BASE_URL, 'http://localhost:8080/api'),
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
