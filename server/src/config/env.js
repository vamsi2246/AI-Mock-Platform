import { z } from "zod";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), "../.env") });
config({ path: resolve(process.cwd(), ".env") });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  OPENAI_API_KEY: z.string().min(1),
  VAPI_API_KEY: z.string().min(1),
  VAPI_PUBLIC_KEY: z.string().min(1),
  VAPI_CUSTOM_LLM_URL: z.string().url().optional(),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_FILE_SIZE: z.coerce.number().default(5242880),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();
