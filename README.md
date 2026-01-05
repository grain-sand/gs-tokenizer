# gs-tokenizer

A powerful and lightweight multilingual tokenizer library that provides natural language processing capabilities for multiple languages including English, Chinese, Japanese, and Korean.

## Documentation

- [English README](README.md)
- [中文 README](README.cn.md)
- [日本語 README](README.ja.md)
- [한국어 README](README.ko.md)

## Features

- **Language Support**: English, Chinese, Japanese, Korean
- **Intelligent Tokenization**:
  - English: Word boundary-based tokenization
  - CJK (Chinese, Japanese, Korean): Natural word segmentation using browser's Intl.Segmenter
  - Date: Special handling for date patterns
  - Punctuation: Consecutive punctuation marks are merged into a single token
- **Custom Dictionary**: Support for adding custom words with priority and name
- **Auto Language Detection**: Automatically detects the language of input text
- **Multiple Output Formats**: Get detailed token information or just word lists
- **Lightweight**: Minimal dependencies, designed for browser environments
- **Quick Use API**: Convenient static methods for easy integration

## Installation

```bash
yarn add gs-tokenizer
```

### Alternative Installation

```bash
npm install gs-tokenizer
```

## Usage

### Quick Use (Recommended)

The quick module provides convenient static methods for easy integration:

```javascript
import { tokenize, tokenizeText, addCustomDictionary } from 'gs-tokenizer';

// Direct tokenization without creating an instance
const text = 'Hello world! 我爱北京天安门。';
const tokens = tokenize(text);
const words = tokenizeText(text);
console.log(words);

// Add custom dictionary
addCustomDictionary(['人工智能', '技术'], 'tech', 10, 'zh');
```

### Advanced Usage

#### Load Custom Dictionary with Quick Module

```javascript
import { tokenize, addCustomDictionary } from 'gs-tokenizer';

// Load multiple custom dictionaries for different languages
addCustomDictionary(['人工智能', '机器学习'], 'tech', 10, 'zh');
addCustomDictionary(['Web3', 'Blockchain'], 'crypto', 10, 'en');
addCustomDictionary(['アーティフィシャル・インテリジェンス'], 'tech-ja', 10, 'ja');

// Tokenize with custom dictionaries applied
const text = '人工智能和Web3是未来的重要技术。アーティフィシャル・インテリジェンスも重要です。';
const tokens = tokenize(text);
console.log(tokens.filter(token => token.src === 'tech'));
```

#### Without Built-in Lexicon

```javascript
import { MultilingualTokenizer } from 'gs-tokenizer';

// Create tokenizer without using built-in lexicon
const tokenizer = new MultilingualTokenizer({
  customDictionaries: {
    'zh': [{ priority: 10, data: new Set(['自定义词']), name: 'custom', lang: 'zh' }]
  }
});

// Tokenize using only custom dictionary
const text = '这是一个自定义词的示例。';
const tokens = tokenizer.tokenize(text, 'zh');
console.log(tokens);
```

### Custom Dictionary

```javascript
const tokenizer = new MultilingualTokenizer();

// Add custom words with name, priority, and language
tokenizer.addCustomDictionary(['人工智能', '技术'], 'tech', 10, 'zh');
tokenizer.addCustomDictionary(['Python', 'JavaScript'], 'programming', 5, 'en');

const text = '我爱人工智能技术和Python编程';
const tokens = tokenizer.tokenize(text);
const words = tokenizer.tokenizeText(text);
console.log(words); // Should include '人工智能', 'Python'

// Remove custom word
tokenizer.removeCustomWord('Python', 'en', 'programming');
```

### Advanced Options

```javascript
const tokenizer = createTokenizer({
  defaultLanguage: 'en',
  customDictionaries: {
    'zh': [{
      priority: 10,
      data: new Set(['自定义词']),
      name: 'custom',
      lang: 'zh'
    }]
  }
});

// Tokenize with specified language
const text = '我爱北京天安门';
const tokens = tokenizer.tokenize(text, 'zh');
```

## API Reference

### `MultilingualTokenizer`

Main tokenizer class that handles multilingual text processing.

#### Constructor

```typescript
import { MultilingualTokenizer, TokenizerOptions } from 'gs-tokenizer';

const tokenizer = new MultilingualTokenizer(options)
```

**Options**:
- `customDictionaries`: Record<string, LexiconEntry[]> - Custom dictionaries for each language
- `defaultLanguage`: string - Default language code (default: 'en')

#### Methods

| Method | Description |
|--------|-------------|
| `tokenize(text: string, language?: string): Token[]` | Tokenizes the input text and returns detailed token information |
| `tokenizeText(text: string, language?: string): string[]` | Tokenizes the input text and returns only word tokens |
| `addCustomDictionary(words: string[], name: string, priority?: number, language?: string): void` | Adds custom words to the tokenizer |
| `removeCustomWord(word: string, language?: string, lexiconName?: string): void` | Removes a custom word from the tokenizer |

### `createTokenizer(options?: TokenizerOptions): MultilingualTokenizer`

Factory function to create a new MultilingualTokenizer instance with optional configuration.

### Quick Use API

The quick module provides convenient static methods:

```typescript
import { Token } from 'gs-tokenizer';

// Quick Use API type definition
type QuickUseAPI = {
  // Tokenize text
  tokenize: (text: string, language?: string) => Token[];
  // Tokenize to text only
  tokenizeText: (text: string, language?: string) => string[];
  // Add custom dictionary
  addCustomDictionary: (words: string[], name: string, priority?: number, language?: string) => void;
  // Remove custom word
  removeCustomWord: (word: string, language?: string, lexiconName?: string) => void;
  // Set default languages for lexicon loading
  setDefaultLanguages: (languages: string[]) => void;
  // Set default types for lexicon loading
  setDefaultTypes: (types: string[]) => void;
};

// Import quick use API
import { tokenize, tokenizeText, addCustomDictionary, removeCustomWord, setDefaultLanguages, setDefaultTypes } from 'gs-tokenizer';
```

### Types

#### `Token` Interface

```typescript
interface Token {
  txt: string;              // Token text content
  type: 'word' | 'punctuation' | 'space' | 'other' | 'emoji' | 'date' | 'host' | 'ip' | 'number' | 'hashtag' | 'mention';
  lang?: string;            // Language code
  src?: string;             // Source (e.g., custom dictionary name)
}
```

#### `TokenizerOptions` Interface

```typescript
import { LexiconEntry } from 'gs-tokenizer';

interface TokenizerOptions {
  customDictionaries?: Record<string, LexiconEntry[]>;
  granularity?: 'word' | 'grapheme' | 'sentence';
  defaultLanguage?: string;
}
```

## Browser Compatibility

- Chrome/Edge: 87+
- Firefox: 86+
- Safari: 14.1+

Note: Uses `Intl.Segmenter` for CJK languages, which requires modern browser support.

## Development

### Build

```bash
npm run build
```

### Run Tests

```bash
npm run test          # Run all tests
npm run test:base     # Run base tests
npm run test:english  # Run English-specific tests
npm run test:cjk      # Run CJK-specific tests
npm run test:mixed    # Run mixed language tests
```

## License

MIT

[GitHub Repository](https://github.com/grain-sand/gs-tokenizer)
