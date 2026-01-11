import {IStageAllResult, IStageBestResult, IToken, Lang} from "../../type";
import {NameStageBase} from "./NameStageBase";

export class NameOtherStage extends NameStageBase {
	order = 4;

	best(text: string, start: number): IStageBestResult {
		let pos = start;

		for (const ln of this.last) {
			if (!text.startsWith(ln, pos)) continue;
			const afterLast = pos + ln.length + 1;
			for (const fn of this.first) {
				if (!text.startsWith(fn, afterLast)) continue;
				const name = ln + ' ' + fn;
				return {
					tokens: [{
						txt: name,
						type: 'name',
						supLang: this.lang,
						src: this.id,
						lang: Lang.EN
					}],
					unprocessedStart: afterLast + fn.length,
					consumed: true
				};
			}
		}

		return {tokens: [], unprocessedStart: start, consumed: false};
	}

	all(rest: string): IStageAllResult {
		const tokens: IToken[] = [];
		for (const ln of this.last) {
			if (!rest.startsWith(ln)) continue;
			const afterLast = ln.length + 1;
			for (const fn of this.first) {
				if (!rest.startsWith(fn, afterLast)) continue;
				const name = ln + ' ' + fn;
				tokens.push({
					txt: name,
					type: 'name',
					supLang: this.lang,
					src: this.id,
					lang: Lang.EN
				})
			}
		}
		// 计算最长匹配的长度作为end
		const end = tokens.length > 0 ? Math.max(...tokens.map(t => t.txt.length)) : 0;
		return { tokens, end };
	}
}
