import {ISpanToken, IStageBestResult} from "../../type";
import {NameStageBase} from "./NameStageBase";

export class NameOtherStage extends NameStageBase{

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
						lang: this.lang,
						src: 'name'
					}],
					unprocessedStart: afterLast + fn.length,
					consumed: true
				};
			}
		}

		return {tokens: [], unprocessedStart: start, consumed: false};
	}

	all(text: string, mainPos: number): ISpanToken[] {
		const tokens: ISpanToken[] = [];
		for (const ln of this.last) {
			if (!text.startsWith(ln)) continue;
			const afterLast = ln.length + 1;
			for (const fn of this.first) {
				if (!text.startsWith(fn, afterLast)) continue;
				const name = ln + ' ' + fn;
				tokens.push({
					txt: name,
					type: 'name',
					lang: this.lang,
					src: 'name',
					start: mainPos,
					end: mainPos + name.length
				})
			}
		}
		return tokens;
	}
}
