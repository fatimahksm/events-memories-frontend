import { appConfig } from '@/config/app-config';

export type UploadValidationError = 'tooLarge' | 'unsupported';

export function validateUploadFile(file: File): UploadValidationError | null {
  const image = appConfig.uploads.allowedImageMimeTypes.includes(file.type as never);
  const video = appConfig.uploads.allowedVideoMimeTypes.includes(file.type as never);
  if (!image && !video) return 'unsupported';
  if (image && file.size > appConfig.uploads.maxImageBytes) return 'tooLarge';
  if (video && file.size > appConfig.uploads.maxVideoBytes) return 'tooLarge';
  return null;
}
