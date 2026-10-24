import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import ts from "typescript";

const source = readFileSync(
  new URL("../app/api/certificates/assets/[asset]/route.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
}).outputText;

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
  Vary: "Cookie",
};
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const fixtureBytes = Buffer.concat([pngMagic, Buffer.from([0x00, 0xff, 0x80, 0x20, 0x01])]);
const chunkSize = 524_288;
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

function chunkFixture(length = 1_364_115) {
  const bytes = Buffer.alloc(length, 0xab);
  pngMagic.copy(bytes);
  const chunks = [];
  for (let offset = 0; offset < length; offset += chunkSize)
    chunks.push({ png: Buffer.from(bytes.subarray(offset, offset + chunkSize)) });
  return {
    bytes,
    chunks,
    documentData: {
      format: "png-chunks-v1",
      byteLength: length,
      sha256: hash(bytes),
      chunkCount: chunks.length,
    },
  };
}

function harness(options = {}) {
  const {
    authorized = true,
    accessError,
    dbError,
    readError,
    exists = true,
    chunks = [],
    chunkError,
    chunkGate,
  } = options;
  const documentData = Object.hasOwn(options, "documentData")
    ? options.documentData
    : { png: Buffer.from(fixtureBytes) };
  const events = [];
  const reads = [];
  const chunkReads = [];
  const mod = { exports: {} };
  const modules = {
    "@/lib/firebase/admin": {
      getAdminDb() {
        events.push("getAdminDb");
        if (dbError) throw dbError;
        return {
          collection(collection) {
            events.push("collection");
            return {
              doc(signer) {
                events.push("doc");
                return {
                  async get() {
                    events.push("get");
                    reads.push({ collection, signer });
                    if (readError) throw readError;
                    return {
                      exists,
                      data() {
                        events.push("data");
                        return documentData;
                      },
                    };
                  },
                  collection(subcollection) {
                    events.push("chunkCollection");
                    return {
                      doc(index) {
                        events.push("chunkDoc");
                        return {
                          async get() {
                            events.push("chunkGet");
                            chunkReads.push({ collection, signer, subcollection, index });
                            if (chunkError) throw chunkError;
                            if (chunkGate) await chunkGate;
                            return {
                              exists: Object.hasOwn(chunks, index),
                              data: () => chunks[index],
                            };
                          },
                        };
                      },
                    };
                  },
                };
              },
            };
          },
        };
      },
    },
    "@/lib/certificates/access-server": {
      privateHeaders,
      async getCertificateAccess() {
        events.push("access");
        if (accessError) throw accessError;
        return authorized;
      },
    },
    "next/server": { NextResponse: Response },
    "node:crypto": { createHash },
    "server-only": {},
  };
  new Function("require", "module", "exports", "Response", "Buffer", compiled)(
    (id) => {
      assert.ok(Object.hasOwn(modules, id), `Unexpected route dependency: ${id}`);
      return modules[id];
    },
    mod,
    mod.exports,
    Response,
    Buffer,
  );
  return {
    route: mod.exports,
    events,
    reads,
    chunkReads,
    get(signer) {
      return mod.exports.GET(new Request("https://example.test/api/certificates/assets/test"), {
        params: Promise.resolve({ asset: signer }),
      });
    },
  };
}

function assertPrivate(response) {
  assert.match(response.headers.get("cache-control") || "", /(?:^|,)\s*private(?:,|$)/);
  assert.match(response.headers.get("cache-control") || "", /(?:^|,)\s*no-store(?:,|$)/);
  assert.match(response.headers.get("x-robots-tag") || "", /noindex/);
  assert.match(response.headers.get("vary") || "", /Cookie/i);
}

function assertSingleRead(h, signer) {
  assert.deepEqual(h.reads, [{ collection: "certificateAssets", signer }]);
  assert.deepEqual(h.events, ["access", "getAdminDb", "collection", "doc", "get", "data"]);
  assert.deepEqual(h.chunkReads, []);
}

test("certificate assets expose only a dynamic Node.js GET handler", () => {
  const h = harness();
  assert.equal(h.route.runtime, "nodejs");
  assert.equal(h.route.dynamic, "force-dynamic");
  assert.equal(typeof h.route.GET, "function");
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"])
    assert.equal(h.route[method], undefined, `${method} must not be exported`);
});

test("unauthorized requests cannot access the database or reveal whether a signer exists", async () => {
  for (const signer of [
    "kim-byeongcheol",
    "lee-seongro",
    "ulleung-education-seal",
    "unknown",
    "../bad",
    "__proto__",
  ]) {
    const h = harness({ authorized: false });
    const response = await h.get(signer);
    assert.equal(response.status, 401, signer);
    assertPrivate(response);
    assert.deepEqual(h.events, ["access"]);
    assert.deepEqual(h.reads, []);
    assert.deepEqual(h.chunkReads, []);
    assert.notEqual(response.headers.get("content-type"), "image/png");
  }
});

test("all three allowlisted assets return the exact Firestore PNG bytes after authorization", async () => {
  for (const signer of ["kim-byeongcheol", "lee-seongro", "ulleung-education-seal"]) {
    const h = harness();
    const response = await h.get(signer);
    assert.equal(response.status, 200, signer);
    assertPrivate(response);
    assert.equal(response.headers.get("content-type"), "image/png");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("content-length"), String(fixtureBytes.length));
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), fixtureBytes);
    assertSingleRead(h, signer);
  }
});

test("unknown, inherited, and traversal-like signer keys never reach the database", async () => {
  for (const signer of [
    "unknown",
    "",
    "constructor",
    "toString",
    "__proto__",
    "hasOwnProperty",
    "../bad",
    "..",
    "../../certificateAssets/kim-byeongcheol",
    "%2e%2e%2fbad",
    "%252e%252e%252fbad",
    "..%5cbad",
    "..\\bad",
    "/kim-byeongcheol",
    "kim-byeongcheol/../bad",
    "kim-byeongcheol.png",
    "kim-byeongcheol%00",
    "kim-byeongcheol\u0000",
    "Kim-Byeongcheol",
    "lee-seongro ",
  ]) {
    const h = harness();
    const response = await h.get(signer);
    assert.equal(response.status, 404, JSON.stringify(signer));
    assertPrivate(response);
    assert.deepEqual(h.events, ["access"]);
    assert.deepEqual(h.reads, []);
  }
});

test("authorization errors fail closed without accessing the database or returning internal details", async () => {
  const detail = "internal-auth-detail-not-for-response";
  const h = harness({ accessError: new Error(detail) });
  const response = await h.get("kim-byeongcheol");
  assert.equal(response.status, 503);
  assertPrivate(response);
  assert.deepEqual(h.events, ["access"]);
  assert.deepEqual(h.reads, []);
  assert.ok(!(await response.text()).includes(detail));
});

test("a missing allowlisted signature document returns a non-cacheable 404", async () => {
  const h = harness({ exists: false, documentData: undefined });
  const response = await h.get("lee-seongro");
  assert.equal(response.status, 404);
  assertPrivate(response);
  assert.deepEqual(h.events, ["access", "getAdminDb", "collection", "doc", "get"]);
  assert.deepEqual(h.reads, [{ collection: "certificateAssets", signer: "lee-seongro" }]);
});

test("direct PNG buffers at the eight-byte minimum and 2000000-byte maximum are returned unchanged", async () => {
  for (const length of [8, 2_000_000]) {
    const bytes = Buffer.alloc(length, 0xab);
    pngMagic.copy(bytes);
    const h = harness({ documentData: { png: bytes } });
    const response = await h.get("kim-byeongcheol");
    assert.equal(response.status, 200, String(length));
    assertPrivate(response);
    assert.equal(response.headers.get("content-type"), "image/png");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("content-length"), String(length));
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
    assertSingleRead(h, "kim-byeongcheol");
  }
});

test("invalid, non-Buffer, non-PNG, and oversized document payloads fail closed", async () => {
  const oversized = Buffer.alloc(2_000_001);
  pngMagic.copy(oversized);
  const wrongMagic = Buffer.from(fixtureBytes);
  wrongMagic[0] = 0;
  for (const [label, documentData] of [
    ["undefined document data", undefined],
    ["null document data", null],
    ["missing png field", {}],
    ["null png field", { png: null }],
    ["base64 text", { png: fixtureBytes.toString("base64") }],
    ["typed array", { png: new Uint8Array(fixtureBytes) }],
    ["serialized buffer", { png: fixtureBytes.toJSON() }],
    ["empty buffer", { png: Buffer.alloc(0) }],
    ["seven bytes", { png: pngMagic.subarray(0, 7) }],
    ["wrong PNG magic", { png: wrongMagic }],
    ["HTML data", { png: Buffer.from("<svg>private-invalid-content</svg>") }],
    ["2000001 bytes", { png: oversized }],
    ["unknown direct format", { format: "unknown", png: fixtureBytes }],
    ["null direct format", { format: null, png: fixtureBytes }],
  ]) {
    const h = harness({ documentData });
    const response = await h.get("kim-byeongcheol");
    assert.equal(response.status, 503, label);
    assertPrivate(response);
    assert.notEqual(response.headers.get("content-type"), "image/png", label);
    assertSingleRead(h, "kim-byeongcheol");
    const body = await response.text();
    assert.ok(!body.includes("private-invalid-content"), label);
    assert.ok(!body.includes(fixtureBytes.toString("base64")), label);
  }
});

test("database initialization and read failures return 503 without disclosing internal details", async () => {
  const detail = "private-database-error-not-for-response";
  for (const option of ["dbError", "readError"]) {
    const h = harness({ [option]: new Error(detail) });
    const response = await h.get("lee-seongro");
    assert.equal(response.status, 503, option);
    assertPrivate(response);
    assert.equal(h.events[0], "access");
    assert.ok(!(await response.text()).includes(detail));
    if (option === "dbError") assert.deepEqual(h.reads, []);
    else assert.deepEqual(h.reads, [{ collection: "certificateAssets", signer: "lee-seongro" }]);
  }
});

test("a 1364115-byte seal is assembled from three parallel chunk reads without changing its bytes", async () => {
  const fixture = chunkFixture();
  let releaseChunks;
  const chunkGate = new Promise((resolve) => {
    releaseChunks = resolve;
  });
  const h = harness({ ...fixture, chunkGate });
  const pending = h.get("ulleung-education-seal");
  try {
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(h.chunkReads.length, 3, "all chunk reads must start before any chunk resolves");
  } finally {
    releaseChunks();
  }
  const response = await pending;
  assert.equal(response.status, 200);
  assertPrivate(response);
  assert.equal(response.headers.get("content-type"), "image/png");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("content-length"), "1364115");
  const returned = Buffer.from(await response.arrayBuffer());
  assert.deepEqual(returned, fixture.bytes);
  assert.equal(hash(returned), fixture.documentData.sha256);
  assert.deepEqual(h.reads, [
    { collection: "certificateAssets", signer: "ulleung-education-seal" },
  ]);
  assert.deepEqual(
    h.chunkReads,
    ["0", "1", "2"].map((index) => ({
      collection: "certificateAssets",
      signer: "ulleung-education-seal",
      subcollection: "chunks",
      index,
    })),
  );
  assert.equal(h.events[0], "access");
});

test("chunk manifests support exact minimum, chunk boundaries, and the decimal two-megabyte limit", async () => {
  for (const length of [8, chunkSize, chunkSize + 1, 2_000_000]) {
    const fixture = chunkFixture(length);
    const h = harness(fixture);
    const response = await h.get("ulleung-education-seal");
    assert.equal(response.status, 200, String(length));
    assertPrivate(response);
    assert.equal(response.headers.get("content-length"), String(length));
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), fixture.bytes);
    assert.equal(h.chunkReads.length, Math.ceil(length / chunkSize));
  }
});

test("invalid chunk manifests are rejected before reading any chunks", async () => {
  const fixture = chunkFixture();
  for (const [label, changes] of [
    ["unknown format", { format: "png-chunks-v2" }],
    ["missing byte length", { byteLength: undefined }],
    ["string byte length", { byteLength: String(fixture.bytes.length) }],
    ["short byte length", { byteLength: 7, chunkCount: 1 }],
    ["oversized byte length", { byteLength: 2_000_001, chunkCount: 4 }],
    ["fractional byte length", { byteLength: fixture.bytes.length + 0.5 }],
    ["NaN byte length", { byteLength: NaN }],
    ["infinite byte length", { byteLength: Infinity }],
    ["missing digest", { sha256: undefined }],
    ["uppercase digest", { sha256: fixture.documentData.sha256.toUpperCase() }],
    ["short digest", { sha256: "a".repeat(63) }],
    ["nonhex digest", { sha256: "g".repeat(64) }],
    ["missing count", { chunkCount: undefined }],
    ["zero count", { chunkCount: 0 }],
    ["five chunks", { chunkCount: 5 }],
    ["string count", { chunkCount: "3" }],
    ["fractional count", { chunkCount: 3.5 }],
    ["too few chunks", { chunkCount: 2 }],
    ["too many chunks for declared length", { chunkCount: 4 }],
  ]) {
    const h = harness({ ...fixture, documentData: { ...fixture.documentData, ...changes } });
    const response = await h.get("ulleung-education-seal");
    assert.equal(response.status, 503, label);
    assertPrivate(response);
    assert.notEqual(response.headers.get("content-type"), "image/png", label);
    assert.deepEqual(h.chunkReads, [], label);
    assert.equal(typeof (await response.json()).error, "string", label);
  }
});

test("missing, malformed, incorrectly sized, and modified chunks never return partial PNG bytes", async () => {
  const fixture = chunkFixture();
  const last = fixture.chunks.length - 1;
  const mutations = [
    [
      "missing chunk document",
      (chunks) => {
        delete chunks[1];
      },
    ],
    [
      "undefined chunk data",
      (chunks) => {
        chunks[1] = undefined;
      },
    ],
    [
      "missing PNG field",
      (chunks) => {
        chunks[1] = {};
      },
    ],
    [
      "base64 chunk",
      (chunks) => {
        chunks[1] = { png: chunks[1].png.toString("base64") };
      },
    ],
    [
      "typed array chunk",
      (chunks) => {
        chunks[1] = { png: new Uint8Array(chunks[1].png) };
      },
    ],
    [
      "short first chunk",
      (chunks) => {
        chunks[0] = { png: chunks[0].png.subarray(0, chunkSize - 1) };
      },
    ],
    [
      "long first chunk",
      (chunks) => {
        chunks[0] = { png: Buffer.concat([chunks[0].png, Buffer.alloc(1)]) };
      },
    ],
    [
      "short last chunk",
      (chunks) => {
        chunks[last] = { png: chunks[last].png.subarray(1) };
      },
    ],
    [
      "long last chunk",
      (chunks) => {
        chunks[last] = { png: Buffer.concat([chunks[last].png, Buffer.alloc(1)]) };
      },
    ],
    [
      "digest mismatch",
      (chunks) => {
        const png = Buffer.from(chunks[1].png);
        png[10] ^= 1;
        chunks[1] = { png };
      },
    ],
  ];
  for (const [label, mutate] of mutations) {
    const chunks = fixture.chunks.slice();
    mutate(chunks);
    const h = harness({ ...fixture, chunks });
    const response = await h.get("ulleung-education-seal");
    assert.equal(response.status, 503, label);
    assertPrivate(response);
    assert.notEqual(response.headers.get("content-type"), "image/png", label);
    assert.equal(typeof (await response.json()).error, "string", label);
  }
});

test("matching manifest hashes do not permit non-PNG assembled content", async () => {
  const fixture = chunkFixture();
  fixture.bytes[0] = 0;
  fixture.chunks[0].png[0] = 0;
  fixture.documentData.sha256 = hash(fixture.bytes);
  const response = await harness(fixture).get("ulleung-education-seal");
  assert.equal(response.status, 503);
  assertPrivate(response);
  assert.notEqual(response.headers.get("content-type"), "image/png");
  assert.equal(typeof (await response.json()).error, "string");
});

test("chunk read errors fail closed without returning database details or partial content", async () => {
  const detail = "private-chunk-error-not-for-response";
  const h = harness({ ...chunkFixture(), chunkError: new Error(detail) });
  const response = await h.get("ulleung-education-seal");
  assert.equal(response.status, 503);
  assertPrivate(response);
  assert.notEqual(response.headers.get("content-type"), "image/png");
  const body = await response.json();
  assert.equal(typeof body.error, "string");
  assert.ok(!body.error.includes(detail));
});

test("Firestore rules explicitly deny direct reads and writes to certificate assets", () => {
  const rules = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
  assert.match(
    rules,
    /match\s+\/certificateAssets\/\{document=\*\*\}\s*\{\s*allow\s+read\s*,\s*write\s*:\s*if\s+false\s*;\s*\}/,
  );
});

test("Next.js does not trace private signature files into deployment artifacts", () => {
  const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.doesNotMatch(config, /\/api\/certificates\/signatures/);
  assert.doesNotMatch(config, /\/api\/certificates\/assets/);
  assert.doesNotMatch(config, /private-assets\/certificates/);
});
