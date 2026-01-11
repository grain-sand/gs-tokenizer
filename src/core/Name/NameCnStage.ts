import {IStageAllResult, IStageBestResult, IToken, Lang} from "../../type";
import {NameStageBase} from "./NameStageBase";

export class NameCnStage extends NameStageBase {
	priority = 1000;

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
						supLang: this.lang,
						src: this.id,
						lang: Lang.CJK
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
						supLang: this.lang,
						src: this.id,
						lang: Lang.CJK
					}],
					unprocessedStart: start + name.length,
					consumed: true
				};
			}
		}

		return {tokens: [], unprocessedStart: start, consumed: false};
	}

	all(rest: string): IStageAllResult {
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
					supLang: this.lang,
					src: this.id,
					lang: Lang.CJK
				})
			}
			const afterLast = pos + ln.length;
			for (const fn of this.first) {
				if (!rest.startsWith(fn, afterLast)) continue;
				const name = prefix + ln + fn;
				tokens.push({
					txt: name,
					type: 'name',
					supLang: this.lang,
					src: this.id,
					lang: Lang.CJK
				})
			}
		}
		// 计算最长匹配的长度作为end
		const end = tokens.length > 0 ? Math.max(...tokens.map(t => t.txt.length)) : 0;
		return {tokens, end};
	}
}
