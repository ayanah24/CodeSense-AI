function parseDiff(rawDiff) {
  const files = [];
  let currentFile = null;
  let lineNumber = 0;

  // Split diff into lines and process one by one
  const lines = rawDiff.split('\n');

  for (const line of lines) {

    // Line starting with 'diff --git' means new file started
    if (line.startsWith('diff --git')) {
     if (currentFile) {
        files.push(currentFile);
      }

     // "diff --git a/src/auth.js b/src/auth.js" → "src/auth.js"
      const match = line.match(/diff --git a\/.+ b\/(.+)/);
      const filename = match ? match[1] : 'unknown';

      currentFile = {
        filename,
        changes: [], // will hold all changed lines
      };
    }
    else if (line.startsWith('@@')) {
      const match = line.match(/\+(\d+)/);
      lineNumber = match ? parseInt(match[1]) : 0;
    }

    // Line starting with '+' is a newly added line
    else if (line.startsWith('+') && !line.startsWith('+++')) {
      if (currentFile) {
        currentFile.changes.push({
          line: lineNumber,
          content: line.substring(1).trim(),
          type: 'added',
        });
      }
      lineNumber++;
    }

    // Line starting with '-' is a removed line
    else if (line.startsWith('-') && !line.startsWith('---')) {
      if (currentFile) {
        currentFile.changes.push({
          line: lineNumber,
          content: line.substring(1).trim(), 
          type: 'removed',
        });
      }
    }

    // Normal line (no + or -) — context line, just increment counter
    else if (!line.startsWith('\\')) {
      lineNumber++;
    }
  }

  if (currentFile) {
    files.push(currentFile);
  }

  // Filter out files with no changes
  // Also filter out lock files 
  return files.filter(
    (f) =>
      f.changes.length > 0 &&
      !f.filename.includes('package-lock.json') &&
      !f.filename.includes('yarn.lock')
  );
}

// Convert parsed diff into clean readable text for LLM prompt
function formatDiffForPrompt(parsedFiles) {
  if (parsedFiles.length === 0) {
    return 'No code changes found.';
  }

  return parsedFiles
    .map((file) => {
      const changes = file.changes
        .map((c) => `  Line ${c.line} [${c.type}]: ${c.content}`)
        .join('\n');

      return `File: ${file.filename}\n${changes}`;
    })
    .join('\n\n');
}

export { parseDiff, formatDiffForPrompt };