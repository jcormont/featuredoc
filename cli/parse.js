import path from "path";
import { addNewline, collate } from "./collate.js";
import { loadAndProcessFile } from "./loader.js";

// Regular expressions for matching documentation patterns
const DOC_FILE_PATTERN = /##@@\s+FeatureDoc\s+@@##/;
const DOC_LINE_PATTERN = /^\s*(?:\/\/|##)@@\s?(.*)$/;
const IMPORT_PATTERN = /^\s*\+import\s+(.+)\s*$/;
const REF_PATTERN = /^\s*\+ref\s+(.+)\s*$/;

// Regular expressions for detecting list items
const UNORDERED_LIST_PATTERN = /^\s*[-*]\s+/;
const ORDERED_LIST_PATTERN = /^\s*\d+\.\s+/;

/**
 * Check if a line is part of a list (ordered or unordered)
 * @param {string} line The documentation line to check
 * @returns {boolean} True if the line is part of a list
 */
function isListItem(line) {
  return UNORDERED_LIST_PATTERN.test(line) || ORDERED_LIST_PATTERN.test(line);
}

/**
 * Parse a file and process its documentation
 * @param {string} filePath Path to the file
 * @param {string} content Content of the file
 */
export async function parseFile(filePath, content) {
  const lines = content.split("\n");

  // Check for full file documentation marker
  if (content.match(DOC_FILE_PATTERN)) {
    for (let i = 0; i < lines.length; i++) {
      lines[i] = "//@@ " + lines[i];
    }
  }

  const references = [];
  let lastDocLineIndex = -1;
  let wasListItem = false;

  // Process line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for documentation line
    const docMatch = line.match(DOC_LINE_PATTERN);
    if (docMatch) {
      const docLine = docMatch[1];

      // Check if it's an import
      const importMatch = docLine.match(IMPORT_PATTERN);
      if (importMatch) {
        await recurseLoad(filePath, importMatch[1]);
        continue;
      }

      // Check if it's a reference
      const refMatch = docLine.match(REF_PATTERN);
      if (refMatch) {
        references.push(refMatch[1]);
        continue;
      }

      // Check if we need to add a newline
      const isCurrentLineListItem = isListItem(docLine);
      if (lastDocLineIndex !== -1 && lastDocLineIndex !== i - 1) {
        // Lines are not contiguous
        if (!(isCurrentLineListItem && wasListItem)) {
          addNewline();
        }
      }

      // Add the documentation line
      collate([docLine]);

      // Update tracking variables
      lastDocLineIndex = i;
      wasListItem = isCurrentLineListItem;
    }
  }

  // Add a newline if the last line is not a newline
  addNewline();

  // Process references
  for (const refPath of references) {
    await recurseLoad(filePath, refPath);
  }
}

/**
 * Recursively load and process a file
 * @param {string} sourcePath Path to the original file
 * @param {string} filePath Path to the file to load
 */
async function recurseLoad(sourcePath, filePath) {
  const resolvedPath = path.resolve(path.dirname(sourcePath), filePath);
  await loadAndProcessFile(resolvedPath);
}
