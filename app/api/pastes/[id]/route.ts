import { NextResponse } from "next/server";
import { redis } from "../../../lib/redis";
import { nowMs } from "../../../lib/time";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const key = `paste:${id}`;

  const paste = await redis.hgetall<{
    content: string;
    expires_at: number | null;
    max_views: number | null;
    views: number;
  }>(key);

  if (!paste || !paste.content) {
    return NextResponse.json(
      { error: "Paste not found" },
      { status: 404 }
    );
  }

  const now = await nowMs();

  if (paste.expires_at !== null && (await now) >= Number(paste.expires_at)) {
    return NextResponse.json(
      { error: "Paste expired" },
      { status: 404 }
    );
  }

  if (
    paste.max_views !== null &&
    Number(paste.views) >= Number(paste.max_views)
  ) {
    return NextResponse.json(
      { error: "View limit exceeded" },
      { status: 404 }
    );
  }

  const views = await redis.hincrby(key, "views", 1);

  if (
    paste.max_views !== null &&
    views > Number(paste.max_views)
  ) {
    await redis.hincrby(key, "views", -1);
    return NextResponse.json(
      { error: "View limit exceeded" },
      { status: 404 }
    );
  }

  const remainingViews =
    paste.max_views !== null
      ? Math.max(0, Number(paste.max_views) - views)
      : null;

  return NextResponse.json({
    content: paste.content,
    remaining_views: remainingViews,
    expires_at:
      paste.expires_at !== null
        ? new Date(Number(paste.expires_at)).toISOString()
        : null,
  });
}
