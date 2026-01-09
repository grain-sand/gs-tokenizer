export const SUPPORTED_LANGUAGES = [
	'zh',
	'zh-CN',
	'zh-TW',
	'en',
	'ja',
	'ko'
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
