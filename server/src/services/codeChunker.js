//splits code files into meaningful chunks for embedding
//each chunk represents a complete logical unit (function, class, block)

const MAX_CHUNK_LINES = 50;
const MIN_CHUNKS_LINES = 1;

/**
 * main chunking function — splits a file into chunks
 * @param {string} content - full file content
 * @param {string} filePath - path of the file (used for metadata)
 * @returns {Array} - array of chunk objects
 */

export function chunkCode(content, filePath) {
    const language = detectLanguage(filePath);

    const chunks = splitIntoChunks(content, language)
        .filter(chunk => chunk.content.trim().length > 0);
    return chunks.map((chunk, index) => ({
        id: `${filePath}_chunk_${index}`,
        content: chunk.content,
        filePath,
        chunkIndex: index,
        language,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
    }));
}
/**
 * detects programming language from file extension
 * @param {string} filePath
 * @returns {string} language name
 */

function detectLanguage(filePath) {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const languageMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'go': 'go',
        'rs': 'rust',
        'cpp': 'cpp',
        'c': 'c',
        'rb': 'ruby',
        'php': 'php',
    };
    return languageMap[ext] || 'text';
}

/**
 * splits content into chunks based on language patterns
 * @param {string} content - file content
 * @param {string} language - detected language
 * @returns {Array} raw chunks with content and line numbers
 */

function splitIntoChunks(content, language) {
    const lines = content.split('\n');
    const chunks = [];
    let currentChunk = [];
    let currentStartLine = 1;

    const blockStartPatterns = getBlockStartPatterns(language);

    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const isBlockStart = blockStartPatterns.some(pattern => pattern.test(line));
        const chunkTooLarge = currentChunk.length >= MAX_CHUNK_LINES;

        if ((isBlockStart && currentChunk.length > 0) || chunkTooLarge) {
            if (currentChunk.length >= MIN_CHUNKS_LINES) {
                chunks.push({
                    content: currentChunk.join('\n'),
                    startLine: currentStartLine,
                    endLine: lineNumber - 1,
                });
            }
            currentChunk = [line];
            currentStartLine = lineNumber;
        } else {
            currentChunk.push(line);
        }
    });

    if (currentChunk.length >= MIN_CHUNKS_LINES) {
        chunks.push({
            content: currentChunk.join('\n'),
            startLine: currentStartLine,
            endLine: lines.length,
        });
    }

    return chunks;
}
/**
 * returns regex patterns that indicate start of a new code block
 * different for each language
 * @param {string} language
 * @returns {RegExp[]}
 */
function getBlockStartPatterns(language) {
    const patterns = {
        javascript: [
            /^(export\s+)?(async\s+)?function\s+\w+/,
            /^(export\s+)?class\s+\w+/,
            /^\s*\w+\s*[:=]\s*(async\s+)?\(.*\)\s*=>/,
            /^\s*(export\s+)?const\s+\w+\s*=\s*(async\s+)?function/,
        ],
        typescript: [
            /^(export\s+)?(async\s+)?function\s+\w+/,
            /^(export\s+)?class\s+\w+/,
            /^(export\s+)?interface\s+\w+/,
            /^(export\s+)?type\s+\w+/,
            /^\s*\w+\s*[:=]\s*(async\s+)?\(.*\)\s*=>/,
        ],
        python: [
            /^def\s+\w+/,
            /^class\s+\w+/,
            /^async\s+def\s+\w+/,
        ],
        java: [
            /^\s*(public|private|protected)\s+.*\(/,
            /^\s*(public|private|protected)\s+class/,
        ],
    };

    // default patterns for unknown languages — split by empty lines
    return patterns[language] || [/^$/];
}