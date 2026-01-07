import {IToken, IMultilingualTokenizer, INameLexiconGroup, SupportedLanguage, IWordIndex} from '../type';
import {ILanguageTokenizer} from './ILanguageTokenizer';
import {EnglishTokenizer} from './EnglishTokenizer';
import {CJKTokenizer} from './CJKTokenizer';
import {DateTokenizer} from './DateTokenizer';
import {HostIPTokenizer} from './URLIPTokenizer';
import {SocialTokenizer} from './SocialTokenizer';
import {NumberTokenizer} from './NumberTokenizer';
import {LanguageDetector} from './LanguageDetector';
import {ILexiconEntry} from './CJKTokenizer';
import {ITokenizerOptions} from './ITokenizerOptions';

/**
 * 多语言分词器类，支持中英文、日语、韩语等多种语言的文本分词
 * @class OldMultilingualTokenizer
 */
export class OldMultilingualTokenizer implements IMultilingualTokenizer {
	readonly wordIndex: IWordIndex = {} as any;
	/** 语言分词器数组 */
	private tokenizers: ILanguageTokenizer[];
	/**
	 * 自定义词库，键为语言代码，值为该语言的词库条目数组
	 */
	private dictionaries: Record<string, ILexiconEntry[]>;
	/** 默认语言代码 */
	private defaultLanguage;
	/**
	 * 姓名词库，键为语言代码，值为该语言的姓名词库组
	 */
	private nameDictionaries: Record<string, any>;

	/**
	 * 构造函数
	 * @param options - 分词器配置选项
	 */
	constructor(options: ITokenizerOptions = {}) {
		this.dictionaries = options.dictionaries || {};
		this.defaultLanguage = options.defaultLanguage || 'en';
		this.nameDictionaries = {};

		// 初始化tokenizers
		this.tokenizers = [
			new DateTokenizer(),
			new HostIPTokenizer(),
			new SocialTokenizer(),
			new NumberTokenizer(),
			new EnglishTokenizer(),
			new CJKTokenizer(this.dictionaries)
		];
	}

	/**
	 * 获取当前已加载的所有词库名称
	 * @returns 词库名称数组
	 */
	get loadedLexiconNames(): string[] {
		const lexiconNames = new Set<string>();

		// 遍历所有语言的自定义词库
		for (const lang in this.dictionaries) {
			if (Object.prototype.hasOwnProperty.call(this.dictionaries, lang)) {
				const lexicons = this.dictionaries[lang];
				lexicons.forEach(lexicon => {
					lexiconNames.add(lexicon.name);
				});
			}
		}

		// 收集所有姓名词库名称
		Object.keys(this.nameDictionaries).forEach(language => {
			lexiconNames.add(`name-dictionary-${language}`);
		});

		return Array.from(lexiconNames);
	}

	/**
	 * 添加自定义词库
	 * @param words - 要添加的单词数组
	 * @param name - 词库名称，用于标识和管理词库
	 * @param priority - 词库优先级，值越高优先级越高，默认比内置词库最高优先级大100
	 * @param language - 词库对应的语言代码，未指定时自动根据words判断
	 */
	addDictionary(words: string[], name: string, priority?: number, language?: SupportedLanguage): void {
		// priority 默认值设为 200（内置词库最高优先级是 100）
		const actualPriority = priority !== undefined ? priority : 200;

		// language 未指定时，自动根据 words 判断语言
		let actualLanguage = language;
		if (!actualLanguage && words.length > 0) {
			// 使用第一个非空单词进行语言检测
			const sampleWord = words.find(word => word.trim() !== '') || '';
			actualLanguage = LanguageDetector.detectLanguage(sampleWord) as any;
		}
		const lang = actualLanguage || this.defaultLanguage;

		if (!this.dictionaries[lang]) {
			this.dictionaries[lang] = [];
		}

		const existingIndex = this.dictionaries[lang].findIndex(entry =>
			entry.name === name && entry.lang === lang && entry.priority === actualPriority
		);

		if (existingIndex >= 0) {
			const existingEntry = this.dictionaries[lang][existingIndex];
			words.forEach(word => existingEntry.data.add(word));
		} else {
			this.dictionaries[lang].push({
				priority: actualPriority,
				data: new Set(words),
				name,
				lang
			});
		}

		// 更新CJKTokenizer实例中的dictionaries
		const cjkTokenizer = this.tokenizers.find(t => t instanceof CJKTokenizer);
		if (cjkTokenizer) {
			(cjkTokenizer as any).dictionaries = this.dictionaries;
		}
	}

	/**
	 * 主分词方法，对输入文本进行多语言分词
	 * @param text - 要分词的文本
	 * @returns 分词结果的Token数组
	 */
	tokenize(text: string): IToken[] {
		const lang = LanguageDetector.detectLanguage(text);

		// 1. 首先使用日期分词器处理所有日期格式
		const dateTokenizer = this.tokenizers.find(t => t instanceof DateTokenizer);
		if (!dateTokenizer) return [];

		const dateTokens = dateTokenizer.tokenize(text, lang);
		const finalTokens: IToken[] = [];

		// 2. 对非日期部分使用URLIP分词器处理
		const urlIpTokenizer = this.tokenizers.find(t => t instanceof HostIPTokenizer);
		if (!urlIpTokenizer) return finalTokens;

		for (const token of dateTokens) {
			if (token.type === 'date') {
				finalTokens.push(token);
			} else {
				const urlIpTokens = urlIpTokenizer.tokenize(token.txt, lang);

				// 3. 对非URL和非IP部分使用社交媒体分词器处理
				const socialTokenizer = this.tokenizers.find(t => t instanceof SocialTokenizer);
				if (!socialTokenizer) return finalTokens;

				for (const urlIpToken of urlIpTokens) {
					if (urlIpToken.type === 'host' || urlIpToken.type === 'ip') {
						finalTokens.push(urlIpToken);
					} else {
						const socialTokens = socialTokenizer.tokenize(urlIpToken.txt, lang);

						// 4. 对非社交媒体部分使用数字分词器处理
						const numberTokenizer = this.tokenizers.find(t => t instanceof NumberTokenizer);
						if (!numberTokenizer) return finalTokens;

						for (const socialToken of socialTokens) {
							if (socialToken.type === 'hashtag' || socialToken.type === 'mention') {
								finalTokens.push(socialToken);
							} else {
								const numberTokens = numberTokenizer.tokenize(socialToken.txt, lang);

								// 5. 对非数字部分使用相应的语言分词器处理
								for (const numberToken of numberTokens) {
									if (numberToken.type === 'number') {
										finalTokens.push(numberToken);
									} else {
										let subTokens: IToken[] = [];

										if (lang === 'en') {
											const englishTokenizer = this.tokenizers.find(t => t instanceof EnglishTokenizer);
											if (englishTokenizer) {
												subTokens = (englishTokenizer as any).tokenize(numberToken.txt, lang);
											}
										} else if (['zh', 'ja', 'ko'].includes(lang)) {
											// 处理混合语言：中文句子中的英文单词和数字+字母组合（如Q弹、5G）
											const mixedText = numberToken.txt;

											// 优先使用CJKTokenizer处理整个混合文本（包含自定义词库中的词）
											const cjkTokenizer = this.tokenizers.find(t => t instanceof CJKTokenizer);
											if (cjkTokenizer) {
												const cjkTokens = (cjkTokenizer as any).tokenize(mixedText, lang);
												if (cjkTokens.length > 0) {
													// 如果CJKTokenizer成功处理，则使用其结果
													subTokens = cjkTokens;
												} else {
													// 否则使用原有的混合语言处理逻辑
													const tokens: IToken[] = [];
													let lastIndex = 0;

													// 使用正则表达式匹配英文单词和数字+字母组合
													const regex = /[a-zA-Z0-9]+[a-zA-Z0-9_-]*|[a-zA-Z0-9]|[a-zA-Z]+/g;
													let match;

													while ((match = regex.exec(mixedText)) !== null) {
														// 处理匹配部分之前的文本（中文）
														if (match.index > lastIndex) {
															const chineseText = mixedText.substring(lastIndex, match.index);
															const chineseTokens = (cjkTokenizer as any).tokenize(chineseText, lang);
															tokens.push(...chineseTokens);
														}

														// 处理匹配到的英文或数字+字母组合
														const englishText = match[0];
														const englishTokenizer = this.tokenizers.find(t => t instanceof EnglishTokenizer);
														if (englishTokenizer) {
															const englishTokens = (englishTokenizer as any).tokenize(englishText, 'en');
															tokens.push(...englishTokens);
														}

														lastIndex = match.index + match[0].length;
													}

													// 处理剩余的中文文本
													if (lastIndex < mixedText.length) {
														const chineseText = mixedText.substring(lastIndex);
														const chineseTokens = (cjkTokenizer as any).tokenize(chineseText, lang);
														tokens.push(...chineseTokens);
													}

													subTokens = tokens;
												}
											}
										} else {
											const cjkTokenizer = this.tokenizers.find(t => t instanceof CJKTokenizer);
											if (cjkTokenizer) {
												subTokens = (cjkTokenizer as any).tokenize(numberToken.txt, lang);
											}
										}

										if (subTokens.length > 0) {
											finalTokens.push(...subTokens);
										} else {
											finalTokens.push(numberToken);
										}
									}
								}
							}
						}
					}
				}
			}
		}

		// 合并连续的token（符号和emoji）
		const mergedTokens: IToken[] = [];
		let currentPunctuation: IToken | null = null;
		let currentEmoji: IToken | null = null;

		for (const token of finalTokens) {
			if (token.type === 'punctuation') {
				// 处理当前符号token
				if (currentPunctuation) {
					// 合并连续的符号
					currentPunctuation.txt += token.txt;
				} else {
					// 开始新的符号序列
					currentPunctuation = {...token};
				}
				// 处理可能存在的前一个emoji序列
				if (currentEmoji) {
					mergedTokens.push(currentEmoji);
					currentEmoji = null;
				}
			} else if (token.type === 'emoji') {
				// 处理当前emoji token
				if (currentEmoji) {
					// 合并连续的emoji
					currentEmoji.txt += token.txt;
				} else {
					// 开始新的emoji序列
					currentEmoji = {...token};
				}
				// 处理可能存在的前一个符号序列
				if (currentPunctuation) {
					mergedTokens.push(currentPunctuation);
					currentPunctuation = null;
				}
			} else {
				// 处理非符号和非emoji token
				// 处理可能存在的前一个符号序列
				if (currentPunctuation) {
					mergedTokens.push(currentPunctuation);
					currentPunctuation = null;
				}
				// 处理可能存在的前一个emoji序列
				if (currentEmoji) {
					mergedTokens.push(currentEmoji);
					currentEmoji = null;
				}
				// 添加当前非符号和非emoji token
				mergedTokens.push(token);
			}
		}

		// 添加最后可能的合并符号或emoji
		if (currentPunctuation) {
			mergedTokens.push(currentPunctuation);
		}
		if (currentEmoji) {
			mergedTokens.push(currentEmoji);
		}

		return mergedTokens;
	}

	/**
	 * 获取纯文本分词结果，可自定义包含或排除的token类型
	 * @param text - 要分词的文本
	 * @returns 文本数组
	 */
	tokenizeText(text: string): string[] {
		const tokens = this.tokenize(text);

		// 默认排除空格和其他类型
		const defaultExcludeTypes: IToken['type'][] = ['space'];

		// 合并默认排除类型和用户指定的排除类型
		const excludeTypes = [
			...defaultExcludeTypes,
		];

		return tokens.filter(token => {
			// 检查是否在排除类型列表中
			if (excludeTypes.includes(token.type)) {
				return false;
			}

			// 排除单个的符号，但保留多个连续符号
			if (token.type === 'punctuation') {
				// 移除所有空格
				const trimmedPunctuation = token.txt.replace(/\s/g, '');
				// 如果移除空格后只有一个符号，则排除
				if (trimmedPunctuation.length <= 1) {
					return false;
				}
			}

			return true;
		}).map(token => token.txt);
	}

	/**
	 * 设置姓名词库
	 * - 一旦设置即启用姓名分词 stage
	 * - 未设置则不加载姓名处理流程
	 */
	setNameDictionary(nameLexicon: INameLexiconGroup, language: SupportedLanguage): void {
		this.nameDictionaries[language] = nameLexicon;

		// 将姓名词库适配到 addDictionary
		if (nameLexicon?.lastName) {
			this.addDictionary(nameLexicon.lastName, `name-lastname-${language}`, 300, language);
		}
		if (nameLexicon?.firstName) {
			this.addDictionary(nameLexicon.firstName, `name-firstname-${language}`, 300, language);
		}
		if (nameLexicon?.title) {
			this.addDictionary(nameLexicon.title, `name-title-${language}`, 250, language);
		}
	}

	/**
	 * 添加自定义分词Stage
	 */
	addStage(stage: any): void {
		// 空实现
	}

	/**
	 * 移除指定Stage
	 */
	removeStage(stageId: string): void {
		// 空实现
	}

	/**
	 * 提取文本中的关键信息
	 */
	tokenizeAll(text: string): IToken[] {
		// 空实现，返回默认值
		return this.tokenize(text);
	}

	/**
	 * 提取纯文本关键信息
	 */
	tokenizeTextAll(text: string): string[] {
		// 空实现，返回默认值
		return this.tokenizeText(text);
	}


}
