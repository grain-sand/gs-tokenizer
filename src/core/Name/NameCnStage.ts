import {ISpanToken, IStageBestResult} from "../../type";
import {NameStageBase} from "./NameStageBase";

export class NameCnStage extends NameStageBase{

	best(text: string, start: number): IStageBestResult {
		let pos = start;
		let prefix = '';

		const p = text[start];
		if (p === '老' || p === '小') {
			prefix = p;
			pos++;
		}

		for (const ln of this.last) {
			if (!text.startsWith(ln, pos)) continue;
			const afterLast = pos + ln.length;
			for (const fn of this.first) {
				if (!text.startsWith(fn, afterLast)) continue;

				const name = prefix + ln + fn;
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
			if(pos) {
				const name = prefix + ln;
				return {
					tokens: [{
						txt: name,
						type: 'name',
						lang: this.lang,
						src: 'name'
					}],
					unprocessedStart: start + name.length,
					consumed: true
				};
			}
		}

		return {tokens: [], unprocessedStart: start, consumed: false};
	}

	all(text: string, mainPos: number): ISpanToken[] {
		const tokens: ISpanToken[] = [];
		let pos = 0;
		let prefix = '';

		const p = text[0];
		if (p === '老' || p === '小') {
			prefix = p;
			pos++;
		}
		for (const ln of this.last) {
			if (!text.startsWith(ln, pos)) continue;
			const name = prefix + ln;
			tokens.push({
				txt: name,
				type: 'name',
				lang: this.lang,
				src: 'name',
				start: mainPos,
				end: mainPos + name.length
			})
			const afterLast = pos + ln.length;
			for (const fn of this.first) {
				if (!text.startsWith(fn, afterLast)) continue;
				const name = prefix + ln + fn;
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
