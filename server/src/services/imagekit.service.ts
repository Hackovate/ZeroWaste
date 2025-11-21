import { imagekit } from '../config/imagekit';
import formidable, { File } from 'formidable';
import { Request } from 'express';
import fs from 'fs';
import path from 'path';

export const imagekitService = {
  /**
   * Parse multipart form data and upload image to ImageKit
   */
  async uploadImage(req: Request, userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const form = formidable({
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
        allowEmptyFiles: false,
        filter: (part) => {
          return part.mimetype?.startsWith('image/') || false;
        },
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          reject(new Error('Failed to parse form data'));
          return;
        }

        const imageFile = files.image as File | File[] | undefined;
        if (!imageFile) {
          reject(new Error('No image file provided'));
          return;
        }

        const file = Array.isArray(imageFile) ? imageFile[0] : imageFile;

        try {
          // Read file buffer
          const fileBuffer = fs.readFileSync(file.filepath);
          const fileName = `${Date.now()}-${userId}-${file.originalFilename || 'upload'}`;

          // Upload to ImageKit
          const response = await imagekit.upload({
            file: fileBuffer,
            fileName: fileName,
            folder: '/zerowaste', // Organize in folder
            tags: ['food', 'zerowaste'],
            useUniqueFileName: true,
          });

          // Clean up temp file
          fs.unlinkSync(file.filepath);

          resolve(response.url);
        } catch (error) {
          // Clean up temp file on error
          if (fs.existsSync(file.filepath)) {
            fs.unlinkSync(file.filepath);
          }
          reject(new Error('Failed to upload image to ImageKit'));
        }
      });
    });
  },

  /**
   * Upload image from file path (for seeding)
   */
  async uploadImageFromPath(filePath: string, fileName: string): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: fileName,
        folder: '/zerowaste/food-database',
        tags: ['food', 'zerowaste', 'food-database'],
        useUniqueFileName: true,
      });

      return response.url;
    } catch (error) {
      console.error('Failed to upload image from path:', error);
      throw new Error('Failed to upload image to ImageKit');
    }
  },

  /**
   * Delete image from ImageKit
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract fileId from ImageKit URL
      const fileId = imageUrl.split('/').pop()?.split('?')[0];
      if (!fileId) {
        throw new Error('Invalid ImageKit URL');
      }

      await imagekit.deleteFile(fileId);
    } catch (error) {
      console.error('Failed to delete image from ImageKit:', error);
      // Don't throw - allow operation to continue even if image deletion fails
    }
  },
};
