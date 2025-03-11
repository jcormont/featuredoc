#!/usr/bin/env node

import { glob } from "glob";
import { loadAndProcessFile } from "./loader.js";
import { getOutput } from "./collate.js";
import { readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * Get ignore patterns from a file (e.g. `.gitignore`)
 * @param {string} path The path to the file to get ignore patterns from
 * @returns {Promise<string[]>} List of ignore patterns
 */
async function getIgnored(path) {
  if (!existsSync(path)) {
    return [];
  }

  const content = await readFile(path, "utf-8");
  return (
    content
      .split("\n")
      .map((line) => line.trim())
      // Remove empty lines and comments
      .filter((line) => line && !line.startsWith("#"))
      // Add **/ prefix to make patterns match in subdirectories
      .map((pattern) =>
        pattern.startsWith("/") ? pattern.slice(1) : `**/${pattern}`
      )
  );
}

/**
 * Run files in a directory and all subdirectories
 * @param {string} basePath The base path to run files from
 * @param {string[]} ignorePatterns List of ignore patterns
 */
async function runFiles(basePath, ignorePatterns) {
  // Get all files in the current directory
  const files = await glob("**/*", {
    cwd: basePath,
    ignore: ignorePatterns,
    absolute: true,
    nodir: true,
    maxDepth: 1,
  });
  files.sort((a, b) => a.localeCompare(b));
  const mainFiles = files
    .filter((file) => file.match(/\W(index|main)\.[\w\.-]+$/i))
    .sort((a, b) => a.localeCompare(b));
  const allFiles = [
    ...mainFiles,
    ...files.filter((file) => !mainFiles.includes(file)),
  ];
  for (const file of allFiles) {
    await loadAndProcessFile(file);
  }

  // Recurse into subdirectories
  const dirs = await glob("**/", {
    cwd: basePath,
    ignore: ignorePatterns,
    nodir: false,
    maxDepth: 1,
  });
  dirs.sort((a, b) => a.localeCompare(b));
  for (const dir of dirs) {
    if (dir.startsWith(".")) continue;
    const dirPath = path.resolve(basePath, dir);
    if ((await stat(dirPath)).isDirectory()) {
      await runFiles(dirPath, ignorePatterns);
    }
  }
}

/**
 * Main function (async)
 */
async function main() {
  try {
    // Always ignore node_modules, .git, and .gitignore, and add gitignore patterns
    const ignorePatterns = [
      ".docignore",
      ".gitignore",
      ".git/**",
      "node_modules/**",
      ...(await getIgnored(".gitignore")),
      ...(await getIgnored(".docignore")),
    ];

    // Run files in the current directory and all subdirectories
    await runFiles(".", ignorePatterns);

    // Get the final documentation from the collator
    const output = getOutput().trim();
    console.log(output);
    if (!output) {
      console.error("\nNo documentation found in any files.");
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
