/** Store all output as a list of lines */
const output = [];

/**
 * Add documentation to the output
 * @param {string[]} lines Parsed documentation lines from the input file
 */
export function collate(lines) {
  for (const line of lines) {
    if (!line) addNewline();
    else output.push(line);
  }
}

/**
 * Add a newline to the output if the last line is not a newline
 */
export function addNewline() {
  if (output.length > 0 && output[output.length - 1]) {
    output.push("");
  }
}

/**
 * Get the final collated documentation
 * @returns {string} The final documentation string
 */
export function getOutput() {
  return output.join("\n");
}
