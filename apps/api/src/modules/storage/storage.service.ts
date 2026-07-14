import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

@Injectable()
export class StorageService {
  constructor(private readonly config: ConfigService) {
    if (config.get('STORAGE_DRIVER') === 'cloudinary')
      cloudinary.config({
        cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
        api_key: config.get('CLOUDINARY_API_KEY'),
        api_secret: config.get('CLOUDINARY_API_SECRET'),
      });
  }
  async store(file: Express.Multer.File): Promise<{
    url: string;
    base64: string;
    mediaType: 'image/png' | 'image/jpeg' | 'image/webp';
  }> {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype))
      throw new UnsupportedMediaTypeException('Only PNG, JPEG and WebP images are supported');
    const mediaType = file.mimetype as 'image/png' | 'image/jpeg' | 'image/webp';
    const base64 = file.buffer.toString('base64');
    if (this.config.get('STORAGE_DRIVER') === 'cloudinary') {
      const result = await cloudinary.uploader.upload(`data:${mediaType};base64,${base64}`, {
        folder: 'mesh',
        resource_type: 'image',
      });
      return { url: result.secure_url, base64, mediaType };
    }
    const directory = resolve(this.config.get('UPLOAD_DIR', './uploads'));
    await mkdir(directory, { recursive: true });
    const name = `${randomUUID()}${extname(file.originalname) || this.extension(mediaType)}`;
    await writeFile(resolve(directory, name), file.buffer);
    return { url: `/uploads/${name}`, base64, mediaType };
  }
  private extension(mediaType: string): string {
    return mediaType === 'image/png' ? '.png' : mediaType === 'image/webp' ? '.webp' : '.jpg';
  }
}
