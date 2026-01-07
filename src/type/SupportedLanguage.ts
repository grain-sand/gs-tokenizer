/**
 * 支持的语言常量和类型定义
 */
export const SUPPORTED_LANGUAGES = [
	'zh',
	'zh-CN',
	'zh-TW',
	'en',
	'ja',
	'ko'
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
