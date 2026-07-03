import fs from "fs";
import path from "path";

// Load environment variables manually to avoid dependency issues
const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "server/.env"),
  path.resolve(process.cwd(), "../.env")
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach(line => {
        const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
        if (match) {
          const key = match[1].trim();
          let val = match[2].trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    } catch (e) {
      // Ignore reading errors
    }
  }
}

const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";

if (databaseUrl.startsWith("file:")) {
  const dbPath = databaseUrl.replace("file:", "");
  // Resolve absolute path and find its directory name
  const absoluteDbPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
  const dbDir = path.dirname(absoluteDbPath);
  
  if (!fs.existsSync(dbDir)) {
    console.log(`📁 Creating database directory: ${dbDir}`);
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch (err) {
      console.error(`❌ Failed to create database directory: ${dbDir}`, err);
    }
  }
}
