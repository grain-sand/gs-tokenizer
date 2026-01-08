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
- **tokenizeAll**: coreモジュールの新機能で、各位置の全ての可能なトークンを返します

## モジュール比較

| モジュール | 安定性 | 速度 | トークン化精度 | 新機能 |
|----------|--------|------|----------------|--------|
| old-core | ✅ より安定 | ⚡️ より遅い | ✅ より正確 | ❌ 新機能なし |
| core | ⚠️ 安定性が低い | ⚡️ より速い | ⚠️ 精度が低い可能性あり | ✅ tokenizeAll、ステージベースのアーキテクチャ |

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
import { tokenize, tokenizeText, addCustomDictionary } from 'gs-tokenizer';

// インスタンスを作成せずに直接トークン化
const text = 'Hello world! 私は北京の天安門が好きです。';
const tokens = tokenize(text);
const words = tokenizeText(text);
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
const tokenizer = new OldMultilingualTokenizer();

// 言語、優先度、名前を指定してカスタム単語を追加
tokenizer.addCustomDictionary(['人工知能', '技術'], 'zh', 10, 'tech');
tokenizer.addCustomDictionary(['Python', 'JavaScript'], 'en', 5, 'programming');

const text = '私は人工知能技術とPythonプログラミングが好きです';
const tokens = tokenizer.tokenize(text);
const words = tokenizer.tokenizeText(text);
console.log(words); // '人工知能', 'Python' が含まれるはず

// カスタム単語を削除
okenizer.removeCustomWord('Python', 'en', 'programming');
```

### 高度なオプション

```javascript
import { MultilingualTokenizer } from 'gs-tokenizer';

const tokenizer = new MultilingualTokenizer();

// テキストをトークン化
const text = '私は北京の天安門が好きです';
const tokens = tokenizer.tokenize(text);

// 全ての可能なトークンを取得 (coreモジュールのみ)
const allTokens = tokenizer.tokenizeAll(text);
```

### Old-Coreモジュールの使用

```javascript
import { OldMultilingualTokenizer } from 'gs-tokenizer/old-core';

const tokenizer = new OldMultilingualTokenizer();

// テキストをトークン化 (old-coreはより安定だが速度が遅い)
const text = '私は北京の天安門が好きです';
const tokens = tokenizer.tokenize(text);
```

## API リファレンス

### `MultilingualTokenizer`

多言語テキスト処理を処理する主要なトークナイザークラスです。

#### コンストラクタ

```typescript
import { MultilingualTokenizer, TokenizerOptions } from 'gs-tokenizer';

const tokenizer = new MultilingualTokenizer(options)
```

**オプション**:
- `customDictionaries`: Record<string, LexiconEntry[]> - 各言語のカスタム辞書
- `defaultLanguage`: string - デフォルトの言語コード（デフォルト: 'en'）

#### メソッド

| メソッド | 説明 |
|------|------|
| `tokenize(text: string): Token[]` | 入力テキストをトークン化し、詳細なトークン情報を返します |
| `tokenizeAll(text: string): Token[]` | 各位置の全ての可能なトークンを返します (coreモジュールのみ) |
| `tokenizeText(text: string): string[]` | 入力テキストをトークン化し、単語リストのみを返します |
| `tokenizeTextAll(text: string): string[]` | 各位置の全ての可能な単語トークンを返します (coreモジュールのみ) |
| `addCustomDictionary(words: string[], name: string, priority?: number, language?: string): void` | トークナイザーにカスタム単語を追加します |
| `removeCustomWord(word: string, language?: string, lexiconName?: string): void` | トークナイザーからカスタム単語を削除します |
| `addStage(stage: ITokenizerStage): void` | カスタムトークン化ステージを追加します (coreモジュールのみ) |

### `createTokenizer(options?: TokenizerOptions): MultilingualTokenizer`

オプションの設定で新しいMultilingualTokenizerインスタンスを作成するファクトリー関数です。

### クイック使用API

クイックモジュールは便利な静的メソッドを提供します：

```typescript
import { Token } from 'gs-tokenizer';

// クイック使用APIタイプ定義
type QuickUseAPI = {
  // テキストをトークン化
  tokenize: (text: string, language?: string) => Token[];
  // テキストのみをトークン化
  tokenizeText: (text: string, language?: string) => string[];
  // カスタム辞書を追加
    addCustomDictionary: (words: string[], name: string, priority?: number, language?: string) => void;
  // カスタム単語を削除
  removeCustomWord: (word: string, language?: string, lexiconName?: string) => void;
  // 辞書ロードのデフォルト言語を設定
  setDefaultLanguages: (languages: string[]) => void;
  // 辞書ロードのデフォルトタイプを設定
  setDefaultTypes: (types: string[]) => void;
};

// クイック使用APIをインポート
import { tokenize, tokenizeText, addCustomDictionary, removeCustomWord, setDefaultLanguages, setDefaultTypes } from 'gs-tokenizer';
```

### 型

#### `Token` インターフェース

```typescript
interface Token {
  txt: string;              // Tokenテキストコンテンツ
  type: 'word' | 'punctuation' | 'space' | 'other' | 'emoji' | 'date' | 'host' | 'ip' | 'number' | 'hashtag' | 'mention';
  lang?: string;            // 言語コード
  src?: string;             // ソース（例：カスタム辞書名）
}
```

### `ITokenizerStage` インターフェース (coreモジュールのみ)

```typescript
interface ITokenizerStage {
  order: number;
  priority: number;
  tokenize(text: string, start: number): IStageBestResult;
  all(text: string): IToken[];
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
