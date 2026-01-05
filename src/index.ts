// 从quick模块导出便捷使用功能
export { QuickUseTokenizer } from './quick';
export { tokenize, tokenizeText, addCustomDictionary, removeCustomWord, setDefaultLanguages, setDefaultTypes } from './quick';

// 从lexicon模块导出词库相关功能和配置
export { SUPPORTED_LANGUAGES, SUPPORTED_TYPES } from './lexicon';
export type { SupportedLanguage, SupportedType, LexiconConfig } from './lexicon';
export { LexiconLoader } from './lexicon';

// 从core模块导出核心功能和类型
export type { TokenizerOptions, Token, LexiconEntry, TokenizeTextOptions } from './core';
export { createTokenizer, MultilingualTokenizer } from './core';
