# gs-tokenizer

英語、中国語、日本語、韓国語など複数の言語に対応した強力で軽量な多言語トークナイザーライブラリです。

## ドキュメント

- [English README](README.md)
- [中文 README](README.cn.md)
- [日本語 README](README.ja.md)
- [한국어 README](README.ko.md)

## 特徴

- **言語サポート**: 英語、中国語、日本語、韓国語
- **インテリジェントなトークン化**:
  - 英語: 単語境界に基づくトークン化
  - CJK（中国語、日本語、韓国語）: ブラウザのIntl.Segmenterを使用した自然な単語分割
  - 日付: 日付パターンの特殊処理
  - 句読点: 連続した句読点は単一のトークンに結合
- **カスタム辞書**: 優先度と名前を持つカスタム単語の追加をサポート
- **自動言語検出**: 入力テキストの言語を自動的に検出
- **複数の出力形式**: 詳細なトークン情報または単語リストのみを取得
- **軽量**: 最小限の依存関係で、ブラウザ環境向けに設計
- **クイック使用API**: 簡単に統合できる便利な静的メソッド

## インストール

```bash
yarn add gs-tokenizer
```

### 代替インストール方法

```bash
npm install gs-tokenizer
```

## 使用方法

### クイック使用（推奨）

クイックモジュールは、簡単に統合できる便利な静的メソッドを提供します：

```javascript
import { tokenize, tokenizeToText, addCustomDictionary } from 'gs-tokenizer';

// インスタンスを作成せずに直接トークン化
const text = 'Hello world! 私は北京の天安門が好きです。';
const tokens = tokenize(text);
const words = tokenizeToText(text);
console.log(words);

// カスタム辞書を追加
addCustomDictionary(['人工知能', '技術'], 'zh', 10, 'tech');
```

### 高度な使用方法

#### クイックモジュールでカスタム辞書をロード

```javascript
import { tokenize, addCustomDictionary } from 'gs-tokenizer';

// 異なる言語用に複数のカスタム辞書をロード
addCustomDictionary(['人工知能', '機械学習'], 'zh', 10, 'tech');
addCustomDictionary(['Web3', 'Blockchain'], 'en', 10, 'crypto');
addCustomDictionary(['アーティフィシャル・インテリジェンス'], 'ja', 10, 'tech-ja');

// カスタム辞書を適用してトークン化
const text = '人工知能とWeb3は未来の重要な技術です。アーティフィシャル・インテリジェンスも重要です。';
const tokens = tokenize(text);
console.log(tokens.filter(token => token.src === 'tech'));
```

#### 組み込み辞書を使用しない

```javascript
import { MultilingualTokenizer } from 'gs-tokenizer';

// 組み込み辞書を使用しないトークナイザーを作成
const tokenizer = new MultilingualTokenizer({
  customDictionaries: {
    'ja': [{ priority: 10, data: new Set(['カスタム単語']), name: 'custom', lang: 'ja' }]
  }
});

// カスタム辞書のみを使用してトークン化
const text = 'これはカスタム単語の例です。';
const tokens = tokenizer.tokenize(text, 'ja');
console.log(tokens);
```

### カスタム辞書

```javascript
const tokenizer = new MultilingualTokenizer();

// 言語、優先度、名前を指定してカスタム単語を追加
okenizer.addCustomDictionary(['人工知能', '技術'], 'zh', 10, 'tech');
okenizer.addCustomDictionary(['Python', 'JavaScript'], 'en', 5, 'programming');

const text = '私は人工知能技術とPythonプログラミングが好きです';
const tokens = tokenizer.tokenize(text);
const words = tokenizer.tokenizeToText(text);
console.log(words); // '人工知能', 'Python' が含まれるはず

// カスタム単語を削除
okenizer.removeCustomWord('Python', 'en', 'programming');
```

### 高度なオプション

```javascript
const tokenizer = createTokenizer({
  defaultLanguage: 'ja',
  customDictionaries: {
    'ja': [{
      priority: 10,
      data: new Set(['カスタム単語']),
      name: 'custom',
      lang: 'ja'
    }]
  }
});

// 指定した言語でトークン化
const text = '私は北京の天安門が好きです';
const tokens = tokenizer.tokenize(text, 'zh');
```

## API リファレンス

### `MultilingualTokenizer`

多言語テキスト処理を処理する主要なトークナイザークラスです。

#### コンストラクタ

```typescript
import { MultilingualTokenizer, TokenizerOptions } from 'gs-tokenizer';

new MultilingualTokenizer(options?: TokenizerOptions)
```

**オプション**:
- `customDictionaries`: Record<string, LexiconEntry[]> - 各言語のカスタム辞書
- `defaultLanguage`: string - デフォルトの言語コード（デフォルト: 'en'）

#### メソッド

| メソッド | 説明 |
|------|------|
| `tokenize(text: string, language?: string): Token[]` | 入力テキストをトークン化し、詳細なトークン情報を返します |
| `tokenizeToText(text: string, language?: string): string[]` | 入力テキストをトークン化し、単語リストのみを返します |
| `addCustomDictionary(words: string[], language: string, priority: number, name: string): void` | トークナイザーにカスタム単語を追加します |
| `removeCustomWord(word: string, language?: string, lexiconName?: string): void` | トークナイザーからカスタム単語を削除します |

### `createTokenizer(options?: TokenizerOptions): MultilingualTokenizer`

オプションの設定で新しいMultilingualTokenizerインスタンスを作成するファクトリー関数です。

### クイック使用API

クイックモジュールは便利な静的メソッドを提供します：

```typescript
import { Token } from 'gs-tokenizer';

// テキストをトークン化
function tokenize(text: string, language?: string): Token[];

// テキストのみをトークン化
function tokenizeToText(text: string, language?: string): string[];

// カスタム辞書を追加
function addCustomDictionary(words: string[], language: string, priority: number, name: string): void;

// カスタム単語を削除
function removeCustomWord(word: string, language?: string, lexiconName?: string): void;

// 辞書ロードのデフォルト言語を設定
function setDefaultLanguages(languages: string[]): void;

// 辞書ロードのデフォルトタイプを設定
function setDefaultTypes(types: string[]): void;
```

### 型

#### `Token` インターフェース

```typescript
interface Token {
  txt: string;              // トークンテキスト内容
  type: 'word' | 'punctuation' | 'space' | 'other' | 'emoji' | 'date';
  lang?: string;            // 言語コード
  src?: string;             // ソース（例：カスタム辞書名）
}
```

#### `TokenizerOptions` インターフェース

```typescript
import { LexiconEntry } from 'gs-tokenizer';

interface TokenizerOptions {
  customDictionaries?: Record<string, LexiconEntry[]>;
  granularity?: 'word' | 'grapheme' | 'sentence';
  defaultLanguage?: string;
}
```

## ブラウザ互換性

- Chrome/Edge: 87+
- Firefox: 86+
- Safari: 14.1+

注：CJK言語には`Intl.Segmenter`を使用しているため、現代のブラウザーのサポートが必要です。

## 開発

### ビルド

```bash
npm run build
```

### テストの実行

```bash
npm run test          # すべてのテストを実行
npm run test:base     # 基本テストを実行
npm run test:english  # 英語固有のテストを実行
npm run test:cjk      # CJK固有のテストを実行
npm run test:mixed    # 混合言語のテストを実行
```

## ライセンス

MIT

[GitHub Repository](https://github.com/grain-sand/gs-tokenizer)
