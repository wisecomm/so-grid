---
description: React 컴포넌트의 스토리북 스토리를 자동으로 생성합니다.
---

# 스토리북 스토리 생성기 워크플로우

이 워크플로우는 React 컴포넌트용 스토리북 스토리를 작성하는 반복적인 작업을 자동화하도록 설계되었습니다.

## 1. 환경 확인
- **스토리북 확인**: 현재 패키지(`package.json`)에 스토리북이 설치되어 있는지 빠르게 확인합니다.
  - 설치되어 있지 않다면: `npx storybook@latest init` 실행을 제안하거나 직접 수행할지 물어봅니다 (권한 요청).
  - 설치되어 있다면: 계속 진행합니다.

## 2. 컴포넌트 분석
- **대상 파일**: 현재 활성화된 파일 또는 사용자가 지정한 파일을 식별합니다.
- **분석**: 파일 내용을 읽습니다.
  - 메인 컴포넌트 이름을 식별합니다.
  - Props 인터페이스/타입을 파싱하여 사용 가능한 입력을 이해합니다.
  - 필요한 컨텍스트나 제공자(예: Theme, Redux, 특정 훅)가 있는지 확인합니다.

## 3. 스토리 생성
- **대상 경로**: 출력 경로를 결정합니다. 보통 `[SameDir]/[ComponentName].stories.tsx`입니다.
- **생성 로직**:
  - CSF 3.0 형식을 사용합니다 (최신 스토리북 표준).
  - **임포트**: 
    - `import type { Meta, StoryObj } from '@storybook/react';`
    - `import { [ComponentName] } from './[ComponentName]';`
  - **메타 구성**:
    - `title`: `Components/[ComponentName]` (또는 폴더 구조에 따라 경로 추론).
    - `component`: `[ComponentName]`.
    - `tags`: `['autodocs']`.
    - `argTypes`: 복잡한 타입(enums, unions)에 대해 가능한 경우 컨트롤을 자동 생성합니다.
  - **스토리**:
    - **Default**: 필수 props를 사용한 기본 사용법.
    - **Variations**: 다양한 prop 상태에 대한 특정 스토리 (예: `Primary`, `Secondary`, `Disabled`, `Loading` 등 적용 가능한 경우).
  - **모의 데이터**: props가 객체 배열이나 복잡한 데이터를 필요로 하는 경우, 현실적인 모의 데이터를 생성합니다.

## 4. 실행
- `write_to_file`을 사용하여 파일을 생성합니다.
- 사용자에게 스토리가 생성되었음을 알립니다.

## 사용할 예제 템플릿
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // 필요한 경우 커스텀 컨트롤
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // props
  },
};
```
