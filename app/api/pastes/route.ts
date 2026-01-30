import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { redis } from "../../lib/redis";
import { nowMs } from "../../lib/time";

export async function POST(req: Request) {
  let body: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { content, ttl_seconds, max_views } = body;


  if (typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json(
      { error: "content must be a non-empty string" },
      { status: 400 }
    );
  }

  if (
    ttl_seconds !== undefined &&
    (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
  ) {
    return NextResponse.json(
      { error: "ttl_seconds must be an integer >= 1" },
      { status: 400 }
    );
  }

  if (
    max_views !== undefined &&
    (!Number.isInteger(max_views) || max_views < 1)
  ) {
    return NextResponse.json(
      { error: "max_views must be an integer >= 1" },
      { status: 400 }
    );
  }

  const id = nanoid(8);
  const key = `paste:${id}`;

  const now = await nowMs();
  const expiresAt = 
  ttl_seconds !== undefined ? now + ttl_seconds * 1000 : null;

  await redis.hset(key, {
    content,
    created_at: now,
    expires_at: expiresAt,
    max_views: max_views ?? null,
    views: 0,
  });

  if (ttl_seconds !== undefined) {
    await redis.expire(key, ttl_seconds);
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `${new URL(req.url).origin}`;

  return NextResponse.json(
    {
      id,
      url: `${baseUrl}/p/${id}`,
    },
    { status: 201 }
  );
}
