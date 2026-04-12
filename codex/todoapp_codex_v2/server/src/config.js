import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parsePort(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const config = {
  port: parsePort(process.env.PORT, 3001),
  allowedOrigin: process.env.ALLOWED_ORIGIN || "http://localhost:5173",
  tasksFile: path.resolve(__dirname, "..", "data", "tasks.json"),
  clientDistDir: path.resolve(__dirname, "..", "..", "client", "dist")
};
