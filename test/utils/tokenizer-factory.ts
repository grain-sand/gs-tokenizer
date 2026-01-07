import { IMultilingualTokenizer, MultilingualTokenizer, OldMultilingualTokenizer, LexiconLoader } from '../../src';

// 缓存分词器实例
const tokenizerCache: Record<string, IMultilingualTokenizer> = {};

/**
 * 分词器测试工厂
 * 根据环境变量和参数创建不同的分词器实例
 * @param options - 工厂配置选项
 */
export function createTokenizer(options?: {
  type?: 'core' | 'old-core'; // 支持'core'和'old-core'类型
  loadBuiltinLexicons?: boolean;
}): IMultilingualTokenizer {
  // 从环境变量获取配置，默认使用'old-core'
  const tokenizerType = options?.type || process.env.TOKENIZER_TYPE || 'old-core';
  const loadBuiltinLexicons = options?.loadBuiltinLexicons ?? true;

  console.log(`Creating tokenizer: type=${tokenizerType}, loadBuiltinLexicons=${loadBuiltinLexicons}`);

  // 创建相应类型的分词器
  let tokenizer: IMultilingualTokenizer;
  if (tokenizerType === 'core') {
    tokenizer = new MultilingualTokenizer();
  } else {
    tokenizer = new OldMultilingualTokenizer();
  }

  // 如果需要加载内置词库，使用LexiconLoader.loadTo()方法
  if (loadBuiltinLexicons) {
    LexiconLoader.loadTo(tokenizer);
  }

  return tokenizer;
}

/**
 * 获取缓存的分词器实例
 * 如果不存在对应配置的实例，则创建并缓存
 * @param options - 工厂配置选项
 */
export function getCachedTokenizer(options?: {
  type?: 'core' | 'old-core'; // 支持'core'和'old-core'类型
  loadBuiltinLexicons?: boolean;
}): IMultilingualTokenizer {
  // 从环境变量获取配置，默认使用'old-core'
  const tokenizerType = options?.type || process.env.TOKENIZER_TYPE || 'old-core';
  const loadBuiltinLexicons = options?.loadBuiltinLexicons ?? true;

  // 生成缓存键
  const cacheKey = `${tokenizerType}_${loadBuiltinLexicons}`;

  // 如果缓存中存在实例，直接返回
  if (tokenizerCache[cacheKey]) {
    return tokenizerCache[cacheKey];
  }

  // 否则创建新实例并缓存
  const tokenizer = createTokenizer(options);
  tokenizerCache[cacheKey] = tokenizer;
  return tokenizer;
}

/**
 * 清除所有缓存的分词器实例
 */
export function clearTokenizerCache(): void {
  Object.keys(tokenizerCache).forEach(key => delete tokenizerCache[key]);
}
