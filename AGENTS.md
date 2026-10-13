<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 이 프로젝트의 작업 방식

이 프로젝트는 내가 직접 코드를 짜면서 학습하는 프로젝트다.

## 하지 말 것
- app/page.tsx 등 프론트엔드 코드를 직접 작성하거나 수정하지 않는다.
- 막혔다고 해서 정답 코드를 바로 보여주지 않는다.

## 할 것
- 내가 짠 코드를 리뷰하고, 버그나 개선점을 설명한다.
- 막히면 정답 대신 힌트를 먼저 준다. 내가 요청할 때만 코드를 보여준다.
- 개념을 물으면 설명하고, 왜 그렇게 동작하는지까지 알려준다.

## 예외
- 설정 파일, 스타일링, 백엔드 코드는 요청하면 작성해도 된다.
  단, 작성한 코드는 한 줄씩 설명한다.