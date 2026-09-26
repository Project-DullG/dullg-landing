<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 배포 전 확인

- 운영 주소는 `https://dullg-landing-one.vercel.app`이다. 별도 요청 없이 호스팅을 변경하지 않는다.
- 작업 시작 시 `git status`, 로컬 HEAD, GitHub `main`을 비교한다. 다른 작업 폴더에서 반영한 변경을 확인하지 않고 현재 폴더를 배포하지 않는다.
- 병합할 때 스피킹·영상 등 로컬 추가 기능과 원격의 활동 기록·자료·공개 중단 내역을 함께 검토한다. 과거 사용자 요청으로 삭제한 콘텐츠를 다시 공개하지 않는다.
- 빌드와 테스트를 통과한 코드를 GitHub `main`에 반영한 뒤 `npm run deploy:check`를 실행한다. 로컬 파일이 변경됐거나 HEAD가 원격 `main`과 다르면 배포하지 않는다.
- CLI 운영 배포가 필요하면 `npm run deploy:production`을 사용한다. 검사를 우회하는 `vercel --prod` 직접 실행은 하지 않는다.
- GitHub 자동 배포도 배포 상태와 실제 운영 URL에서 변경 내용·대표 경로를 확인한 뒤 완료로 보고한다.
