import type { Context } from '@/types';
import { TABLE_NAME } from '@/models/prize';
import type { PrizeDb } from '@/schemas/prize';
import { writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Syncs prize images from the database to the public folder.
 * Creates image files in the format: /public/prizes/{prizeId}.{ext}
 * When no prizeId is provided, syncs all prizes and cleans up orphaned files.
 * When a prizeId is provided, syncs only that single prize image.
 */
export const syncPrizeImages = async (context: Context, prizeId?: string): Promise<void> => {
  const publicDir = join(__dirname, '..', 'public', 'prizes');

  // Ensure the prizes directory exists
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
    context.logger.info('Created public/prizes directory');
  }

  try {
    // Build query - fetch single prize or all prizes with images
    let query = context
      .db<PrizeDb>(TABLE_NAME)
      .select('id', 'image', 'image_type')
      .whereNotNull('image')
      .whereNotNull('image_type')
      .whereNull('deleted_at');

    if (prizeId) {
      query = query.where('id', prizeId);
    }

    const prizes = await query;

    if (prizeId) {
      context.logger.info(`Syncing image for prize ${prizeId}`);
    } else {
      context.logger.info(`Syncing ${prizes.length} prize images to public folder`);
    }

    const syncedPrizeIds = new Set<string>();

    // Write each prize image to the public folder
    for (const prize of prizes) {
      if (!prize.image || !prize.image_type) {
        continue;
      }

      // Determine file extension from MIME type
      const extension = getExtensionFromMimeType(prize.image_type);
      if (!extension) {
        context.logger.warn(
          `Unknown image type ${prize.image_type} for prize ${prize.id}, skipping`,
        );
        continue;
      }

      const filename = `${prize.id}.${extension}`;
      const filepath = join(publicDir, filename);

      try {
        writeFileSync(filepath, prize.image);
        syncedPrizeIds.add(prize.id);
        context.logger.debug(`Synced image for prize ${prize.id}`);
      } catch (error) {
        context.logger.error(`Failed to write image for prize ${prize.id}:`, error);
      }
    }

    // Clean up orphaned image files (only when syncing all prizes)
    let cleanedCount = 0;
    if (!prizeId) {
      const existingFiles = readdirSync(publicDir);

      for (const file of existingFiles) {
        // Extract prize ID from filename (format: {uuid}.{ext})
        const filePrizeId = file.split('.')[0];

        // Skip if not a valid UUID format or if it's the .gitkeep file
        if (file === '.gitkeep' || !filePrizeId || filePrizeId.length !== 36) {
          continue;
        }

        // Delete if the prize no longer exists or doesn't have an image
        if (!syncedPrizeIds.has(filePrizeId)) {
          try {
            unlinkSync(join(publicDir, file));
            cleanedCount++;
            context.logger.debug(`Removed orphaned image file: ${file}`);
          } catch (error) {
            context.logger.error(`Failed to remove orphaned file ${file}:`, error);
          }
        }
      }

      context.logger.info(
        `Prize image sync complete: ${syncedPrizeIds.size} images synced, ${cleanedCount} orphaned files removed`,
      );
    } else {
      context.logger.info(
        `Prize image sync complete: ${syncedPrizeIds.size} image(s) synced for prize ${prizeId}`,
      );
    }
  } catch (error) {
    context.logger.error('Failed to sync prize images:', error);
    throw error;
  }
};

/**
 * Maps MIME type to file extension
 */
const getExtensionFromMimeType = (mimeType: string): string | null => {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
  };

  return mimeMap[mimeType.toLowerCase()] || null;
};
