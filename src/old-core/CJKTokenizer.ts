import {ILanguageTokenizer} from './ILanguageTokenizer';
import {IToken, ILexiconEntry} from '../old-type';

/**
 * CJK分词器类，实现ILanguageTokenizer接口，用于处理中文、日文和韩文等CJK语言的文本分词
 * @class CJKTokenizer
 * @implements {ILanguageTokenizer}
 */
export class CJKTokenizer implements ILanguageTokenizer {
	/** 分词器实例映射，键为语言代码和粒度的组合 */
	private segmenters: Map<string, Intl.Segmenter>;
	/** 自定义词库，键为语言代码，值为该语言的词库条目数组 */
	private dictionaries: Record<string, ILexiconEntry[]>;

	/**
	 * 构造函数
	 * @param dictionaries - 自定义词库，默认为空对象
	 */
	constructor(dictionaries: Record<string, ILexiconEntry[]> = {}) {
		this.segmenters = new Map();
		this.dictionaries = dictionaries;
	}

	/**
	 * 检测文本的语言是否为中文、日文或韩文
	 * @param text - 要检测语言的文本
	 * @returns 如果是中文返回'zh'，日文返回'ja'，韩文返回'ko'，否则返回空字符串
	 */
	detectLanguage(text: string): string {
		// 检查是否包含中文、日文或韩文
		if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
		if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
		if (/[\uac00-\ud7af]/.test(text)) return 'ko';
		return '';
	}

	/**
	 * 对CJK文本进行分词
	 * @param text - 要分词的CJK文本
	 * @param language - 指定的语言代码（'zh'、'ja'或'ko'）
	 * @returns 分词结果的Token数组
	 */
	tokenize(text: string, language: string): IToken[] {
		const tokens: IToken[] = [];
		const segmenter = this.getSegmenter(language);

		for (const segment of segmenter.segment(text)) {
			const {segment: segText, isWordLike} = segment;

			if (segText.match(/^\s+$/)) {
				tokens.push({txt: segText, type: 'space', lang: language, src: ''});
			} else if (/^\p{Emoji}+$/u.test(segText) && !/[0-9#]/.test(segText)) {
				tokens.push({txt: segText, type: 'emoji', lang: language, src: ''});
			} else if (segText.match(/^[^\p{L}\p{N}]+$/u)) {
				tokens.push({txt: segText, type: 'punctuation', lang: language, src: ''});
			} else if (isWordLike) {
				tokens.push({txt: segText, type: 'word', lang: language, src: ''});
			} else {
				tokens.push({txt: segText, type: 'other', lang: language, src: ''});
			}
		}

		// 应用自定义词库合并分词结果
		return this.applyCustomDictionary(tokens, language);
	}

	private getSegmenter(language: string, granularity: 'word' | 'grapheme' | 'sentence' = 'word'): Intl.Segmenter {
		const key = `${language}-${granularity}`;
		if (!this.segmenters.has(key)) {
			this.segmenters.set(key, new Intl.Segmenter(language, {granularity}));
		}
		return this.segmenters.get(key)!;
	}


	private applyCustomDictionary(tokens: IToken[], language: string): IToken[] {
		const customLexicons: ILexiconEntry[] = this.dictionaries[language] || [];
		let processedTokens = tokens;

		// 如果有自定义词库，先合并
		if (customLexicons.length > 0) {
			const mergedTokens: IToken[] = [];
			let i = 0;

			while (i < processedTokens.length) {
				let matched = false;
				let bestMatch: { length: number; text: string } | null = null;
				let bestPriority = -1;

				// 尝试匹配最长的自定义词
					for (let j = Math.min(5, processedTokens.length - i); j >= 1; j--) {
						// 允许数字和字母组合作为自定义词（去掉对非word类型的过滤）
						// if (j > 1 && processedTokens.slice(i, i + j).some(t => t.type !== 'word')) {
						// 	continue;
						// }

						const candidate = processedTokens.slice(i, i + j)
							.map(token => token.txt)
							.join('');

						// 查找是否有词库包含该候选词
						for (const lexicon of customLexicons) {
							if (lexicon.data.has(candidate)) {
								// 如果找到匹配词
								if (!bestMatch || j > bestMatch.length ||
								   (j === bestMatch.length && lexicon.priority > bestPriority)) {
									// 优先选择更长的词，或者相同长度下优先级更高的词
									bestMatch = { length: j, text: candidate };
									bestPriority = lexicon.priority;
								}
								// 继续检查是否有更高优先级的词库包含相同词
							}
						}
					}

				if (bestMatch) {
					// 有最佳匹配词
					mergedTokens.push({
						txt: bestMatch.text,
						type: 'word',
						lang: language,
						src: ''
					});
					i += bestMatch.length;
					matched = true;
				} else {
					// 没有匹配词，使用原始token
					mergedTokens.push({
						...processedTokens[i],
						src: ''
					});
					i++;
				}
			}

			processedTokens = mergedTokens;
		}

		// 直接返回处理后的tokens，不再进行词库标记
		return processedTokens;
	}
}
