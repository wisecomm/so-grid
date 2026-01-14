---
description: so-grid-demo에서 Playwright E2E 테스트 실행 및 디버깅
---

# Playwright E2E 테스트 실행 워크플로우

## 사전 요건

1. so-grid-demo 패키지에 `@playwright/test`가 설치되어 있어야 함
2. 개발 서버가 `http://localhost:3000`에서 실행 중이거나 자동 시작 가능해야 함

---

## 테스트 실행

### 1. 전체 테스트 실행 (Headless)

```bash
// turbo
pnpm --filter so-grid-demo test
```

### 2. Chromium에서만 테스트 실행 (빠른 테스트)

```bash
// turbo
pnpm --filter so-grid-demo test --project=chromium
```

### 3. UI 모드로 테스트 실행 (디버깅에 유용)

```bash
pnpm --filter so-grid-demo test:ui
```

### 4. 특정 테스트 파일 실행

```bash
// turbo
pnpm --filter so-grid-demo test tests/navigation.spec.ts --project=chromium
```

### 5. 디버그 모드로 실행

```bash
pnpm --filter so-grid-demo test:debug
```

---

## 테스트 리포트 보기

```bash
pnpm --filter so-grid-demo test:report
```

---

## 테스트 파일 위치

- `packages/so-grid-demo/tests/navigation.spec.ts` - 네비게이션 테스트
- `packages/so-grid-demo/tests/grid.spec.ts` - 그리드 기능 테스트
- `packages/so-grid-demo/tests/toolbar.spec.ts` - 툴바 기능 테스트
- `packages/so-grid-demo/tests/pagination.spec.ts` - 페이지네이션 테스트

---

## 컴포넌트 셀렉터 가이드

### SO-Grid 컴포넌트 CSS 클래스

| 요소 | CSS 클래스 |
|------|------------|
| 그리드 컨테이너 | `.so-grid` |
| 그리드 래퍼 | `.so-grid__wrapper` |
| 테이블 | `.so-grid__table` |
| 테마 클래스 | `.so-grid--default`, `.so-grid--dark`, `.so-grid--compact` |

### 데모 앱 CSS 클래스

| 요소 | CSS 클래스 |
|------|------------|
| 앱 컨테이너 | `.app` |
| 사이드바 | `.app-sidebar` |
| 사이드바 헤더 | `.sidebar-header` |
| 메뉴 아이템 | `.menu-item` |
| 메인 컨텐츠 | `.app-main` |
| 데모 섹션 | `.demo-section` |
| 컨트롤 영역 | `.controls` |
| 그리드 영역 | `.grid-container` |
| 정보 패널 | `.info-panel` |

### 버튼 접근 방법

툴바 버튼들은 한국어 텍스트를 사용:
- 조회 버튼: `page.getByRole('button', { name: '조회' })`
- 추가/등록: `ActionButtons` 컴포넌트 사용

---

## 새 테스트 작성 시 참고사항

1. **한국어 텍스트 사용**: 버튼/레이블이 한국어로 되어 있으므로 셀렉터에 한국어 사용
2. **그리드 로딩 대기**: `await page.waitForSelector('.so-grid')` 사용
3. **토스트 확인**: `[role="alert"]` 또는 커스텀 토스트 셀렉터 사용
4. **페이지 첫 로드 시 Order Demo가 기본으로 활성화됨**

---

## 문제 해결

### 테스트 타임아웃 발생 시

1. 개발 서버가 실행 중인지 확인: `pnpm --filter so-grid-demo dev`
2. 브라우저가 설치되어 있는지 확인: `npx playwright install`
3. 셀렉터가 올바른지 확인 (UI 모드에서 요소 검사)

### 특정 브라우저에서만 실패하는 경우

해당 브라우저를 제외하고 테스트:
```bash
pnpm --filter so-grid-demo test --project=chromium --project=firefox
```
