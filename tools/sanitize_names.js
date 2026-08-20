/**
 * Decofy Studios — Batch Asset Name Sanitizer
 * Recursively renames all files and folders to lowercase, URL-safe format:
 * - Converts to lowercase
 * - Replaces spaces, brackets, ampersands, and special characters with single underscores or dashes
 * - Fixes duplicated extensions (e.g., .pdf.pdf -> .pdf)
 * 
 * Usage:
 *   node tools/sanitize_names.js "C:\\path\\to\\your\\downloaded_folder"
 */

const fs = require('fs');
const path = require('path');

function sanitizeName(name, isDirectory = false) {
  let ext = '';
  let base = name;

  if (!isDirectory) {
    // Fix double extensions like .pdf.pdf or .jpg.jpg
    base = base.replace(/(\.[a-z0-9]+)\1+$/i, '$1');
    ext = path.extname(base).toLowerCase();
    base = path.basename(base, ext);
  }

  // Clean base name: lowercase, replace non-alphanumeric with underscore
  let cleanBase = base
    .toLowerCase()
    .trim()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  if (!cleanBase) cleanBase = 'file';

  return isDirectory ? cleanBase : cleanBase + ext;
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.error(`Directory does not exist: ${dirPath}`);
    return;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  // First, process all subdirectories recursively
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullSubPath = path.join(dirPath, entry.name);
      processDirectory(fullSubPath);
    }
  }

  // Next, rename files in this directory
  const currentEntries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of currentEntries) {
    const oldPath = path.join(dirPath, entry.name);
    const newName = sanitizeName(entry.name, entry.isDirectory());
    const newPath = path.join(dirPath, newName);

    if (oldPath !== newPath) {
      if (fs.existsSync(newPath)) {
        // Prevent accidental collisions
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        const ext = entry.isDirectory() ? '' : path.extname(newName);
        const base = entry.isDirectory() ? newName : path.basename(newName, ext);
        const resolvedPath = path.join(dirPath, `${base}_${randomSuffix}${ext}`);
        fs.renameSync(oldPath, resolvedPath);
        console.log(`[Renamed (collision avoided)] ${entry.name} -> ${path.basename(resolvedPath)}`);
      } else {
        fs.renameSync(oldPath, newPath);
        console.log(`[Renamed] ${entry.name} -> ${newName}`);
      }
    }
  }
}

const targetDir = process.argv[2];
if (!targetDir) {
  console.log('Please provide a folder path. Example:');
  console.log('  node tools/sanitize_names.js "C:\\Users\\ASUS\\Downloads\\SOCIAL MEDIA"');
} else {
  console.log(`\n--- Starting Asset Sanitization on: ${targetDir} ---`);
  processDirectory(path.resolve(targetDir));
  console.log('--- Finished! All files and folders are now clean lowercase and URL-safe. ---\n');
}
