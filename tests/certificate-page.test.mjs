import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { certificateCourse } from "../lib/certificates/course.ts";
import { publicRoutes } from "../lib/routes.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the participation certificate keeps issuer and education-related institution distinct", () => {
  assert.equal(certificateCourse.issuer, "트위즈덤");
  assert.equal(certificateCourse.partner, "한동대학교");
  assert.match(certificateCourse.title, /AI와 게이미피케이션/);
  assert.match(certificateCourse.title, /울릉도·독도/);
  assert.match(certificateCourse.body, /교육 활동에 참여/);
  assert.match(certificateCourse.disclaimer, /대학 학위·공인 자격증이 아닙니다/);
});

test("certificate access is discoverable from resources but excluded from indexing", async () => {
  assert.equal(publicRoutes.find((route) => route.path === "/certificates")?.noIndex, true);
  assert.match(await read("app/materials/page.tsx"), /href="\/certificates"/);
  const page = await read("app/certificates/page.tsx");
  assert.match(page, /getCertificateAccess/);
  assert.match(page, /force-dynamic/);
  assert.match(page, /index: false, follow: false/);
});

test("the certificate maps supplied signatures and the educational seal to the correct people", async () => {
  const paper = await read("app/certificates/certificate-paper.tsx");
  assert.equal(certificateCourse.professor, "김병철");
  assert.equal(certificateCourse.representative, "이성로");
  assert.equal(certificateCourse.school, "울릉고등학교");
  assert.equal(certificateCourse.principal, "김상현");
  for (const asset of ["kim-byeongcheol", "lee-seongro", "ulleung-education-seal"]) {
    assert.ok(paper.includes(`/api/certificates/assets/${asset}`));
  }
  assert.equal((paper.match(/certificate &&/g) || []).length, 3);
  assert.match(paper, /울릉고등학교 교육활동용 인장/);
  assert.match(paper, /ulleung-high-logo\.png/);
  assert.match(paper, /교육 연계/);
  assert.match(paper, /발급 ·/);
  assert.doesNotMatch(paper, /김강훈|교장.*서명|총장|직인\.png|<canvas|dangerouslySetInnerHTML/);
});

test("the client keeps its access code private and does not persist student names", async () => {
  const client = await read("app/certificates/certificate-client.tsx");
  assert.doesNotMatch(client, /9503|CERTIFICATE_ACCESS_CODE|CERTIFICATE_SESSION_SECRET/);
  assert.doesNotMatch(client, /localStorage|sessionStorage|document\.write|window\.open/);
  assert.match(client, /setCertificate\(body\.certificate\)/);
  assert.match(client, /setCertificate\(null\)/);
  assert.match(client, /document\.fonts\.ready/);
  assert.match(client, /body\.authorized !== true/);
  assert.match(client, /window\.print\(\)/);
});

test("only the print root is printed and the document includes safe physical margins", async () => {
  const css = await read("app/certificates/certificate.module.css");
  assert.match(css, /@page\s*\{\s*size: A4 landscape/);
  assert.match(css, /@media print/);
  assert.match(css, /\.printRoot\s*\{\s*display: none/);
  assert.match(css, /inset: 30px/);
  assert.match(css, /\.sealImage\s*\{\s*width: 76px;\s*height: 76px/);
  const paper = await read("app/certificates/certificate-paper.tsx");
  assert.match(paper, /preview &&/);
  assert.match(paper, /lang="ko"/);
});

test("the official university image stays unchanged and certificate privacy is explained", async () => {
  const png = await readFile(
    new URL("../public/assets/certificates/handong-logo.png", import.meta.url),
  );
  const { createHash } = await import("node:crypto");
  assert.equal(
    createHash("sha256").update(png).digest("hex"),
    "7d9f457407577a340b1ce7565af468f85e79dc0c4c64550eb0e28e3cf3217ba2",
  );
  const privacy = await read("app/privacy/page.tsx");
  assert.match(privacy, /서버 데이터베이스에 저장하지 않습니다/);
  assert.match(privacy, /원본 IP 주소와 입력한 인증번호는 이 기록에 저장하지 않습니다/);
});
