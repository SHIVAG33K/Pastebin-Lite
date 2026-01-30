import { notFound } from "next/navigation";
import { redis } from "../../lib/redis";
import { nowMs } from "../../lib/time";

export default async function PastePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const key = `paste:${id}`;

  const paste = await redis.hgetall<{
    content: string;
    expires_at: number | null;
    max_views: number | null;
    views: number;
  }>(key);

  if (!paste || !paste.content) {
    notFound();
  }

  const now = await nowMs();

  if (paste.expires_at !== null && (await now) >= Number(paste.expires_at)) {
    notFound();
  }

  if (
    paste.max_views !== null &&
    Number(paste.views) >= Number(paste.max_views)
  ) {
    notFound();
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1>Paste</h1>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: "#f4f4f4",
          padding: "1rem",
          borderRadius: "4px",
        }}
      >
        {paste.content}
      </pre>
    </main>
  );
}
