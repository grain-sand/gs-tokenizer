import {IStageBestResult, IToken} from "../../type";
import {NameStageBase} from "./NameStageBase";

export class NameCnStage extends NameStageBase {

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
						src: this.id
					}],
					unprocessedStart: afterLast + fn.length,
					consumed: true
				};
			}
			if (pos) {
				const name = prefix + ln;
				return {
					tokens: [{
						txt: name,
						type: 'name',
						lang: this.lang,
						src: this.id
					}],
					unprocessedStart: start + name.length,
					consumed: true
				};
			}
		}

		return {tokens: [], unprocessedStart: start, consumed: false};
	}

	all(rest: string) {
		const tokens: IToken[] = [];
		let pos = 0;
		let prefix = '';

		const p = rest[0];
		if (p === '老' || p === '小') {
			prefix = p;
			pos++;
		}
		for (const ln of this.last) {
			if (!rest.startsWith(ln, pos)) continue;
			if (pos) {
				const name = prefix + ln;
				tokens.push({
					txt: name,
					type: 'name',
					lang: this.lang,
					src: this.id,
				})
			}
			const afterLast = pos + ln.length;
			for (const fn of this.first) {
				if (!rest.startsWith(fn, afterLast)) continue;
				const name = prefix + ln + fn;
				tokens.push({
					txt: name,
					type: 'name',
					lang: this.lang,
					src: this.id,
				})
			}
		}
		return tokens;
	}
}
