import {IStageBestResult, IToken, ITokenizerStage} from "../../type";

export abstract class RegexArrayStageBase implements ITokenizerStage {

	abstract readonly id: string;
	abstract readonly order: number;
	abstract readonly priority: number;
	readonly skipOwnLastMax: boolean = true;

	protected abstract RegexArray: RegExp[];

	best(
		text: string,
		start: number
	): IStageBestResult {
		const rest = text.slice(start);
		for (const re of this.RegexArray) {
			const m = re.exec(rest);
			if (m) {
				return {
					tokens: [{txt: m[0], type: this.id as any}],
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
		let m: RegExpExecArray | null = null;
		for (const re of this.RegexArray) if (Boolean(m = re.exec(rest))) break;
		if (!m) return []
		const token: IToken = {txt: m[0], type: this.id as any, src: this.id};
		if (!m[1]) {
			return [token]
		}
		const arr = [token]
		for (let i = 1; Boolean(m[i]); i++) {
			arr.push({txt: m[i], type: this.id as any, src: `${this.id}-sub`});
		}
		return arr;
	}

}
