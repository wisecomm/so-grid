# 테마 및 Ag-Grid 호환성

`so-grid`는 `@tanstack/react-table`을 기반으로 구축된 경량 그리드이며, Ag-Grid와 동일한 코드베이스를 공유하지 않습니다. 하지만 유사한 시각적 경험을 제공하기 위해 노력하고 있습니다.

## Ag-Grid Alpine 테마

`so-grid.css`의 기본 변수를 업데이트하여 Ag-Grid의 **Alpine 테마**와 일치시켰습니다.

### CSS 변수
다음 변수들은 이제 Alpine 기본값을 반영합니다:

```css
  --so-grid-border-color: #babfc7;
  --so-grid-header-bg: #f8f8f8;
  --so-grid-header-text: #545454;
  --so-grid-row-bg: #ffffff;
  --so-grid-row-alt-bg: #ffffff;
  --so-grid-row-hover-bg: #ecf0f1;
  --so-grid-row-selected-bg: #b0e0e6;
  --so-grid-cell-text: #181d1f;
  --so-grid-font-size: 13px;
```

## 제한 사항 및 지원되지 않는 기능

`so-grid`는 Ag-Grid가 아니므로, 다음 Ag-Grid 전용 테마 기능은 **지원되지 않습니다**:

1.  **아이콘 세트 (Icon Sets)**: Ag-Grid는 독점적인 아이콘 폰트/SVG 세트를 사용합니다. `so-grid`는 Lucide React 아이콘이나 표준 글리프를 사용합니다. Ag-Grid 폰트 파일을 그대로 사용할 수 없습니다.
2.  **SASS/SCSS API**: Ag-Grid는 테마 생성을 위한 포괄적인 SASS API를 제공합니다. `so-grid`는 현재 표준 CSS 변수를 사용합니다.
3.  **복잡한 UI 컴포넌트**:
    - 컬럼 메뉴 (헤더의 햄버거 메뉴)
    - 컨텍스트 메뉴 (우클릭)
    - 플로팅 필터 (Floating Filters)
    - 사이드바 / 도구 패널 (Tool Panels)
    - *이러한 컴포넌트들은 `so-grid`의 DOM 구조에 존재하지 않으므로 스타일을 적용할 수 없습니다.*
4.  **고급 셀 렌더링**: Ag-Grid의 특정 셀 렌더러(예: 스파크라인, 리치 셀렉트 등)는 제공되지 않습니다.

## 사용자 정의 (Customizing)

테마를 추가로 사용자 정의하려면 애플리케이션의 CSS에서 CSS 변수를 재정의하세요:

```css
.so-grid {
  --so-grid-header-bg: #my-color;
  /* ... */
}
```
