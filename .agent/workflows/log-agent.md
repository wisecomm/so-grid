---
description: so-grid-demo 및 관련 패키지 빌드 과정 로그 확인 및 디버깅
---

# 빌드 로그 확인 워크플로우

## 패키지 빌드 명령어

### 1. so-grid-demo 빌드 (상세 로그)

```bash
// turbo
pnpm --filter so-grid-demo build 2>&1 | tee build.log
```

### 2. 전체 모노레포 빌드

```bash
// turbo
pnpm build 2>&1 | tee build-all.log
```

### 3. 개별 패키지 빌드

#### so-grid-core 빌드
```bash
// turbo
pnpm --filter so-grid-core build
```

#### so-grid-react 빌드
```bash
// turbo
pnpm --filter so-grid-react build
```

---

## TypeScript 타입 체크 (빌드 전 검증)

### 1. so-grid-demo 타입 체크만 실행

```bash
// turbo
cd packages/so-grid-demo && npx tsc --noEmit
```

### 2. 전체 프로젝트 타입 체크

```bash
// turbo
pnpm -r exec tsc --noEmit
```

---

## Vite 빌드 분석

### 1. 번들 크기 분석

```bash
// turbo
pnpm --filter so-grid-demo build -- --mode production
```

### 2. 빌드 시간 측정

```bash
// turbo
time pnpm --filter so-grid-demo build
```

---

## 빌드 오류 디버깅

### 1. 상세 오류 로그 확인

```bash
pnpm --filter so-grid-demo build --debug
```

### 2. 의존성 문제 확인

```bash
// turbo
pnpm why <package-name>
```

### 3. 캐시 정리 후 재빌드

```bash
pnpm --filter so-grid-demo exec rm -rf dist node_modules/.vite && pnpm --filter so-grid-demo build
```

---

## 빌드 순서

모노레포에서 올바른 빌드 순서:

1. `so-grid-core` - 핵심 타입 및 유틸리티
2. `so-grid-react` - React 컴포넌트 (so-grid-core 의존)
3. `so-grid-demo` - 데모 앱 (so-grid-react 의존)

### 순차 빌드 실행

```bash
// turbo
pnpm --filter so-grid-core build && pnpm --filter so-grid-react build && pnpm --filter so-grid-demo build
```

---

## 빌드 출력 확인

### 1. 빌드 결과물 확인

```bash
// turbo
ls -la packages/so-grid-demo/dist/
```

### 2. 빌드 크기 요약

```bash
// turbo
du -sh packages/so-grid-demo/dist/*
```

### 3. 빌드된 앱 미리보기

```bash
pnpm --filter so-grid-demo preview
```

---

## 일반적인 빌드 오류 해결

| 오류 유형 | 해결 방법 |
|----------|----------|
| TypeScript 오류 | `npx tsc --noEmit`으로 타입 오류 확인 |
| 모듈 찾을 수 없음 | `pnpm install` 재실행 |
| 의존성 버전 충돌 | `pnpm why <package>` 확인 후 버전 조정 |
| 캐시 문제 | `rm -rf node_modules/.vite dist` |
| 워크스페이스 링크 오류 | `pnpm install --force` |

---

## 로그 파일 위치

- 빌드 로그: `./build.log` (tee 명령어 사용 시)
- TypeScript 오류: 터미널 출력
- Vite 로그: `./node_modules/.vite/` (캐시)
