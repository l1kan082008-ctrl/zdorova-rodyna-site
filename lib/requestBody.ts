export class RequestBodyError extends Error {
  readonly status: 400 | 413 | 415;

  constructor(
    message: string,
    status: 400 | 413 | 415,
  ) {
    super(message);
    this.status = status;
  }
}

async function readBoundedBytes(request: Request, maximumBytes: number) {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    throw new RequestBodyError("Request body is too large.", 413);
  }

  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();

  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximumBytes) {
        await reader.cancel("request body too large");
        throw new RequestBodyError("Request body is too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function contentType(request: Request) {
  return request.headers.get("content-type")?.toLowerCase() ?? "";
}

export async function readBoundedJson(
  request: Request,
  maximumBytes = 16 * 1024,
): Promise<unknown> {
  if (!contentType(request).startsWith("application/json")) {
    throw new RequestBodyError("Content-Type must be application/json.", 415);
  }
  const bytes = await readBoundedBytes(request, maximumBytes);
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    throw new RequestBodyError("Request body must contain valid JSON.", 400);
  }
}

export async function readBoundedText(
  request: Request,
  maximumBytes: number,
  expectedContentType?: string,
) {
  if (expectedContentType && !contentType(request).startsWith(expectedContentType)) {
    throw new RequestBodyError(`Content-Type must be ${expectedContentType}.`, 415);
  }
  return new TextDecoder().decode(await readBoundedBytes(request, maximumBytes));
}

export async function readBoundedFormData(
  request: Request,
  maximumBytes: number,
) {
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("multipart/form-data")) {
    throw new RequestBodyError("Content-Type must be multipart/form-data.", 415);
  }
  const body = await readBoundedBytes(request, maximumBytes);
  return new Request(request.url, {
    method: "POST",
    headers: { "content-type": type },
    body,
  }).formData();
}

export function requestBodyErrorResponse(error: unknown, fallback: string) {
  if (error instanceof RequestBodyError) {
    return Response.json({ error: fallback }, { status: error.status });
  }
  return null;
}
