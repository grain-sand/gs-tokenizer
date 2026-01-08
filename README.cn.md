  # gs-tokenizer - 多语言分词器

这是一个纯前端的极小体积的简单分词器，受限于体积有各种不完善，好处是能够以极少体积在浏览器运行。

## 文档

- [English README](README.md)
- [中文 README](README.cn.md)
- [日本語 README](README.ja.md)
- [한국어 README](README.ko.md)

## 特性

- **语言支持**：英语、中文、日语、韩语
- **智能分词**：
  - 英语：基于词边界的分词
  - CJK（中文、日语、韩语）：使用浏览器的Intl.Segmenter进行自然分词
  - 日期：对日期模式的特殊处理
  - 符号处理：连续的符号会被合并为单个token
- **自定义词典**：支持添加带优先级和名称的自定义词语
- **自动语言检测**：自动检测输入文本的语言
- **多种输出格式**：获取详细的分词信息或仅获取词语列表
- **轻量级**：最小依赖，专为浏览器环境设计
- **快速使用API**：便捷的静态方法，易于集成
- **tokenizeAll**：core模块中的新特性，返回每个位置的所有可能tokens

## 模块比较

| 模块 | 稳定性 | 速度 | 分词准确性 | 新特性 |
|------|--------|------|------------|--------|
| old | ✅ 更稳定 | ⚡️ 较慢 | ✅ 更准确 | ❌ 无新特性 |
| core | ⚠️ 较不稳定 | ⚡️ 更快 | ⚠️ 可能不够准确 | ✅ tokenizeAll, 基于Stage的架构 |

## 安装

```bash
yarn add gs-tokenizer
```

### 其他安装方式

```bash
npm install gs-tokenizer
```

## 使用

### 快速使用（推荐）

quick模块提供了便捷的静态方法，方便快速集成：

```javascript
import { tokenize, tokenizeText, addCustomDictionary } from 'gs-tokenizer';

// 直接分词，无需创建实例
const text = 'Hello world! 我爱北京天安门。';
const tokens = tokenize(text);
const words = tokenizeText(text);
console.log(words);

// 添加自定义词典
addCustomDictionary(['人工智能', '技术'], 'zh', 10, 'tech');
```

### 高级用法

#### 使用快速模块加载自定义词典

```javascript
import { tokenize, addCustomDictionary } from 'gs-tokenizer';

// 加载多个语言的自定义词库
addCustomDictionary(['人工智能', '机器学习'], 'tech', 10, 'zh');
addCustomDictionary(['Web3', 'Blockchain'], 'crypto', 10, 'en');
addCustomDictionary(['アーティフィシャル・インテリジェンス'], 'tech-ja', 10, 'ja');

// 应用自定义词典进行分词
const text = '人工智能和Web3是未来的重要技术。アーティフィシャル・インテリジェンスも重要です。';
const tokens = tokenize(text);
console.log(tokens.filter(token => token.src === 'tech'));
```

#### 不使用内置词库

```javascript
import { MultilingualTokenizer } from 'gs-tokenizer';

// 创建不使用内置词库的分词器
const tokenizer = new MultilingualTokenizer({
  customDictionaries: {
    'zh': [{ priority: 10, data: new Set(['自定义词']), name: 'custom', lang: 'zh' }]
  }
});

// 仅使用自定义词典进行分词
const text = '这是一个自定义词的示例。';
const tokens = tokenizer.tokenize(text, 'zh');
console.log(tokens);
```

### 自定义词典

```javascript
const tokenizer = new OldMultilingualTokenizer();

// 使用名称、优先级和语言添加自定义词
tokenizer.addCustomDictionary(['人工智能', '技术'], 'tech', 10, 'zh');
tokenizer.addCustomDictionary(['Python', 'JavaScript'], 'programming', 5, 'en');

const text = '我爱人工智能技术和Python编程';
const tokens = tokenizer.tokenize(text);
const words = tokenizer.tokenizeText(text);
console.log(words); // 应该包含 '人工智能', 'Python'

// 删除自定义词语
tokenizer.removeCustomWord('Python', 'en', 'programming');
```

### 高级选项

```javascript
import { MultilingualTokenizer } from 'gs-tokenizer';

const tokenizer = new MultilingualTokenizer();

// 分词文本
const text = '我爱北京天安门';
const tokens = tokenizer.tokenize(text);

// 获取所有可能的tokens (仅core模块)
const allTokens = tokenizer.tokenizeAll(text);
```

### 使用Old模块

```javascript
import { OldMultilingualTokenizer } from 'gs-tokenizer/old';

const tokenizer = new OldMultilingualTokenizer();

// 分词文本 (old更稳定但速度较慢)
const text = '我爱北京天安门';
const tokens = tokenizer.tokenize(text);
```

## API 参考

### `MultilingualTokenizer`

处理多语言文本处理的主要分词器类。

#### 构造函数

```typescript
import { MultilingualTokenizer, TokenizerOptions } from 'gs-tokenizer';

const tokenizer = new MultilingualTokenizer(options)
```

**选项**：
- `customDictionaries`: Record<string, LexiconEntry[]> - 每种语言的自定义词典
- `defaultLanguage`: string - 默认语言代码（默认：'en'）

#### 方法

| 方法 | 描述 |
|------|------|
| `tokenize(text: string): Token[]` | 对输入文本进行分词，返回详细的Token信息 |
| `tokenizeAll(text: string): Token[]` | 返回每个位置的所有可能tokens (仅core模块) |
| `tokenizeText(text: string): string[]` | 对输入文本进行分词，只返回单词Token |
| `tokenizeTextAll(text: string): string[]` | 返回每个位置的所有可能单词tokens (仅core模块) |
| `addCustomDictionary(words: string[], name: string, priority?: number, language?: string): void` | 向分词器添加自定义单词 |
| `removeCustomWord(word: string, language?: string, lexiconName?: string): void` | 从分词器中移除自定义单词 |
| `addStage(stage: ITokenizerStage): void` | 添加自定义分词阶段 (仅core模块) |

### `createTokenizer(options?: TokenizerOptions): MultilingualTokenizer`

创建一个新的MultilingualTokenizer实例的工厂函数，带有可选配置。

### 快速使用API

quick模块提供了便捷的静态方法：

```typescript
import { Token } from 'gs-tokenizer';

// 快速使用API类型定义
type QuickUseAPI = {
  // 分词文本
  tokenize: (text: string, language?: string) => Token[];
  // 仅分词为文本
  tokenizeText: (text: string, language?: string) => string[];
  // 添加自定义词典
    addCustomDictionary: (words: string[], name: string, priority?: number, language?: string) => void;
  // 删除自定义词语
  removeCustomWord: (word: string, language?: string, lexiconName?: string) => void;
  // 设置词典加载的默认语言
  setDefaultLanguages: (languages: string[]) => void;
  // 设置词典加载的默认类型
  setDefaultTypes: (types: string[]) => void;
};

// 导入快速使用API
import { tokenize, tokenizeText, addCustomDictionary, removeCustomWord, setDefaultLanguages, setDefaultTypes } from 'gs-tokenizer';
```

### 类型

#### `Token` 接口

```typescript
interface Token {
  txt: string;              // 分词文本内容
  type: 'word' | 'punctuation' | 'space' | 'other' | 'emoji' | 'date' | 'host' | 'ip' | 'number' | 'hashtag' | 'mention';
  lang?: string;            // 语言代码
  src?: string;             // 来源（例如：自定义词典名称）
}
```

### `ITokenizerStage` 接口 (仅core模块)

```typescript
interface ITokenizerStage {
  order: number;
  priority: number;
  tokenize(text: string, start: number): IStageBestResult;
  all(text: string): IToken[];
}
```

#### `TokenizerOptions` 接口

```typescript
import { LexiconEntry } from 'gs-tokenizer';

interface TokenizerOptions {
  customDictionaries?: Record<string, LexiconEntry[]>;
  granularity?: 'word' | 'grapheme' | 'sentence';
  defaultLanguage?: string;
}
```

## 浏览器兼容性

- Chrome/Edge: 87+
- Firefox: 86+
- Safari: 14.1+

注意：对CJK语言使用`Intl.Segmenter`，需要现代浏览器支持。

## 开发

### 构建

```bash
npm run build
```

### 运行测试

```bash
npm run test          # 运行所有测试
npm run test:base     # 运行基础测试
npm run test:english  # 运行英语特定测试
npm run test:cjk      # 运行CJK特定测试
npm run test:mixed    # 运行混合语言测试
```

## 许可证

MIT

[GitHub 仓库](https://github.com/grain-sand/gs-tokenizer)
