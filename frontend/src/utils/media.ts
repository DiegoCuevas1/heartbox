const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "dcyk5quni";

const CLOUDINARY_HOST = "https://res.cloudinary.com";

/**
 * URL for an image stored in Cloudinary (by public_id), resized by Cloudinary
 * to `width` pixels with automatic format and quality. Use it with
 * `<Image unoptimized ...>` so Next.js doesn't re-process an image Cloudinary
 * already optimised; only the pixels the layout needs are downloaded.
 * Pass roughly 2x the displayed width for sharp results on retina screens.
 */
export function cldImage(publicId?: string | null, width = 800) {
  if (!publicId) return "/images/default_profpic.png";
  if (publicId.startsWith("http") || publicId.startsWith("/")) return publicId;
  return `${CLOUDINARY_HOST}/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_limit,w_${width}/${publicId}`;
}

/** URL for a video stored in Cloudinary, compressed for streaming. */
export function cldVideo(publicId?: string | null) {
  if (!publicId) return "";
  return `${CLOUDINARY_HOST}/${CLOUD_NAME}/video/upload/q_auto/${publicId}`;
}
