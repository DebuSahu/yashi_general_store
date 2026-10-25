import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { authenticateAdmin } from './auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Allowed image MIME types and extensions
const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg'
};

/**
 * POST /api/upload
 * Accepts base64 image data from local browse file picker
 * Body: { image: "data:image/png;base64,...", filename: "my-photo.png" }
 */
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { image, filename } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    let mimeType = 'image/jpeg';
    let base64Data = image;

    // Check if it is a Data URL (e.g. data:image/png;base64,iVBORw0KGgo...)
    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1].toLowerCase();
      base64Data = matches[2];
    }

    const extension = MIME_TO_EXT[mimeType] || (filename ? path.extname(filename).replace('.', '') : 'jpg') || 'jpg';
    const buffer = Buffer.from(base64Data, 'base64');

    // Limit image size to 15MB
    if (buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image size exceeds maximum allowed limit (15 MB)' });
    }

    // Generate unique safe file name
    const safeBaseName = filename
      ? path.basename(filename, path.extname(filename)).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30)
      : 'photo';
    const uniqueFileName = `${safeBaseName}_${Date.now()}_${uuidv4().substring(0, 8)}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);

    await fs.promises.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${uniqueFileName}`;

    return res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      filename: uniqueFileName,
      url: relativeUrl
    });
  } catch (err) {
    console.error('Error uploading photo:', err);
    return res.status(500).json({ error: 'Failed to save uploaded photo on server' });
  }
});

export default router;

