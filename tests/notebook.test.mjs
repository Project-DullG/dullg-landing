import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import {
  NotebookError,
  NOTEBOOK_MAX_IMAGE_BYTES,
  parseNotebookPage,
  validateNotebookImage,
  prepareNotebookJpeg,
  notebookMutationOriginAllowed,
  readNotebookUploadBody,
  saveNotebookPage,
  readNotebookPage,
  deleteNotebookPage,
} from "../lib/notebook.ts";

const uid = "own-google-uid";
const jpeg = await sharp({ create: { width: 64, height: 96, channels: 3, background: "white" } })
  .jpeg()
  .toBuffer();
const status = (code) => (error) => error instanceof NotebookError && error.status === code;
function fixture() {
  const state = {
    notebooks: new Map(),
    pages: new Map(),
    reads: 0,
    writes: 0,
    failCommit: false,
    clock: 1000,
    version: 0,
  };
  let lock = Promise.resolve();
  const deps = {
    authenticatedUid: uid,
    now: () => ++state.clock,
    newVersion: () => `unique-version-${++state.version}`,
    prepareImage: prepareNotebookJpeg,
    async transaction(work) {
      const previous = lock;
      let release;
      lock = new Promise((resolve) => {
        release = resolve;
      });
      await previous;
      const notebooks = new Map(state.notebooks);
      const pages = new Map(state.pages);
      let writesStarted = false;
      const read = () => {
        assert.equal(writesStarted, false);
        state.reads += 1;
      };
      const write = () => {
        writesStarted = true;
        state.writes += 1;
      };
      try {
        const result = await work({
          async getNotebook(userId) {
            read();
            return notebooks.get(userId) ?? null;
          },
          async getPage(userId, page) {
            read();
            return pages.get(`${userId}/${page}`) ?? null;
          },
          savePage(userId, page, record) {
            write();
            pages.set(`${userId}/${page}`, { ...record });
          },
          savePageMetadata(userId, metadata) {
            write();
            const old = notebooks.get(userId);
            notebooks.set(userId, {
              userId,
              pages: { ...(old?.pages ?? {}), [String(metadata.page)]: { ...metadata } },
            });
          },
          deletePage(userId, page) {
            write();
            pages.delete(`${userId}/${page}`);
          },
          deletePageMetadata(userId, page) {
            write();
            const old = notebooks.get(userId);
            const next = { ...old.pages };
            delete next[String(page)];
            notebooks.set(userId, { ...old, pages: next });
          },
        });
        if (state.failCommit) {
          state.failCommit = false;
          throw new Error("Temporary transaction failure");
        }
        state.notebooks = notebooks;
        state.pages = pages;
        return result;
      } finally {
        release();
      }
    },
  };
  return {
    state,
    deps,
    save: (page = 1, bytes = jpeg, contentType = "image/jpeg") =>
      saveNotebookPage(uid, page, bytes, contentType, deps),
    read: (page = 1, version) => readNotebookPage(uid, page, deps, version),
    remove: (page = 1) => deleteNotebookPage(uid, page, deps),
  };
}

test("page whitelist rejects ambiguous strings and any path outside 1–8", () => {
  for (const page of ["1", 1, "8", 8]) assert.equal(parseNotebookPage(page), Number(page));
  for (const page of [
    undefined,
    null,
    "0",
    0,
    "9",
    9,
    "01",
    "1.0",
    " 1 ",
    "1/other",
    "../1",
    "1%2fother",
    [],
    {},
    1.5,
  ])
    assert.throws(() => parseNotebookPage(page), status(400));
});

test("mutations require an exact same-origin header, optionally the exact production origin", () => {
  const url = "https://preview.example/api/notebook/pages/1";
  const production = "https://dullg-landing-one.vercel.app";
  assert.equal(notebookMutationOriginAllowed("https://preview.example", url), true);
  assert.equal(notebookMutationOriginAllowed(production, url, production), true);
  for (const origin of [
    null,
    "null",
    "https://evil.example",
    "https://preview.example.evil.example",
    "https://preview.example/",
    "https://preview.example/path",
    "https://user@preview.example",
    "http://preview.example",
    "https://preview.example:444",
  ])
    assert.equal(notebookMutationOriginAllowed(origin, url, production), false);
});

test("MIME, JPEG signature and bytes are validated before storage access", async () => {
  const f = fixture();
  await assert.rejects(f.save(1, jpeg, "image/png"), status(415));
  await assert.rejects(f.save(1, new Uint8Array([1, 2, 3, 4]), "image/jpeg"), status(415));
  await assert.rejects(f.save(1, new Uint8Array(), "image/jpeg"), status(400));
  await assert.rejects(
    f.save(1, new Uint8Array(NOTEBOOK_MAX_IMAGE_BYTES + 1), "image/jpeg"),
    status(413),
  );
  await assert.rejects(
    f.save(1, new Uint8Array([255, 216, 255, 255, 217]), "image/jpeg"),
    status(415),
  );
  assert.equal(f.state.reads, 0);
  assert.equal(f.state.writes, 0);
  assert.doesNotThrow(() => validateNotebookImage(jpeg, "image/jpeg"));
});

test("server canonicalizes JPEG, auto-rotates, strips metadata and bounds dimensions", async () => {
  const source = await sharp({
    create: { width: 4000, height: 1000, channels: 3, background: "white" },
  })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toBuffer();
  const result = await prepareNotebookJpeg(source);
  const metadata = await sharp(result).metadata();
  assert.equal(metadata.format, "jpeg");
  assert.equal(metadata.width, 550);
  assert.equal(metadata.height, 2200);
  assert.equal(metadata.exif, undefined);
  assert.equal(metadata.orientation, undefined);
  assert.ok(result.byteLength <= NOTEBOOK_MAX_IMAGE_BYTES);
});

test("a low-byte JPEG with excessive decoded pixels is rejected", async () => {
  const source = await sharp({
    create: { width: 5000, height: 5000, channels: 3, background: "white" },
  })
    .jpeg({ quality: 10 })
    .toBuffer();
  assert.ok(source.byteLength < NOTEBOOK_MAX_IMAGE_BYTES);
  await assert.rejects(prepareNotebookJpeg(source), status(415));
});

test("upload reader enforces limits even without a truthful Content-Length", async () => {
  const request = new Request("https://site.example/api/notebook/pages/1", {
    method: "PUT",
    headers: { "content-type": "image/jpeg" },
    body: jpeg,
  });
  assert.deepEqual(await readNotebookUploadBody(request), new Uint8Array(jpeg));
  const overflow = new Request("https://site.example/api/notebook/pages/1", {
    method: "PUT",
    headers: { "content-type": "image/jpeg", "content-length": "1" },
    duplex: "half",
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(400_000));
        controller.enqueue(new Uint8Array(400_000));
        controller.close();
      },
    }),
  });
  await assert.rejects(readNotebookUploadBody(overflow), status(413));
  const declared = new Request("https://site.example/api/notebook/pages/1", {
    method: "PUT",
    headers: {
      "content-type": "image/jpeg",
      "content-length": String(NOTEBOOK_MAX_IMAGE_BYTES + 1),
    },
    body: jpeg,
  });
  await assert.rejects(readNotebookUploadBody(declared), status(413));
});

test("authenticated UID cannot read, write or delete any other user's photo", async () => {
  const f = fixture();
  await assert.rejects(saveNotebookPage("another-uid", 1, jpeg, "image/jpeg", f.deps), status(403));
  await assert.rejects(readNotebookPage("another-uid", 1, f.deps), status(403));
  await assert.rejects(deleteNotebookPage("another-uid", 1, f.deps), status(403));
  assert.equal(f.state.reads, 0);
  assert.equal(f.state.writes, 0);
});

test("save/replace return matching private image+metadata and replace only one page", async () => {
  const f = fixture();
  const first = await f.save();
  assert.deepEqual(first, {
    page: 1,
    version: "unique-version-1",
    byteLength: f.state.pages.get(`${uid}/1`).image.byteLength,
    updatedAt: 1001,
  });
  await f.save(2);
  const secondBefore = f.state.pages.get(`${uid}/2`);
  const replacement = await f.save(1);
  assert.notEqual(replacement.version, first.version);
  assert.deepEqual((await f.read(1, replacement.version)).metadata, replacement);
  assert.equal(await f.read(1, first.version), null);
  assert.equal(f.state.pages.get(`${uid}/2`), secondBefore);
  assert.equal(f.state.pages.size, 2);
});

test("reads reject a mismatched version, metadata length, or non-JPEG stored record", async () => {
  const f = fixture();
  const meta = await f.save();
  const record = f.state.pages.get(`${uid}/1`);
  f.state.pages.set(`${uid}/1`, { ...record, version: "stale-version" });
  assert.equal(await f.read(), null);
  f.state.pages.set(`${uid}/1`, { ...record, contentType: "text/html" });
  assert.equal(await f.read(), null);
  f.state.pages.set(`${uid}/1`, record);
  f.state.notebooks.get(uid).pages["1"] = { ...meta, byteLength: meta.byteLength + 1 };
  assert.equal(await f.read(), null);
});

test("forged document ownership is rejected before mutation or image return", async () => {
  const f = fixture();
  await f.save();
  f.state.pages.get(`${uid}/1`).userId = "another-uid";
  await assert.rejects(f.read(), status(403));
  await assert.rejects(f.save(), status(403));
  await assert.rejects(f.remove(), status(403));
});

test("delete removes exactly the chosen photo and its metadata, keeping other pages", async () => {
  const f = fixture();
  await f.save(1);
  await f.save(2);
  const second = f.state.pages.get(`${uid}/2`);
  assert.deepEqual(await f.remove(1), { page: 1, deleted: true });
  assert.equal(await f.read(1), null);
  assert.equal(f.state.notebooks.get(uid).pages["1"], undefined);
  assert.equal(f.state.pages.get(`${uid}/2`), second);
  assert.ok(await f.read(2));
  await f.remove(1);
  assert.equal(f.state.pages.size, 1);
});

test("transaction failure leaves neither half photo nor half metadata; retry succeeds", async () => {
  const f = fixture();
  f.state.failCommit = true;
  await assert.rejects(f.save(), /Temporary transaction failure/);
  assert.equal(f.state.pages.size, 0);
  assert.equal(f.state.notebooks.size, 0);
  await f.save();
  f.state.failCommit = true;
  await assert.rejects(f.remove(), /Temporary transaction failure/);
  assert.ok(await f.read());
});

test("concurrent replacements keep metadata and photo at one matching version", async () => {
  const f = fixture();
  const results = await Promise.all([f.save(1), f.save(1), f.save(1)]);
  const photo = await f.read();
  assert.ok(results.some((metadata) => metadata.version === photo.metadata.version));
  assert.equal(f.state.pages.size, 1);
  assert.equal(
    f.state.notebooks.get(uid).pages["1"].version,
    f.state.pages.get(`${uid}/1`).version,
  );
});
