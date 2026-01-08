import {IStageBestResult, IToken} from "../../type";
import {NameStageBase} from "./NameStageBase";

export class NameJkStage extends NameStageBase{

	order = 3;
	best(text: string, start: number): IStageBestResult {
		let pos = start;

		for (const ln of this.last) {
			if (!text.startsWith(ln, pos)) continue;
			const afterLast = pos + ln.length;

			for (const fn of this.first) {
				if (text.startsWith(fn, afterLast)) {
					const name = ln + fn;
					return {
						tokens: [{
							txt: name,
							type: 'name',
							lang: this.lang,
							src:this.id
						}],
						unprocessedStart: afterLast + fn.length,
						consumed: true
					};
				} else {
					if (!text.startsWith(fn, afterLast + 1)) continue;
					const name = ln + ' ' + fn;
					return {
						tokens: [{
							txt: name,
							type: 'name',
							lang: this.lang,
							src:this.id
						}],
						unprocessedStart: afterLast + fn.length,
						consumed: true
					};
				}
			}
		}

		return {tokens: [], unprocessedStart: start, consumed: false};
	}


	all(rest: string) {
		const tokens: IToken[] = [];
		for (const ln of this.last) {
			if (!rest.startsWith(ln)) continue;
			const afterLast = ln.length + 1;
			for (const fn of this.first) {
				if (rest.startsWith(fn, afterLast)) {
					const name = ln + ' ' + fn;
					tokens.push({
						txt: name,
						type: 'name',
						lang: this.lang,
						src:this.id,
					})
				}
				if (rest.startsWith(fn, ln.length)) {
					const name = ln + fn;
					tokens.push({
						txt: name,
						type: 'name',
						lang: this.lang,
						src:this.id,
					})
				}
			}
		}
		return tokens;
	}
}
