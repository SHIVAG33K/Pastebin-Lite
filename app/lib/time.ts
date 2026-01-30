import { headers } from "next/headers";

export async function nowMs() {
  if (process.env.TEST_MODE === "1") {
    const h = (await headers()).get("x-test-now-ms");
    if (h) {
      const parsed = Number(h);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return Date.now();
}
