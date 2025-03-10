import { readFile } from "fs/promises";
import { isTextFile } from "./istext.js";
import { parseFile } from "./parse.js";
import path from "path";

/** Files we've already processed */
const processedFiles = new Set();

/**
 * Load and process a file's content
 * @param {string} filePath Path to the file to process (absolute path)
 */
export async function loadAndProcessFile(filePath) {
  // Check if path is absolute
  if (!path.isAbsolute(filePath)) {
    console.error(`File path must be absolute: ${filePath}`);
    return;
  }

  // Skip if already processed
  if (processedFiles.has(filePath)) return;
  processedFiles.add(filePath);

  try {
    // Read binary file content first
    const binaryContent = await readFile(filePath);

    // Skip binary files
    if (!isTextFile(filePath, binaryContent)) {
      console.log(`Skipping binary file: ${filePath}`);
      return;
    }

    // Parse file and collate documentation
    const textContent = binaryContent.toString("utf8");
    await parseFile(filePath, textContent);
  } catch (error) {
    console.error(`Error processing file ${filePath}.\n`, error);
  }
}
