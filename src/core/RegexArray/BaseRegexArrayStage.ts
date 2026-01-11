import {IStageAllResult, IStageBestResult, IToken, ITokenizerStage, Lang, TokenType} from "../../type";

export type GroupAfter = (token: IToken) => IToken;

export abstract class BaseRegexArrayStage implements ITokenizerStage {

	abstract readonly id: string;
	abstract readonly order: number;
	abstract readonly priority: number;
	readonly skipOwnLastMax: boolean = true;

	protected abstract RegexArray: RegExp[];
	/**
	 * 每个正则表达式的匹配组对应的token类型
	 * @protected
	 */
	protected groupTypes?: Record<number, TokenType> = undefined;
	protected groupSources?: Record<number, string> = undefined;
	protected groupAfter?: Record<number, GroupAfter> = undefined;
	/**
	 * 每个正则表达式的匹配组对应的token类型
	 * - 如果未指定，则默认使用id作为token类型
	 * - 此类型将覆盖 `groupTypes` 中的 `mainGroup`
	 * @protected
	 */
	protected types?: TokenType[] = undefined;
	protected langArr?: Lang[] = undefined;
	protected mainGroup = 0;
	protected lang?: Lang = undefined;

	best(
		text: string,
		start: number
	): IStageBestResult {
		const rest = text.slice(start);
		for (let i = 0; i < this.RegexArray.length; i++) {
			const m = this.RegexArray[i].exec(rest);
			if (m) {
				const type = this.types?.[i] || this.groupTypes?.[this.mainGroup] || this.id as any
				const lang = this.langArr?.[i] || this.lang;
				let token: IToken = {txt: m[this.mainGroup], type, src: this.groupSources?.[this.mainGroup] || type};
				if (lang) {
					token.lang = lang;
				}
				if (this.groupAfter?.[this.mainGroup]) {
					token = this.groupAfter[this.mainGroup](token)
				}
				return {
					tokens: [token],
					unprocessedStart: start + m[this.mainGroup].length,
					consumed: true
				};
			}
		}
		return {
			tokens: [],
			unprocessedStart: start,
			consumed: false
		};
	}

	all(rest: string): IStageAllResult {
		let m: RegExpExecArray | null = null, type!: TokenType, lang: Lang | undefined;
		for (let i = 0; i < this.RegexArray.length; i++) {
			m = this.RegexArray[i].exec(rest);
			if (m) {
				this.types?.[i] && (type = this.types![i])
				lang = this.langArr?.[i] || this.lang;
				break;
			}
		}
		type || (type = this.groupTypes?.[this.mainGroup] || this.id as any)
		if (!m) return {tokens: [], end: 0};
		let token: IToken = {txt: m[this.mainGroup], type, src: this.groupSources?.[this.mainGroup] || type};
		if (lang) {
			token.lang = lang;
		}
		if (this.groupAfter?.[this.mainGroup]) {
			token = this.groupAfter[this.mainGroup](token)
		}
		let tokens: IToken[];
		if (!m[this.mainGroup + 1]) {
			tokens = [token];
		} else {
			tokens = [token];
			for (let i = this.mainGroup + 1; Boolean(m[i]); i++) {
				const st = this.groupTypes?.[i];
				let sToken: IToken = {txt: m[i], type: st || type, src: this.groupSources?.[i] || st || `${type}-sub`};
				if (lang) {
					sToken.lang = lang;
				}
				if (this.groupAfter?.[i]) {
					sToken = this.groupAfter[i](sToken)
				}
				tokens.push(sToken);
			}
		}
		return {tokens, end: m[0].length};
	}
}
