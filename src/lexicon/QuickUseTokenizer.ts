import {OldMultilingualTokenizer} from '../old';
import {IMultilingualTokenizer, SUPPORTED_LANGUAGES, SupportedLanguage} from '../type';
import {LexiconLoader, SUPPORTED_TYPES, SupportedType} from './LexiconLoader';

/**
 * 快速使用多语言分词器类，提供静态实例和便捷方法
 * @class QuickUseTokenizer
 */
export class QuickUseTokenizer {
	/** 静态分词器实例 */
	private static instance: IMultilingualTokenizer | null = null;
	/** 默认加载的语言 */
	private static defaultLanguages: SupportedLanguage[] = Array.from(SUPPORTED_LANGUAGES);
	/** 默认加载的词库类型 */
	private static defaultTypes: SupportedType[] = Array.from(SUPPORTED_TYPES);

	/**
	 * 获取分词器实例（单例模式）
	 * @returns IMultilingualTokenizer实例
	 */
	public static getInstance(): IMultilingualTokenizer {
		if (!QuickUseTokenizer.instance) {
			QuickUseTokenizer.instance = new OldMultilingualTokenizer();

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
	 * @returns 分词结果的Token数组
	 */
	public static tokenize(text: string) {
		return QuickUseTokenizer.getInstance().tokenize(text);
	}

	/**
	 * 获取纯文本分词结果
	 * @param text - 要分词的文本
	 * @returns 单词数组
	 */
	public static tokenizeText(text: string): string[] {
		return QuickUseTokenizer.getInstance().tokenizeText(text);
	}

	/**
	 * 添加自定义词库
	 * @param words - 要添加的单词数组
	 * @param name - 词库名称
	 * @param priority - 词库优先级，值越高优先级越高，默认比内置词库最高优先级大100
	 * @param language - 词库对应的语言代码，未指定时自动根据words判断
	 */
	public static addDictionary(words: string[], name: string, priority?: number, language?: string): void {
		QuickUseTokenizer.getInstance().addDictionary(words, name, priority, language as any);
	}

	/**
	 * 设置姓名词库
	 * @param nameLexicon - 姓名词库对象
	 * @param language - 语言代码
	 */
	public static setNameDictionary(nameLexicon: any, language: SupportedLanguage): void {
		QuickUseTokenizer.getInstance().setNameDictionary(nameLexicon, language);
	}
}

// 导出便捷函数
export const tokenize = (text: string) => QuickUseTokenizer.tokenize(text);
export const tokenizeText = (text: string) => QuickUseTokenizer.getInstance().tokenizeText(text);
export const addDictionary = (words: string[], name: string, priority?: number, language?: string) =>
	QuickUseTokenizer.addDictionary(words, name, priority, language as SupportedLanguage);
export const setNameDictionary = (nameLexicon: any, language: SupportedLanguage) =>
	QuickUseTokenizer.setNameDictionary(nameLexicon, language);
export const setDefaultLanguages = (languages: SupportedLanguage[]) => QuickUseTokenizer.setDefaultLanguages(languages);
export const setDefaultTypes = (types: SupportedType[]) => QuickUseTokenizer.setDefaultTypes(types);
