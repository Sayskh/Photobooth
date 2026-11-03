import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import os from "os";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string {
  const isVercel = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  );

  if (isVercel) {
    const tmpDir = os.tmpdir();
    const tmpDbPath = path.join(tmpDir, "dev.db");

    // Ensure temp directory exists
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch {
      // Ignore directory check failures
    }

    // Copy template.db to writable /tmp on cold start if not present or empty
    const shouldCopy = !fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0;
    if (shouldCopy) {
      const candidatePaths = [
        path.join(process.cwd(), "prisma", "template.db"),
        path.join(process.cwd(), ".next", "server", "prisma", "template.db"),
        path.resolve("./prisma/template.db"),
      ];

      for (const candidate of candidatePaths) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            break;
          } catch (err) {
            console.error(`[DB] Failed to copy template from ${candidate}:`, err);
          }
        }
      }
    }

    // Always use standard POSIX forward slashes for sqlite file URI
    const normalizedPath = tmpDbPath.replace(/\\/g, "/");
    const vercelUrl = `file:${normalizedPath}`;
    process.env.DATABASE_URL = vercelUrl;
    return vercelUrl;
  }

  // Local fallback: ensure valid file: protocol even if env is missing or malformed
  const currentUrl = process.env.DATABASE_URL;
  if (!currentUrl || !currentUrl.startsWith("file:")) {
    const localDbPath = path.join(process.cwd(), "prisma", "dev.db").replace(/\\/g, "/");
    const fallbackUrl = `file:${localDbPath}`;
    process.env.DATABASE_URL = fallbackUrl;
    return fallbackUrl;
  }

  return currentUrl;
}

const activeUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: activeUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
