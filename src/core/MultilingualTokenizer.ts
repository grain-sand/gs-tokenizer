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

export class MultilingualTokenizer implements IMultilingualTokenizer {

	private stages: ITokenizerStage[] = [];
	private index = new WordIndex();
	private lexiconNames = new Set<string>();
	private options: TokenizerOptions;

	constructor(options: TokenizerOptions = {}) {
		this.options = options;

		this.addStage(new DictionaryStage(this.index));

		this.addStage(new SocialStage());
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
				const r = stage.run(text, pos, TokenizeMode.Tokenize);
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
		let pos = 0;

		while (pos < text.length) {
			for (const stage of this.stages) {
				const r = stage.run(text, pos, TokenizeMode.Extract);
				out.push(...r.tokens);
			}
			pos++;
		}

		if (this.options.deduplicate) {
			const seen = new Set<string>();
			return out.filter(t => {
				const k = `${t.type}:${t.txt}:${t.src ?? ''}`;
				if (seen.has(k)) return false;
				seen.add(k);
				return true;
			});
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
