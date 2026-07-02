const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = '/Users/apple/.gemini/antigravity-ide/brain/1ca9ec60-471b-46ab-bf6e-8febbf3d61ce/.system_generated/logs/transcript_full.jsonl';

async function restoreFiles() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const files = {};

  for await (const line of rl) {
    try {
      const entry = JSON.parse(line);
      if (entry.tool_calls) {
        for (const call of entry.tool_calls) {
          if (call.name === 'write_to_file' || call.name === 'default_api:write_to_file') {
            const args = typeof call.args === 'string' ? JSON.parse(call.args) : (call.args || call.arguments);
            const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
            if (parsedArgs && parsedArgs.TargetFile && parsedArgs.CodeContent) {
               // Only care about .ts and .tsx files
               if (parsedArgs.TargetFile.endsWith('.ts') || parsedArgs.TargetFile.endsWith('.tsx')) {
                  files[parsedArgs.TargetFile] = parsedArgs.CodeContent;
               }
            }
          }
        }
      }
    } catch (e) {}
  }

  let count = 0;
  for (const [filePath, content] of Object.entries(files)) {
    console.log(`Restoring ${filePath}`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
  }
  console.log(`Restored ${count} files.`);
}

restoreFiles();
