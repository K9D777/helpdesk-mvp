import * as fs from 'fs';
import * as path from 'path';

export const ensureUploadDirectory = (dir: string) => {
  const resolved = path.resolve(dir);
  fs.mkdirSync(resolved, { recursive: true });
  return resolved;
};

export const buildUploadPath = (ticketId: string, fileName: string) => {
  const root = path.resolve(process.cwd(), 'uploads', ticketId);
  ensureUploadDirectory(root);
  return path.join(root, fileName.replace(/\s+/g, '-'));
};
