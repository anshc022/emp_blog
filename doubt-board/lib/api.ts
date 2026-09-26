import { NextResponse } from "next/server";
import { z } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/** Parse and validate a JSON request body, throwing a 400 with the first issue. */
export async function parseBody<T extends z.ZodType>(req: Request, schema: T): Promise<z.output<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON");
  }
  return parseWith(schema, raw);
}

export function parseWith<T extends z.ZodType>(schema: T, value: unknown): z.output<T> {
  const result = schema.safeParse(value);
  if (!result.success) throw new HttpError(400, result.error.issues[0]?.message ?? "Invalid input");
  return result.data;
}

/**
 * Wrap a route handler so thrown HttpErrors (and anything unexpected) become
 * `{ error }` JSON responses with a proper status code.
 */
export function handler<Args extends unknown[]>(fn: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof HttpError) return jsonError(err.status, err.message);
      if (err instanceof Error && err.name === "CastError") return jsonError(400, "Invalid id");
      if ((err as { code?: number })?.code === 11000) return jsonError(409, "That already exists");
      console.error("[api]", err);
      return jsonError(500, "Something went wrong. Please try again.");
    }
  };
}
