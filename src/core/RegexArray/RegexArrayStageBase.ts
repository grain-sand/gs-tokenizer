import {IStageBestResult, IToken, ITokenizerStage, TokenType} from "../../type";

export abstract class RegexArrayStageBase implements ITokenizerStage {

	abstract readonly id: string;
	abstract readonly order: number;
	abstract readonly priority: number;
	readonly skipOwnLastMax: boolean = true;

	protected abstract RegexArray: RegExp[];
	protected types?: TokenType[] = undefined;

	best(
		text: string,
		start: number
	): IStageBestResult {
		const rest = text.slice(start);
		for (let i = 0; i < this.RegexArray.length; i++) {
			const m = this.RegexArray[i].exec(rest);
			if (m) {
				const type = this.types?.[i] || this.id as any
				return {
					tokens: [{txt: m[0], type, src: type}],
					unprocessedStart: start + m[0].length,
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

	all(rest: string): IToken[] {
		let m: RegExpExecArray | null = null, type: TokenType = this.id as any;
		for (let i = 0; i < this.RegexArray.length; i++) {
			m = this.RegexArray[i].exec(rest);
			if (m) {
				this.types?.[i] && (type = this.types![i])
				break;
			}
		}
		if (!m) return []
		const token: IToken = {txt: m[0], type, src: type};
		if (!m[1]) {
			return [token]
		}
		const arr = [token]
		for (let i = 1; Boolean(m[i]); i++) {
			arr.push({txt: m[i], type, src: `${type}-sub`});
		}
		return arr;
	}

}
