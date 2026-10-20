# Streaming Chatbot

Claude의 답변이 **한 글자씩 실시간으로 나타나는** 챗봇 웹앱입니다.
서버는 Claude API의 스트리밍 응답을 받아 텍스트 스트림으로 전달하고, 프론트엔드는 그 스트림을 직접 읽어 화면에 이어 붙입니다. 응답 도중 연결이 끊기거나 사용자가 멈추는 상황까지 처리합니다.

> 🚧 **진행 중** — 현재는 마지막 메시지 하나만 Claude에 전달합니다. 이전 대화를 기억하는 기능을 준비하고 있습니다.

## 기술 스택

- **Next.js 16** (App Router, Route Handler)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Claude API** (`@anthropic-ai/sdk`, 개발 중에는 Claude Haiku 5.5)

## 주요 기능

### Claude API 연동 (서버)
- Route Handler가 `client.messages.stream()`으로 Claude에 요청하고, 도착하는 이벤트 중 답변 글자(`text_delta`)만 골라 `text/plain` 스트림으로 흘려보냅니다. 프론트엔드는 Claude의 이벤트 형식을 몰라도 됩니다.
- API 키는 서버 환경 변수로만 읽어 브라우저에 노출되지 않습니다.
- 사용자가 응답을 멈추면 Claude 요청까지 중단해, 아무도 보지 않는 답변에 토큰 비용이 나가지 않게 했습니다.
- 스트리밍 중 발생한 에러는 서버에 기록하고 클라이언트로 전달합니다. 사용자가 멈춘 경우는 에러로 취급하지 않습니다.
- 메시지 길이(500자)와 답변 길이(`max_tokens`)에 상한을 두어 요청 하나의 최대 비용을 제한합니다.

### 스트리밍 응답 표시
- 메시지를 보내면 빈 AI 말풍선을 먼저 만들고, 서버에서 청크가 도착할 때마다 글자를 이어 붙입니다.
- `fetch` 응답의 `ReadableStream`을 `getReader()`로 직접 읽고, `TextDecoder`로 바이트를 문자열로 변환합니다.
- 한글처럼 여러 바이트로 이루어진 글자가 청크 경계에서 잘려도 깨지지 않도록 `stream` 옵션으로 디코딩합니다.

### 채팅 UI
- 사용자 / AI 메시지를 위치와 색으로 구분하는 말풍선
- 새 메시지가 오면 목록 맨 아래로 자동 스크롤
- 응답을 받는 동안에는 전송 대신 **중지 버튼** 표시 (중복 전송 방지)
- 라이트 / 다크 모드 대응

### 응답 중지
- 답변이 나오는 도중 중지 버튼을 누르면 `AbortController`로 진행 중인 요청을 끊습니다.
- 요청마다 새 `AbortController`를 만들고, `useRef`에 보관해 렌더링이 바뀌어도 같은 요청을 멈출 수 있게 했습니다.
- 사용자가 멈춘 경우(`AbortError`)는 에러와 구분해, 받은 답변은 그대로 두고 회색 안내 문구만 붙입니다.
- 서버도 연결 끊김을 감지해 Claude 요청까지 중단합니다.

### 에러 처리
실패 지점 세 가지를 한 곳에서 처리하며, 모두 AI 말풍선 안에 안내 문구로 표시합니다.

| 상황 | 화면 |
|---|---|
| 요청 자체 실패 (네트워크 오류) | AI 자리에 에러 안내 |
| 서버 에러 응답 (4xx, 5xx) | AI 자리에 에러 안내 |
| 스트리밍 도중 연결 끊김 | **받은 답변은 그대로 두고** 그 아래에 에러 안내 |

에러 문구는 메시지 본문(`content`)과 분리된 화면 전용 필드로 관리해, 이후 LLM에 보낼 대화 기록에 섞이지 않도록 했습니다.

| 표시 | 의미 | 색 |
|---|---|---|
| 에러 안내 | 응답을 받지 못함 | 빨강 |
| 중지 안내 | 사용자가 직접 멈춤 | 회색 |

## API

프론트엔드와 백엔드는 아래 약속만 공유합니다. 처음에는 가짜 스트리밍 서버로 프론트엔드를 먼저 만들었고, 이후 백엔드를 Claude API로 교체할 때 프론트엔드 코드는 한 줄도 바뀌지 않았습니다.

```
POST /api/chat
Content-Type: application/json

{ "message": "안녕하세요" }
```

- **성공**: `200`, `text/plain; charset=utf-8` 스트림으로 답변이 조금씩 도착
- **실패**: `message`가 없거나 비어 있거나 500자를 넘으면 `400`

## 프로젝트 구조

```
app/
├── page.tsx              # 채팅 화면 + useChat 훅 + 스트림 읽기 함수
├── layout.tsx
├── globals.css
└── api/chat/route.ts     # Claude 스트리밍 응답을 text/plain으로 전달하는 Route Handler
```

`app/page.tsx` 안은 역할별로 나뉘어 있습니다.

| 부분 | 역할 |
|---|---|
| `streamReply` | 요청을 보내고 스트림을 읽어 청크를 콜백으로 전달 (React와 무관) |
| `updateLastMessage`, `withChunk`, `withError`, `withStopped` | 마지막 AI 메시지를 불변으로 갱신하는 순수 함수 |
| `useChat` | 메시지 목록, 응답 중 여부, `send` / `stop` 제공 |
| `Home` | 입력창, 자동 스크롤, 렌더링 |

## 실행 방법

1. 패키지를 설치합니다.

   ```bash
   npm install
   ```

2. 프로젝트 루트에 `.env.local` 파일을 만들고 [Claude Console](https://platform.claude.com)에서 발급한 API 키를 넣습니다. 이 파일은 `.gitignore`에 포함되어 커밋되지 않습니다.

   ```
   ANTHROPIC_API_KEY=your-api-key
   ```

3. 개발 서버를 실행하고 [http://localhost:3000](http://localhost:3000)을 엽니다.

   ```bash
   npm run dev
   ```

## 로드맵

- [x] 채팅 화면과 스트리밍 응답 표시
- [x] 응답 중 전송 버튼 비활성화
- [x] 에러 처리 (요청 실패 / 에러 응답 / 스트리밍 도중 끊김)
- [x] 응답 중지 버튼 (`AbortController`)
- [x] Claude API 스트리밍 연동
- [ ] 이전 대화 기억 (multi-turn)
- [ ] 대화 기록 저장 및 조회
- [ ] 배포 (요청 횟수 제한 등 남용 방지 포함)
