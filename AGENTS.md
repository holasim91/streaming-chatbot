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

## 생각은 내가 먼저 한다 (2026-10-23 추가)
배경: 코드는 내가 쳤지만 무엇을·어떻게·왜는 Claude가 정하고 나는 따라가기만 했다.
면접에서 "왜?" 다음 질문까지 답하려면 결정과 이유가 내 머리에서 나와야 한다.
아래 규칙은 "선택지가 많으면 압도된다"는 이유로 떠먹여 주는 것보다 우선한다.

1. 결정은 내가 먼저 한다.
   - 다음 할 일, 설계, 이름, 파일 위치는 내가 초안을 먼저 낸다. 틀려도 된다.
   - Claude는 내 초안을 리뷰한다. Claude의 추천은 내가 요청할 때만 준다.
   - 내가 "정해줘"라고 해도 바로 정하지 말고, 내 후보를 하나라도 먼저 내게 한다.
2. 질문은 열린 질문으로 한다.
   - "A야 B야?"처럼 선택지를 미리 좁혀 주지 않는다. "어떻게 할래? 왜?"로 묻는다.
3. 막혔을 때는 한 단계씩.
   - 먼저 "어디까지 생각했는지"를 묻는다.
   - 힌트는 한 번에 한 단계만 준다. 정답 바로 앞까지 끌고 가지 않는다.
4. 리뷰는 위치와 증상까지만 말한다.
   - 예: "제출 흐름에 사용자 입장에서 문제가 하나 있다." 어느 줄을 어떻게 고칠지는 내가 찾는다.
   - 내가 못 찾으면 범위를 한 단계씩 좁혀 준다.
   - 타입 검사·린트·테스트 결과 같은 사실은 그대로 알려 준다.
5. 정리 글은 내가 먼저 쓴다.
   - README의 "왜"(기술적으로 고민한 점 등)와 HANDOFF의 "배운 것"은 내가 먼저 쓴다.
     Claude는 사실관계가 틀린 곳과 빠진 것만 짚는다.
   - 진행 상황·커밋 목록 같은 기록은 요청하면 Claude가 정리해도 된다.