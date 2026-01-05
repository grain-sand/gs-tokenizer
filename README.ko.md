# gs-tokenizer

영어, 중국어, 일본어, 한국어 등 다국어를 지원하는 강력하고 가벼운 다국어 토크나이저 라이브러리입니다.

## 문서

- [English README](README.md)
- [中文 README](README.cn.md)
- [日本語 README](README.ja.md)
- [한국어 README](README.ko.md)

## 기능

- **언어 지원**: 영어, 중국어, 일본어, 한국어
- **지능형 토큰화**:
  - 영어: 단어 경계 기반 토큰화
  - CJK(중국어, 일본어, 한국어): 브라우저의 Intl.Segmenter를 사용한 자연스러운 단어 분할
  - 날짜: 날짜 패턴에 대한 특별 처리
  - 구두점: 연속된 구두점은 단일 토큰으로 병합
- **사용자 정의 사전**: 우선순위와 이름이 있는 사용자 정의 단어 추가 지원
- **자동 언어 감지**: 입력 텍스트의 언어를 자동으로 감지
- **다양한 출력 형식**: 상세한 토큰 정보 또는 단어 목록만 가져오기
- **가벼움**: 최소한의 종속성, 브라우저 환경에 최적화
- **빠른 사용 API**: 쉽게 통합할 수 있는 편리한 정적 메서드

## 설치

```bash
yarn add gs-tokenizer
```

### 대체 설치 방법

```bash
npm install gs-tokenizer
```

## 사용 방법

### 빠른 사용 (권장)

quick 모듈은 쉽게 통합할 수 있는 편리한 정적 메서드를 제공합니다:

```javascript
import { tokenize, tokenizeText, addCustomDictionary } from 'gs-tokenizer';

// 인스턴스 생성 없이 직접 토큰화
const text = 'Hello world! 나는 북경 천안문을 좋아합니다.';
const tokens = tokenize(text);
const words = tokenizeText(text);
console.log(words);

// 사용자 정의 사전 추가
addCustomDictionary(['인공지능', '기술'], 'zh', 10, 'tech');
```

### 고급 사용법

#### 빠른 모듈로 사용자 정의 사전 로드

```javascript
import { tokenize, addCustomDictionary } from 'gs-tokenizer';

// 다른 언어에 대한 여러 사용자 정의 사전 로드
addCustomDictionary(['인공지능', '머신러닝'], 'zh', 10, 'tech');
addCustomDictionary(['Web3', 'Blockchain'], 'en', 10, 'crypto');
addCustomDictionary(['인공지능'], 'ko', 10, 'tech-ko');

// 사용자 정의 사전을 적용하여 토큰화
const text = '인공지능과 Web3는 미래의 중요한 기술입니다. 인공지능도 중요합니다.';
const tokens = tokenize(text);
console.log(tokens.filter(token => token.src === 'tech'));
```

#### 기본 사전 사용 안함

```javascript
import { MultilingualTokenizer } from 'gs-tokenizer';

// 기본 사전을 사용하지 않는 토크나이저 생성
const tokenizer = new MultilingualTokenizer({
  customDictionaries: {
    'ko': [{ priority: 10, data: new Set(['사용자정의단어']), name: 'custom', lang: 'ko' }]
  }
});

// 사용자 정의 사전만 사용하여 토큰화
const text = '이것은 사용자정의단어의 예입니다.';
const tokens = tokenizer.tokenize(text, 'ko');
console.log(tokens);
```

### 사용자 정의 사전

```javascript
const tokenizer = new MultilingualTokenizer();

// 언어, 우선순위, 이름을 지정하여 사용자 정의 단어 추가
tokenizer.addCustomDictionary(['인공지능', '기술'], 'zh', 10, 'tech');
tokenizer.addCustomDictionary(['Python', 'JavaScript'], 'en', 5, 'programming');

const text = '나는 인공지능 기술과 Python 프로그래밍을 좋아합니다';
const tokens = tokenizer.tokenize(text);
const words = tokenizer.tokenizeText(text);
console.log(words); // '인공지능', 'Python'이 포함되어야 함

// 사용자 정의 단어 삭제
okenizer.removeCustomWord('Python', 'en', 'programming');
```

### 고급 옵션

```javascript
const tokenizer = createTokenizer({
  defaultLanguage: 'ko',
  customDictionaries: {
    'ko': [{
      priority: 10,
      data: new Set(['사용자정의단어']),
      name: 'custom',
      lang: 'ko'
    }]
  }
});

// 지정된 언어로 토큰화
const text = '나는 북경 천안문을 좋아합니다';
const tokens = tokenizer.tokenize(text, 'zh');
```

## API 참조

### `MultilingualTokenizer`

다국어 텍스트 처리를 담당하는 주요 토크나이저 클래스입니다.

#### 생성자

```typescript
import { MultilingualTokenizer, TokenizerOptions } from 'gs-tokenizer';

const tokenizer = new MultilingualTokenizer(options)
```

**옵션**:
- `customDictionaries`: Record<string, LexiconEntry[]> - 각 언어에 대한 사용자 정의 사전
- `defaultLanguage`: string - 기본 언어 코드 (기본값: 'en')

#### 메서드

| 메서드 | 설명 |
|------|------|
| `tokenize(text: string, language?: string): Token[]` | 입력 텍스트를 토큰화하고 상세한 토큰 정보를 반환합니다 |
| `tokenizeText(text: string, language?: string): string[]` | 입력 텍스트를 토큰화하고 단어 목록만 반환합니다 |
| `addCustomDictionary(words: string[], language: string, priority: number, name: string): void` | 토크나이저에 사용자 정의 단어를 추가합니다 |
| `removeCustomWord(word: string, language?: string, lexiconName?: string): void` | 토크나이저에서 사용자 정의 단어를 제거합니다 |

### `createTokenizer(options?: TokenizerOptions): MultilingualTokenizer`

선택적 구성으로 새로운 MultilingualTokenizer 인스턴스를 생성하는 팩토리 함수입니다.

### 빠른 사용 API

quick 모듈은 편리한 정적 메서드를 제공합니다:

```typescript
import { Token } from 'gs-tokenizer';

// 빠른 사용 API 타입 정의
type QuickUseAPI = {
  // 텍스트 토큰화
  tokenize: (text: string, language?: string) => Token[];
  // 텍스트만 토큰화
  tokenizeText: (text: string, language?: string) => string[];
  // 사용자 정의 사전 추가
  addCustomDictionary: (words: string[], language: string, priority: number, name: string) => void;
  // 사용자 정의 단어 제거
  removeCustomWord: (word: string, language?: string, lexiconName?: string) => void;
  // 사전 로딩의 기본 언어 설정
  setDefaultLanguages: (languages: string[]) => void;
  // 사전 로딩의 기본 타입 설정
  setDefaultTypes: (types: string[]) => void;
};

// 빠른 사용 API 가져오기
import { tokenize, tokenizeText, addCustomDictionary, removeCustomWord, setDefaultLanguages, setDefaultTypes } from 'gs-tokenizer';
```

### 타입

#### `Token` 인터페이스

```typescript
interface Token {
  txt: string;              // 토큰 텍스트 내용
  type: 'word' | 'punctuation' | 'space' | 'other' | 'emoji' | 'date';
  lang?: string;            // 언어 코드
  src?: string;             // 소스 (예: 사용자 정의 사전 이름)
}
```

#### `TokenizerOptions` 인터페이스

```typescript
import { LexiconEntry } from 'gs-tokenizer';

interface TokenizerOptions {
  customDictionaries?: Record<string, LexiconEntry[]>;
  granularity?: 'word' | 'grapheme' | 'sentence';
  defaultLanguage?: string;
}
```

## 브라우저 호환성

- Chrome/Edge: 87+
- Firefox: 86+
- Safari: 14.1+

참고: CJK 언어에 `Intl.Segmenter`를 사용하므로 최신 브라우저 지원이 필요합니다.

## 개발

### 빌드

```bash
npm run build
```

### 테스트 실행

```bash
npm run test          # 모든 테스트 실행
npm run test:base     # 기본 테스트 실행
npm run test:english  # 영어 특정 테스트 실행
npm run test:cjk      # CJK 특정 테스트 실행
npm run test:mixed    # 혼합 언어 테스트 실행
```

## 라이선스

MIT

[GitHub Repository](https://github.com/grain-sand/gs-tokenizer)
