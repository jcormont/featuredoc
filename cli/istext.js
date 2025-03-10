/**
 * Determines if a file is a text file based on content and extension.
 * @param {string} filename - The name of the file
 * @param {Buffer|string} content - The content of the file
 * @returns {boolean} True if the file appears to be a text file
 */
export function isTextFile(filename, content) {
  // Check file extension against common binary files
  if (hasBinaryExtension(filename)) {
    return false;
  }

  // Check content for binary characters
  return !hasBinaryContent(content);
}

/**
 * Check if the file has a common binary file extension
 * @param {string} filename
 * @returns {boolean}
 */
function hasBinaryExtension(filename) {
  const binaryExtensions = [
    // Images
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".ico",
    ".svg",
    ".webp",
    // Audio/Video
    ".mp3",
    ".mp4",
    ".avi",
    ".mov",
    ".flv",
    ".wav",
    ".ogg",
    // Archives
    ".zip",
    ".rar",
    ".tar",
    ".gz",
    ".7z",
    // Documents
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    // Binaries
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".bin",
    // Other
    ".ttf",
    ".otf",
    ".woff",
    ".woff2",
  ];

  const lowerFilename = filename.toLowerCase();
  return binaryExtensions.some((ext) => lowerFilename.endsWith(ext));
}

/**
 * Check if the content has binary characters
 * @param {Buffer|string} content
 * @returns {boolean}
 */
function hasBinaryContent(content) {
  // Convert to buffer if it's a string
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);

  // Sample the first 1024 bytes (or less if file is smaller)
  const sampleSize = Math.min(1024, buffer.length);

  for (let i = 0; i < sampleSize; i++) {
    const byte = buffer[i];
    // Check for control characters except allowed ones: tab, newline, carriage return
    if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
      return true;
    }
  }

  return false;
}
