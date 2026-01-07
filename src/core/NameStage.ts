/* =========================================================
 * Stage 2：姓名分词（含中文 老 / 小）
 * ========================================================= */

import {INameLexiconGroup, IStageBestResult, ITokenizerStage, SupportedLanguage} from "../type";

export class NameStage implements ITokenizerStage {
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
		let prefix = '';

		if (this.lang.startsWith('zh')) {
			const p = text[start];
			if (p === '老' || p === '小') {
				prefix = p;
				pos++;
			}
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
		}

		return { tokens: [], unprocessedStart: start, consumed: false };
	}

	all(text: string) {
		return [];
	}
}
