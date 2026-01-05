import {MultilingualTokenizer, createTokenizer, TokenizerOptions} from '../core';
import {LexiconLoader, SUPPORTED_TYPES, SUPPORTED_LANGUAGES, SupportedType, SupportedLanguage} from '../lexicon';

/**
 * 快速使用多语言分词器类，提供静态实例和便捷方法
 * @class QuickUseTokenizer
 */
export class QuickUseTokenizer {
	/** 静态分词器实例 */
	private static instance: MultilingualTokenizer | null = null;
	/** 默认加载的语言 */
	private static defaultLanguages: SupportedLanguage[] = Array.from(SUPPORTED_LANGUAGES);
	/** 默认加载的词库类型 */
	private static defaultTypes: SupportedType[] = Array.from(SUPPORTED_TYPES);

	/**
	 * 获取分词器实例（单例模式）
	 * @returns MultilingualTokenizer实例
	 */
	public static getInstance(): MultilingualTokenizer {
		if (!QuickUseTokenizer.instance) {
			const options: TokenizerOptions = {
				defaultLanguage: 'zh'
			};
			QuickUseTokenizer.instance = createTokenizer(options);

			// 使用LexiconLoader.loadTo方法加载默认词库
			LexiconLoader.loadTo(QuickUseTokenizer.instance, {
				types: QuickUseTokenizer.defaultTypes,
				languages: QuickUseTokenizer.defaultLanguages
			});
		}
		return QuickUseTokenizer.instance;
	}

	/**
	 * 设置默认加载的语言
	 * @param languages - 要加载的语言代码数组
	 */
	public static setDefaultLanguages(languages: SupportedLanguage[]): void {
		QuickUseTokenizer.defaultLanguages = languages;
		// 重置实例，以便下次获取时使用新配置
		QuickUseTokenizer.instance = null;
	}

	/**
	 * 设置默认加载的词库类型
	 * @param types - 要加载的词库类型数组
	 */
	public static setDefaultTypes(types: SupportedType[]): void {
		QuickUseTokenizer.defaultTypes = types;
		// 重置实例，以便下次获取时使用新配置
		QuickUseTokenizer.instance = null;
	}

	/**
	 * 分词方法
	 * @param text - 要分词的文本
	 * @param language - 可选，指定文本语言代码
	 * @returns 分词结果的Token数组
	 */
	public static tokenize(text: string, language?: string) {
		return QuickUseTokenizer.getInstance().tokenize(text, language);
	}

	/**
	 * 获取纯文本分词结果
	 * @param text - 要分词的文本
	 * @param language - 可选，指定文本语言代码
	 * @returns 单词数组
	 */
	public static tokenizeText(text: string, language?: string): string[] {
		return QuickUseTokenizer.getInstance().tokenizeText(text, {language});
	}

	/**
	 * 添加自定义词库
	 * @param words - 要添加的单词数组
	 * @param language - 词库对应的语言代码
	 * @param priority - 词库优先级
	 * @param name - 词库名称
	 */
	public static addCustomDictionary(words: string[], language: string, priority: number, name: string): void {
		QuickUseTokenizer.getInstance().addCustomDictionary(words, language, priority, name);
	}

	/**
	 * 移除自定义词库中的指定单词
	 * @param word - 要移除的单词
	 * @param language - 可选，指定要操作的语言词库
	 * @param lexiconName - 可选，指定要操作的词库名称
	 */
	public static removeCustomWord(word: string, language?: string, lexiconName?: string): void {
		QuickUseTokenizer.getInstance().removeCustomWord(word, language, lexiconName);
	}


}

// 导出便捷函数
export const tokenize = (text: string, language?: string) => QuickUseTokenizer.tokenize(text, language);
export const tokenizeToText = (text: string, language?: string) => QuickUseTokenizer.tokenizeText(text, language);
export const tokenizeText = (text: string, language?: string) => QuickUseTokenizer.getInstance().tokenizeText(text, {language});
export const addCustomDictionary = (words: string[], language: string, priority: number, name: string) =>
	QuickUseTokenizer.addCustomDictionary(words, language, priority, name);
export const removeCustomWord = (word: string, language?: string, lexiconName?: string) =>
	QuickUseTokenizer.removeCustomWord(word, language, lexiconName);
export const setDefaultLanguages = (languages: SupportedLanguage[]) => QuickUseTokenizer.setDefaultLanguages(languages);
export const setDefaultTypes = (types: SupportedType[]) => QuickUseTokenizer.setDefaultTypes(types);
