import {
	IMultilingualTokenizer,
	INameLexiconGroup,
	IRange,
	ISpanToken,
	IToken,
	ITokenizerStage,
	SupportedLanguage,
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
import {HostIPStage} from "./HostIPStage";
import {DateStage} from "./RegexArray/DateStage";

export class MultilingualTokenizer implements IMultilingualTokenizer {

	readonly wordIndex = new FirstCharWordIndex();
	#stages: ITokenizerStage[] = [];
	#lexiconNames = new Set<string>();
	#nameLexiconNames: string[] = [];

	private nativeSegmenter =
		typeof Intl !== 'undefined' && 'Segmenter' in Intl
			? new Intl.Segmenter('und', {granularity: 'word'})
			: null;

	constructor() {

		this.addStage(new DictionaryStage());
		this.addStage(new SocialStage());
		this.addStage(new EmailStage());
		this.addStage(new HostIPStage());
		this.addStage(new DateStage());
		this.addStage(new NumberStage());
		this.addStage(new PunctuationStage());
		this.addStage(new SpaceStage());
	}

	get loadedLexiconNames(): string[] {
		return [...this.#lexiconNames];
	}

	get loadedNameLexiconNames(): string[] {
		return this.#nameLexiconNames;
	}

	addDictionary(
		words: string[],
		name: string,
		priority = 0,
		language?: SupportedLanguage
	) {
		this.#lexiconNames.add(name);
		for (const w of words) {
			this.wordIndex.add(w, {name, priority, lang: language});
		}
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
		return this.#filTokenizeGapsWithNative(text, tokens);
	}

	tokenizeAll(text: string): IToken[] {
		let pos = 0;
		const rangeTokens: [IRange, IToken[]][] = [];
		const lastMap = new Map<ITokenizerStage, number>();

		while (pos < text.length) {
			const substr = text.slice(pos);
			const tokens: IToken[] = [];
			for (const stage of this.#stages) {
				if (!stage.skipOwnLastMax) {
					tokens.push(...stage.all(substr));
					continue;
				}
				if (pos <= lastMap.get(stage)!) {
					continue;
				}
				const all = stage.all(substr);
				if (!all.length) continue;
				tokens.push(...all);
				let last = 0;
				for (const t of all) if (t.txt.length > last) last = t.txt.length;
				lastMap.set(stage, pos + last);
			}
			if (tokens.length) {
				let max = 0;
				for (const t of tokens) {
					if (t.txt.length > max) max = t.txt.length;
				}
				const range = {start: pos, end: pos + max};
				rangeTokens.push([range, tokens]);
			}
			pos++;
		}
		return this.#filTokenizeAllGapsWithNative(text, rangeTokens);
	}

	tokenizeText(text: string): string[] {
		return this.tokenize(text).map(t => t.txt);
	}

	tokenizeTextAll(text: string): string[] {
		return this.tokenizeAll(text)
			.filter(t => t.type === 'punctuation' && t.txt.length > 1 || t.type !== 'space')
			.map(t => t.txt);
	}

	#filTokenizeAllGapsWithNative(text: string, rangeTokens: [IRange, IToken[]][]): IToken[] {
		const out: IToken[] = [];
		let cursor = 0;

		if (rangeTokens.length) for (const [t, tokens] of rangeTokens) {
			if (cursor < t.start) {
				out.push(
					...this.#nativeSegment(text, cursor, t.start)
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
		if (!this.nativeSegmenter) return tokens;

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

		for (const seg of this.nativeSegmenter!.segment(slice)) {
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
