import ImageKit from 'imagekit';
import dotenv from 'dotenv';

dotenv.config();

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

// Validate configuration
export const validateImageKitConfig = (): boolean => {
  const isValid = !!(
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
  );

  if (!isValid) {
    console.warn('⚠️  ImageKit credentials not configured. Image uploads will fail.');
  }

  return isValid;
};
