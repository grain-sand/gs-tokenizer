import {
	IMultilingualTokenizer,
	INameLexiconGroup,
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

	constructor(options: TokenizerOptions = {}) {
		this.options = options;

		this.addStage(new DictionaryStage(this.index));
		this.addStage(new SocialStage());
		this.addStage(new EmailStage());
		this.addStage(new HostIPStage());
		this.addStage(new DateStage());
		this.addStage(new NumberStage());
		this.addStage(new SymbolSpaceStage());
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

	tokenize(text: string): IToken[] {
		const out: IToken[] = [];
		let pos = 0;

		while (pos < text.length) {
			let consumed = false;

			for (const stage of this.stages) {
				let r = stage.run(text, pos, TokenizeMode.Tokenize);
				if (r.consumed) {
					out.push(...r.tokens);
					pos = r.unprocessedStart;
					consumed = true;
					break;
				}
			}

			if (!consumed) pos++;
		}

		// 原生兜底
		if (this.options.useNativeSegmenterForRest && pos < text.length) {
			out.push({
				txt: text.slice(pos),
				type: 'word',
				src: 'native'
			});
		}

		return out;
	}

	extract(text: string): IToken[] {
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
		return this.extract(text).map(t => t.txt);
	}
}
