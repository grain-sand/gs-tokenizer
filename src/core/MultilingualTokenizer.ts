import {
	IMultilingualTokenizer,
	INameLexiconGroup, ISpanToken,
	IToken,
	ITokenizerStage,
	SupportedLanguage,
	TokenizeMode,
	TokenizerOptions
} from "../type";
import {NameStage} from "./NameStage";
import {WordIndex} from "./WordIndex";
import {DictionaryStage} from "./DictionaryStage";
import {SocialStage} from "./SocialStage";
import {DateStage} from "./DateStage";
import {NumberStage} from "./NumberStage";
import {SymbolSpaceStage} from "./SymbolSpaceStage";
import {HostIPStage} from "./HostIPStage";
import {EmailStage} from "./EmailStage";

export class MultilingualTokenizer implements IMultilingualTokenizer {

	private stages: ITokenizerStage[] = [];
	private index = new WordIndex();
	private lexiconNames = new Set<string>();
	private options: TokenizerOptions;

	private nativeSegmenter =
		typeof Intl !== 'undefined' && 'Segmenter' in Intl
			? new Intl.Segmenter('und', { granularity: 'word' })
			: null;

	constructor(options: TokenizerOptions = {}) {
		this.options = options;

		this.addStage(new DictionaryStage(this.index));
		this.addStage(new SocialStage());
		this.addStage(new EmailStage());
		this.addStage(new HostIPStage());
		this.addStage(new DateStage());
		this.addStage(new NumberStage());
		this.addStage(new SymbolSpaceStage());
		// this.addStage(new FallbackWordStage());
	}

	get loadedLexiconNames(): string[] {
		return [...this.lexiconNames];
	}

	addDictionary(
		words: string[],
		name: string,
		priority = 0,
		language?: SupportedLanguage
	) {
		this.lexiconNames.add(name);
		for (const w of words) {
			this.index.add(w, {name, priority, lang: language});
		}
	}

	setNameDictionary(group: INameLexiconGroup, language: SupportedLanguage) {
		this.addStage(new NameStage(group, language));
	}

	addStage(stage: ITokenizerStage) {
		this.stages.push(stage);
		this.stages.sort(
			(a, b) => a.order - b.order || b.priority - a.priority
		);
	}

	removeStage(stageId: string) {
		this.stages = this.stages.filter(s => s.id !== stageId);
	}

	tokenize(text: string): ISpanToken[] {
		const tokens: ISpanToken[] = [];
		const len = text.length;

		let pos = 0;

		while (pos < len) {
			let advanced = false;

			for (const stage of this.stages) {
				const r = stage.run(text, pos, TokenizeMode.Tokenize);
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

			// ⚠️ 任何 stage 都没推进，强制前进 1
			if (!advanced) {
				pos++;
			}
		}

		// 🔧 用 span 补齐所有被跳过的区间
		return this.fillGapsWithNative(text, tokens);
	}

	extractWithSpan(text: string): ISpanToken[] {
		const out: ISpanToken[] = [];
		let pos = 0;
		let consumedUntil = -1;

		while (pos < text.length) {
			if (pos < consumedUntil) {
				pos++;
				continue;
			}

			let matched = false;

			for (const stage of this.stages) {
				const r = stage.run(text, pos, TokenizeMode.Extract);
				if (!r.tokens.length) continue;

				for (const t of r.tokens) {
					// 主 token
					out.push({
						...t,
						start: pos,
						end: r.unprocessedStart
					});

					/* ---------- 英文 / host / email 的 sub ---------- */
					if (t.type === 'host' || t.type === 'email' || t.type === 'word') {
						const parts = t.txt.match(/[A-Za-z]+|\d+/g);
						if (parts) {
							let offset = 0;
							for (const p of parts) {
								const idx = t.txt.indexOf(p, offset);
								if (idx !== -1) {
									out.push({
										txt: p,
										type: 'word',
										src: 'sub',
										start: pos + idx,
										end: pos + idx + p.length
									});
									offset = idx + p.length;
								}
							}
						}
					}

					/* ---------- number 的 sub ---------- */
					if (t.type === 'number') {
						const nums = t.txt.match(/\d+/g);
						if (nums) {
							let offset = 0;
							for (const n of nums) {
								const idx = t.txt.indexOf(n, offset);
								if (idx !== -1) {
									out.push({
										txt: n,
										type: 'number',
										src: 'sub',
										start: pos + idx,
										end: pos + idx + n.length
									});
									offset = idx + n.length;
								}
							}
						}
					}
				}

				// extract 的推进模型（关键）
				if (r.unprocessedStart > consumedUntil) {
					consumedUntil = r.unprocessedStart;
				}

				matched = true;
				break;
			}

			if (!matched) {
				pos++;
			} else {
				pos = consumedUntil > pos ? consumedUntil : pos + 1;
			}
		}

		return out;
	}



	/* ---------------- gap 修复 ---------------- */

	private fillGapsWithNative(
		text: string,
		tokens: ISpanToken[]
	): ISpanToken[] {
		if (!this.nativeSegmenter || !tokens.length) return tokens;

		const out: ISpanToken[] = [];
		let cursor = 0;

		for (const t of tokens) {
			if (cursor < t.start) {
				out.push(
					...this.nativeSegment(text, cursor, t.start)
				);
			}
			out.push(t);
			cursor = t.end;
		}

		if (cursor < text.length) {
			out.push(
				...this.nativeSegment(text, cursor, text.length)
			);
		}

		return out;
	}

	private nativeSegment(
		text: string,
		start: number,
		end: number
	): ISpanToken[] {
		const slice = text.slice(start, end);
		const res: ISpanToken[] = [];

		let offset = start;

		for (const seg of this.nativeSegmenter!.segment(slice)) {
			const s = offset + seg.index;
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

	extractAll(text: string): IToken[] {
		const out: IToken[] = [];
		const seen = new Set<string>();

		let pos = 0;
		let consumedUntil = -1;

		while (pos < text.length) {
			if (pos < consumedUntil) {
				pos++;
				continue;
			}

			let matched = false;

			for (const stage of this.stages) {
				let r = stage.run(text, pos, TokenizeMode.Extract);

				if (!r.tokens.length) continue;

				for (const t of r.tokens) {
					const key = `${t.type}:${t.txt}:${t.src ?? ''}`;
					if (seen.has(key)) continue;

					seen.add(key);
					out.push(t);

					// ⭐ 关键修复：只使用 unprocessedStart 推进
					if (r.unprocessedStart > consumedUntil) {
						consumedUntil = r.unprocessedStart;
					}

					/* ---------- 英文最小粒度 ---------- */
					if (t.type === 'host' || t.type === 'email' || t.type === 'word') {
						const parts = t.txt.match(/[A-Za-z]+|\d+/g);
						if (parts) {
							for (const p of parts) {
								const k = `word:${p}:sub`;
								if (!seen.has(k)) {
									seen.add(k);
									out.push({ txt: p, type: 'word', src: 'sub' });
								}
							}
						}
					}

					/* ---------- 数字最小粒度 ---------- */
					if (t.type === 'number') {
						const nums = t.txt.match(/\d+/g);
						if (nums) {
							for (const n of nums) {
								const k = `number:${n}:sub`;
								if (!seen.has(k)) {
									seen.add(k);
									out.push({ txt: n, type: 'number', src: 'sub' });
								}
							}
						}
					}
				}

				matched = true;
				break; // 命中最高优先级 stage 即停止
			}

			if (!matched) {
				pos++;
			} else {
				// ⭐ 绝对兜底：禁止原地
				if (consumedUntil <= pos) pos++;
				else pos = consumedUntil;
			}
		}

		return out;
	}

	tokenizeText(text: string): string[] {
		return this.tokenize(text).map(t => t.txt);
	}

	extractText(text: string): string[] {
		return this.extractAll(text).map(t => t.txt);
	}

	get loadedNameLexiconNames(): string[] {
		return this.stages
			.filter(s => s instanceof NameStage)
			.map(s => (s as NameStage).lang);
	}
}
