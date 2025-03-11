# FeatureDoc

As-built functional docs generator

## About

This program is a tool that analyzes a source code repository and automatically generates ‘functional’ documentation from source code comments — not technical API-level documentation like e.g. JSDoc, but docs that are meant to be used by your non-developer coworkers to understand the as-built features that are provided by the software.

In a nutshell, FeatureDoc traverses all files in the repository, and extracts documentation in Markdown format (from lines that include a specific prefix). The resulting Markdown text is written to a file, so that it can be converted to HTML or PDF for distribution.

The order in which text is copied to the output file is determined automatically, or manually using imports and references.

## Usage

FeatureDoc outputs the generated Markdown file to the standard output stream, processing all files within the current folder (i.e. `.`).

```
npm i -D featuredoc
featuredoc
```

### Syntax

Prefix FeatureDoc lines within your source code with `//@@` or `##@@` to include them in the generated output. Additional whitespace in front of the comment tag is allowed.

```
//@@ This is a documentation line
//@@ > Add _any_ kind of Markdown formatting here.
```

An extra newline is added automatically after all non-contiguous documentation lines, _except_ between lines that are part of an ordered or unordered list (i.e. starting with `-`, `*`, or `1.`, `2.` and so on).

**Entire files** — To include the entire contents of a file, include the following line _anywhere_ inside your file (e.g. within a comment). Whitespace in front of this line is allowed.

```
##@@ FeatureDoc @@##
```

**HTML and JSX** — to include FeatureDoc lines within other types of text files, you may include them inside of a multi-line comment so that the line appears on its own.

```
{/*
    ##@@ Documentation within JSX
*/}
```

**Next-line appends** — if a line ends with a `\` character, the next line is appended to the current line as part of the documentation line. This is useful for including existing source code documentation (e.g. JSDoc) in your output. Any comment syntax on the next line is removed, including starting and ending comment characters (i.e. `/*`, `*/`, `//`, etc.).

```
//@@ - Property: `name` --\
/** The customer name */
name: string;
```

This results in the following output:

```
- Property: `name` -- The customer name
```

**Imports** — you can directly import the content of one file inside another. The prefixed content of the imported file is then no longer included in the output on its own.

```
//@@ +import ./some-file.js
//@@ +import ./some-other-file.js
```

**References** — you can also add a file directly to the list of references. The referenced files are traversed before all other files.

```
//@@ +ref ./some-file.js
```

### File traversal and sorting

All files in the current directory are traversed hierarchically and alphabetically, breadth-first. However, if a `.gitignore` file and/or `.docignore` file is found, matching files and directories are not traversed. A heuristic is used to exclude binary files as well (e.g. image files).

Before traversing files in a particular directory alphabetically, any files with names starting with `index.` or `main.` are processed first. Therefore, manually ordering files is possible by including a file such as `index.doc.txt` that references other files.

## Architecture

The source code contains the following main modules:

- `index.js` — Reads all files in the current directory (and subdirectories) and processes them; uses `glob` to list all files while excluding `.gitignore`-d files and similarly ignored patterns from a `.docignore` file.
- `process.js` — Loads and processes one file at a time
- `parse.js` — Parses the contents of a single file, recurses into `process.js` if needed
- `collate.js` — Collates the output and returns the final result
- `istext.js` — Provides a single heuristic function to determine if a file should be processed (i.e. no control characters with a byte value below 32, other than `\r`, `\n`, and `\t`, and a file extension other than some known binary formats that are often included in source code repositories).

## License

This program is open source, and released under the MIT license.
