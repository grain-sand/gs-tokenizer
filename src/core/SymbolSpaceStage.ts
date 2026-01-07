import {IStageBestResult, ITokenizerStage} from "../type";

export class SymbolSpaceStage implements ITokenizerStage {
	id = 'symbol-space';
	order = 7;
	priority = 0;
	consuming = false;

	best(text: string, start: number): IStageBestResult {
		const len = text.length;
		let i = start;
		const ch = text[i];

		// 空白
		if (/\s/.test(ch)) {
			while (i < len && /\s/.test(text[i])) i++;

			return {
				tokens: [{
					txt: text.slice(start, i),
					type: 'space'
				}],
				unprocessedStart: i, // ✅ 一定前进
				consumed: false
			};
		}

		// 符号（非字母数字）
		if (!/[0-9A-Za-z\u4e00-\u9fff]/.test(ch)) {
			while (
				i < len &&
				!/[0-9A-Za-z\u4e00-\u9fff\s]/.test(text[i])
				) {
				i++;
			}

			return {
				tokens: [{
					txt: text.slice(start, i),
					type: 'punctuation'
				}],
				unprocessedStart: i, // ✅
				consumed: false
			};
		}

		// 不认识，也必须前进
		return {
			tokens: [],
			unprocessedStart: start + 1, // ✅ 兜底推进
			consumed: false
		};
	}

	all(text: string) {
		return [];
	}
}


