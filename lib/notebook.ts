import sharp from "sharp";

export const NOTEBOOK_PAGE_COUNT = 8;
export const NOTEBOOK_MAX_IMAGE_BYTES = 700_000;
export const NOTEBOOK_MAX_INPUT_PIXELS = 20_000_000;
export const NOTEBOOK_MAX_IMAGE_DIMENSION = 2200;
export type NotebookPageMetadata = {
  page: number;
  version: string;
  byteLength: number;
  updatedAt: number;
};
export type NotebookImageRecord = NotebookPageMetadata & {
  image: Uint8Array;
  contentType: "image/jpeg";
  userId: string;
};
type Document = Record<string, unknown>;

export class NotebookError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export interface NotebookTransaction {
  getNotebook(uid: string): Promise<Document | null>;
  getPage(uid: string, page: number): Promise<Document | null>;
  savePage(uid: string, page: number, record: NotebookImageRecord): void;
  savePageMetadata(uid: string, metadata: NotebookPageMetadata): void;
  deletePage(uid: string, page: number): void;
  deletePageMetadata(uid: string, page: number, updatedAt: number): void;
}
export interface NotebookDependencies {
  authenticatedUid: string;
  now(): number;
  newVersion(): string;
  prepareImage(bytes: Uint8Array): Promise<Uint8Array>;
  transaction<T>(work: (tx: NotebookTransaction) => Promise<T>): Promise<T>;
}

export function parseNotebookPage(value: unknown): number {
  if ((typeof value !== "string" && typeof value !== "number") || !/^[1-8]$/.test(String(value)))
    throw new NotebookError(400, "노트 페이지는 1~8쪽만 사용할 수 있습니다.");
  return Number(value);
}
function requireUid(uid: string, dependencies: NotebookDependencies) {
  if (
    uid !== dependencies.authenticatedUid ||
    !/^[A-Za-z0-9_-]{1,128}$/.test(uid) ||
    /^__.*__$/.test(uid)
  )
    throw new NotebookError(403, "본인의 노트만 사용할 수 있습니다.");
}
function requireOwner(document: Document | null, uid: string) {
  if (document && document.userId !== undefined && document.userId !== uid)
    throw new NotebookError(403, "본인의 노트만 사용할 수 있습니다.");
}
function isJpeg(bytes: Uint8Array) {
  return (
    bytes.byteLength >= 4 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff &&
    bytes[bytes.length - 2] === 0xff &&
    bytes[bytes.length - 1] === 0xd9
  );
}
export function validateNotebookImage(
  bytes: unknown,
  contentType: unknown,
): asserts bytes is Uint8Array {
  if (
    typeof contentType !== "string" ||
    contentType.split(";")[0].trim().toLowerCase() !== "image/jpeg"
  )
    throw new NotebookError(415, "JPEG 사진을 선택해 주세요.");
  if (!(bytes instanceof Uint8Array) || !bytes.byteLength)
    throw new NotebookError(400, "사진을 선택해 주세요.");
  if (bytes.byteLength > NOTEBOOK_MAX_IMAGE_BYTES)
    throw new NotebookError(413, "사진 크기를 줄여 다시 시도해 주세요.");
  if (!isJpeg(bytes)) throw new NotebookError(415, "올바른 JPEG 사진을 선택해 주세요.");
}

/** Decode and re-encode rather than trusting a MIME header or JPEG magic bytes. */
export async function prepareNotebookJpeg(bytes: Uint8Array): Promise<Uint8Array> {
  validateNotebookImage(bytes, "image/jpeg");
  try {
    const image = sharp(bytes, {
      limitInputPixels: NOTEBOOK_MAX_INPUT_PIXELS,
      failOn: "error",
      sequentialRead: true,
    });
    const metadata = await image.metadata();
    if (
      metadata.format !== "jpeg" ||
      !metadata.width ||
      !metadata.height ||
      (metadata.pages ?? 1) !== 1
    )
      throw new NotebookError(415, "올바른 JPEG 사진을 선택해 주세요.");
    for (const quality of [85, 78, 70, 62]) {
      const output = await image
        .clone()
        .rotate()
        .resize({
          width: NOTEBOOK_MAX_IMAGE_DIMENSION,
          height: NOTEBOOK_MAX_IMAGE_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
      if (output.byteLength <= NOTEBOOK_MAX_IMAGE_BYTES) return output;
    }
    const output = await image
      .clone()
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 70, mozjpeg: true })
      .toBuffer();
    if (output.byteLength > NOTEBOOK_MAX_IMAGE_BYTES)
      throw new NotebookError(413, "사진 크기를 줄여 다시 시도해 주세요.");
    return output;
  } catch (error) {
    if (error instanceof NotebookError) throw error;
    throw new NotebookError(415, "사진을 읽을 수 없습니다. 다른 사진을 선택해 주세요.");
  }
}

export function notebookMutationOriginAllowed(
  origin: unknown,
  requestUrl: string,
  siteUrl?: string,
): boolean {
  if (typeof origin !== "string" || origin === "null") return false;
  try {
    const supplied = new URL(origin);
    if (!["http:", "https:"].includes(supplied.protocol) || supplied.origin !== origin)
      return false;
    const allowed = new Set([new URL(requestUrl).origin]);
    if (siteUrl) allowed.add(new URL(siteUrl).origin);
    return allowed.has(origin);
  } catch {
    return false;
  }
}

/** Bound streamed input even when a caller omits or lies about Content-Length. */
export async function readNotebookUploadBody(request: Request): Promise<Uint8Array> {
  const contentType = request.headers.get("content-type");
  if (contentType?.split(";")[0].trim().toLowerCase() !== "image/jpeg")
    throw new NotebookError(415, "JPEG 사진을 선택해 주세요.");
  const declared = request.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > NOTEBOOK_MAX_IMAGE_BYTES))
    throw new NotebookError(413, "사진 크기를 줄여 다시 시도해 주세요.");
  if (!request.body) throw new NotebookError(400, "사진을 선택해 주세요.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > NOTEBOOK_MAX_IMAGE_BYTES) {
        await reader.cancel();
        throw new NotebookError(413, "사진 크기를 줄여 다시 시도해 주세요.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  validateNotebookImage(bytes, contentType);
  return bytes;
}

function readMetadata(value: unknown, page: number): NotebookPageMetadata | null {
  if (!value || typeof value !== "object") return null;
  const metadata = value as Document;
  if (
    typeof metadata.version !== "string" ||
    !metadata.version ||
    typeof metadata.byteLength !== "number" ||
    !Number.isInteger(metadata.byteLength) ||
    metadata.byteLength < 4 ||
    metadata.byteLength > NOTEBOOK_MAX_IMAGE_BYTES ||
    typeof metadata.updatedAt !== "number" ||
    !Number.isFinite(metadata.updatedAt)
  )
    return null;
  return {
    page,
    version: metadata.version,
    byteLength: metadata.byteLength,
    updatedAt: metadata.updatedAt,
  };
}

export async function saveNotebookPage(
  uid: string,
  requestedPage: unknown,
  bytes: unknown,
  contentType: unknown,
  deps: NotebookDependencies,
): Promise<NotebookPageMetadata> {
  requireUid(uid, deps);
  const page = parseNotebookPage(requestedPage);
  validateNotebookImage(bytes, contentType);
  const image = await deps.prepareImage(bytes);
  validateNotebookImage(image, "image/jpeg");
  const metadata = {
    page,
    version: deps.newVersion(),
    byteLength: image.byteLength,
    updatedAt: deps.now(),
  };
  await deps.transaction(async (tx) => {
    requireOwner(await tx.getNotebook(uid), uid);
    requireOwner(await tx.getPage(uid, page), uid);
    tx.savePage(uid, page, { ...metadata, image, contentType: "image/jpeg", userId: uid });
    tx.savePageMetadata(uid, metadata);
  });
  return metadata;
}

export async function readNotebookPage(
  uid: string,
  requestedPage: unknown,
  deps: NotebookDependencies,
  requestedVersion?: string | null,
): Promise<{ image: Uint8Array; metadata: NotebookPageMetadata } | null> {
  requireUid(uid, deps);
  const page = parseNotebookPage(requestedPage);
  return deps.transaction(async (tx) => {
    const notebook = await tx.getNotebook(uid);
    const record = await tx.getPage(uid, page);
    requireOwner(notebook, uid);
    requireOwner(record, uid);
    const pages = notebook?.pages as Document | undefined;
    const metadata = readMetadata(pages?.[String(page)], page);
    if (
      !record ||
      !metadata ||
      record.version !== metadata.version ||
      record.updatedAt !== metadata.updatedAt ||
      record.contentType !== "image/jpeg" ||
      !(record.image instanceof Uint8Array) ||
      record.image.byteLength !== metadata.byteLength ||
      !isJpeg(record.image) ||
      (requestedVersion !== undefined &&
        requestedVersion !== null &&
        requestedVersion !== metadata.version)
    )
      return null;
    return { image: record.image, metadata };
  });
}

export async function deleteNotebookPage(
  uid: string,
  requestedPage: unknown,
  deps: NotebookDependencies,
): Promise<{ page: number; deleted: true }> {
  requireUid(uid, deps);
  const page = parseNotebookPage(requestedPage);
  await deps.transaction(async (tx) => {
    const notebook = await tx.getNotebook(uid);
    const record = await tx.getPage(uid, page);
    requireOwner(notebook, uid);
    requireOwner(record, uid);
    if (record) tx.deletePage(uid, page);
    if (notebook) tx.deletePageMetadata(uid, page, deps.now());
  });
  return { page, deleted: true };
}
