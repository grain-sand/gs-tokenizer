import {
	DefaultTokenizerOption,
	IMultilingualTokenizer,
	INameLexiconGroup,
	IRange,
	ISpanToken,
	IToken, ITokenizerOption,
	ITokenizerStage,
	SupportedLanguage,
	TokenType,
} from "../type";
import {FirstCharWordIndex} from "./FirstCharWordIndex";
import {DictionaryStage} from "./DictionaryStage";
import {NameCnStage} from "./Name/NameCnStage";
import {NameJkStage} from "./Name/NameJkStage";
import {NameOtherStage} from "./Name/NameOtherStage";
import {NumberStage} from "./RegexArray/NumberStage";
import {SpaceStage} from "./RegexArray/SpaceStage";
import {PunctuationStage} from "./RegexArray/PunctuationStage";
import {SocialStage} from "./SocialStage";
import {EmailStage} from "./EmailStage";
import {DateStage} from "./RegexArray/DateStage";
import {UrlStage} from "./RegexArray/UrlStage";
import {IpStage} from "./RegexArray/IpStage";
import {tokenText} from "./util/tokenText";


export class MultilingualTokenizer implements IMultilingualTokenizer {

	readonly wordIndex = new FirstCharWordIndex();
	#stages: ITokenizerStage[] = [];
	#lexiconNames = new Set<string>();
	#nameLexiconNames: string[] = [];

	#urlStage?: UrlStage;

	#nativeSegmenter =
		typeof Intl !== 'undefined' && 'Segmenter' in Intl
			? new Intl.Segmenter('und', {granularity: 'word'})
			: null;

	#option!: Required<ITokenizerOption>;

	constructor(option?: ITokenizerOption) {
		this.initialize({...DefaultTokenizerOption, ...option});
	}

	get loadedLexiconNames(): string[] {
		return [...this.#lexiconNames];
	}

	get loadedNameLexiconNames(): string[] {
		return this.#nameLexiconNames;
	}

	initialize(option?: ITokenizerOption): void {
		option = this.#option = {...DefaultTokenizerOption, ...this.#option, ...option};
		if (this.#urlStage) {
			this.#urlStage.setOption(this.#option);
			return;
		}
		this.addStage(new DictionaryStage());
		this.addStage(new SocialStage());
		this.addStage(new EmailStage());
		this.addStage(this.#urlStage = new UrlStage(option));
		this.addStage(new IpStage());
		this.addStage(new DateStage());
		this.addStage(new NumberStage());
		this.addStage(new PunctuationStage());
		this.addStage(new SpaceStage());
	}

	addDictionary(
		words: string[],
		name: string,
		priority = 0,
		language?: SupportedLanguage
	) {
		this.#lexiconNames.add(name);
		// 直接使用addBatch确保批量添加的原子性
		this.wordIndex.addBatch(
			words.map(w => ({word: w, meta: {name, priority, lang: language}}))
		);
	}

	setNameDictionary(group: INameLexiconGroup, language: SupportedLanguage) {
		this.#nameLexiconNames.push(language);
		if (/^zh/i.test(language)) {
			this.addStage(new NameCnStage(group, language));
		} else if (/^(ko|jp)/i.test(language)) {
			this.addStage(new NameJkStage(group, language));
		} else {
			this.addStage(new NameOtherStage(group, language));
		}
	}

	addStage(stage: ITokenizerStage) {
		this.#stages.push(stage);
		this.#stages.sort(
			(a, b) => a.order - b.order || b.priority - a.priority
		);
		stage.initialize?.(this);
	}

	tokenize(text: string): ISpanToken[] {

		const tokens: ISpanToken[] = [];
		const len = text.length;

		let pos = 0;

		while (pos < len) {
			let advanced = false;

			for (const stage of this.#stages) {
				const r = stage.best(text, pos);
				if (!r.tokens.length) continue;

				for (const t of r.tokens) {
					tokens.push({
						...t,
						start: pos,
						end: r.unprocessedStart
					});
				}

				pos = r.unprocessedStart;
				advanced = true;
				break;
			}

			if (!advanced) {
				pos++;
			}
		}

		// 🔧 用 span 补齐所有被跳过的区间
		let result = this.#filTokenizeGapsWithNative(text, tokens);

		// 应用 ITokenizerOption 逻辑
		result = this.#applyTokenizerOptions(result) as ISpanToken[];

		return result;
	}

	tokenizeAll(text: string): IToken[] {

		let pos = 0;
		const rangeTokens: [IRange, IToken[]][] = [];
		const lastMap = new Map<ITokenizerStage, number>();
		let processedPos = 0;

		while (pos < text.length) {
			const substr = text.slice(pos);
			const tokens: IToken[] = [];
			let skip = 1;
			for (const stage of this.#stages) {

				if (
					processedPos > pos && stage.unprocessedOnly
					|| stage.skipOwnLastMax && pos < lastMap.get(stage)!
				) {
					continue;
				}

				const result = stage.all(substr);
				if (!result.end) continue;

				tokens.push(...result.tokens);
				let last = result.end;
				processedPos = Math.max(processedPos, pos + last);
				if (stage.skipOwnLastMax) {
					lastMap.set(stage, pos + last);
				}

				if (stage.breakIfProcessed) {
					skip = last;
					break;
				}

			}
			if (tokens.length) {
				const range = {start: pos, end: processedPos};
				rangeTokens.push([range, tokens]);
			}
			pos += skip;
		}
		// 应用 ITokenizerOption 逻辑
		let result = this.#filTokenizeAllGapsWithNative(text, rangeTokens);
		result = this.#applyTokenizerOptions(result);
		return result;
	}

	tokenizeText(text: string, exclude?: TokenType[]): string[] {
		return tokenText(this.tokenize(text), exclude);
	}

	tokenizeTextAll(text: string, exclude?: TokenType[]): string[] {
		return tokenText(this.tokenizeAll(text), exclude);
	}

	#applyTokenizerOptions(tokens: (IToken | ISpanToken)[]): (IToken | ISpanToken)[] {
		const {minTokenLength, cjkTokenLengthLimit,enTokenLengthLimit} = this.#option;
		const hasMinLengthCheck = minTokenLength > 0;
		const hasCJKLengthLimit = cjkTokenLengthLimit > 0;
		const cjkRegex = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

		return tokens.filter(token => {

			const tokenLength = token.txt.length;

			if (tokenLength >= cjkTokenLengthLimit || token.type === 'host' || (token as IToken).src === 'url-path' || (token as IToken).src === 'url-query-string') {
				return true;
			}

			if (hasMinLengthCheck && tokenLength < minTokenLength) {
				return false;
			}

			if (hasCJKLengthLimit && tokenLength > cjkTokenLengthLimit) {
				// 使用正则表达式检测CJK字符，避免依赖TokenType
				if (cjkRegex.test(token.txt) || (token as any).meta?.lang?.startsWith('zh') || (token as any).meta?.lang?.startsWith('ja') || (token as any).meta?.lang?.startsWith('ko')) {
					// 修正：如果长度超过限制，截断而不是过滤
					token.txt = token.txt.slice(0, cjkTokenLengthLimit);
				}
			}

			return true;
		});
	}

	#filTokenizeAllGapsWithNative(text: string, rangeTokens: [IRange, IToken[]][]): IToken[] {
		const out: IToken[] = [];
		let cursor = 0;

		if (rangeTokens.length) for (const [t, tokens] of rangeTokens) {
			if (cursor < t.start) {
				out.push(...this.#nativeSegment(text, cursor, t.start)
				);
			}
			out.push(...tokens);
			cursor = t.end;
		}

		if (cursor < text.length) {
			out.push(
				...this.#nativeSegment(text, cursor, text.length)
			);
		}

		return out;
	}

	#filTokenizeGapsWithNative(
		text: string,
		tokens: ISpanToken[],
	): ISpanToken[] {
		if (!this.#nativeSegmenter) return tokens;

		const out: ISpanToken[] = [];
		let cursor = 0;

		for (const t of tokens) {
			if (cursor < t.start) {
				out.push(
					...this.#nativeSegment(text, cursor, t.start)
				);
			}
			out.push(t);
			cursor = t.end;
		}

		if (cursor < text.length) {
			out.push(
				...this.#nativeSegment(text, cursor, text.length)
			);
		}

		return out;
	}

	#nativeSegment(
		text: string,
		start: number,
		end: number
	): ISpanToken[] {
		const slice = text.slice(start, end);
		const res: ISpanToken[] = [];

		for (const seg of this.#nativeSegmenter!.segment(slice)) {
			const s = start + seg.index;
			const e = s + seg.segment.length;

			res.push({
				txt: seg.segment,
				type: 'word',
				src: 'native',
				start: s,
				end: e
			});
		}

		return res;
	}
}
