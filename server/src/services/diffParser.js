function parseDiff(rawDiff) {
    let files = [];
    let currentFile = null;
    let lineNumber = 0;

    let lines = rawDiff.split('\n');

    for (const line of lines) {
        if (line.startsWith('diff --git')) {
            if (currentFile) {
                files.push(currentFile);
            }
            const match = line.match(/diff --git a\/.+b\/(.+)/);
            const filename = match ? match[1] : 'unknown';

            currentFile = {
                filename,
                changes: [],//hold change lines for this file
            };

        } else if (line.startsWith('@@')) { 
            const match = line.match(/\+(\d+)/);
            lineNumber = match ? parseInt(match[1]) : 0;
        }
  //line that starts with + but not +++ is an added line
        else if (line.startsWith('+') && !line.startsWith('+++')) {
            if (curentFile) {
                currentFile.changes.push({
                    line: lineNumber,
                    content: line.substring(1).trim(),
                    type: 'added',
                });
                lineNumber++;
            }
        }
  //line that starts with - but not --- is a removed line
        else if (line.startsWith('-') && !line.startsWith('---')) {
            if (currentFile) {
                currentFile.changes.push({
                    line: lineNumber,
                    content: line.substring(1).trim(),
                    type: 'removed',
                })
            }
        }
     //line that doesn't start with +, -, diff, @@, or \ is context line
        else if(!line.startsWith('\\')){
            lineNumber++;
        }

    }
    if (currentFile) {
        files.push(currentFile);
    }
    // Filter out files that have no changes
    return files.filter(
        (f)=>
            f.changes.length >0 && 
            !f.filename.includes('package-lock.json') &&
            !f.filename.includes('yarn.lock')
    );
}

//connvert the parsed diff into a clean text for llm prompt
function formatDiffForLLM(parsedFiles){
    if(parsedFiles.length === 0){
        return 'No code changes detected.';
    }

    return parsedFiles
    .map((file)=>{
        const changesText = file.changes
        .map((c)=>`Line ${c.line} [${c.type}]: ${c.content}`)
        .join('\n');
        return `File: ${file.filename}\n${changesText}`;
    })
    .join('\n\n');
}

export { parseDiff, formatDiffForLLM };
