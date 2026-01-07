/* =========================================================
 * Stage 2：姓名分词（含中文 老 / 小）
 * ========================================================= */

import {INameLexiconGroup, ISpanToken, IStageBestResult, ITokenizerStage, SupportedLanguage} from "../type";

export class NameJkStage implements ITokenizerStage {
	id = 'name';
	order = 2;
	priority = 0;
	consuming = true;

	private last = new Set<string>();
	private first = new Set<string>();
	private title = new Set<string>();


	constructor(group: INameLexiconGroup, public lang: SupportedLanguage) {
		group.lastName.forEach(v => this.last.add(v));
		group.firstName.forEach(v => this.first.add(v));
		group.title.forEach(v => this.title.add(v));
	}

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
							src: 'name'
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
							src: 'name'
						}],
						unprocessedStart: afterLast + fn.length,
						consumed: true
					};
				}
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
				if (text.startsWith(fn, afterLast)) {
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
				if (text.startsWith(fn, ln.length)) {
					const name = ln + fn;
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
		}
		return tokens;
	}
}
