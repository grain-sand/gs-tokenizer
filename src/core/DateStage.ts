import {IStageResult, ITokenizerStage, TokenizeMode} from "../type";

export class DateStage implements ITokenizerStage {
	id = 'date';
	order = 5;
	priority = 10;
	consuming = true;

	private re = /^(\d{1,4}年代|\d+\s*[-~]\s*\d+\s*(?:年|个月|天|小时)|(?:第|no)\s*\d+|\d+(?:\.\d+)?\s*(?:年|个月|天|小时|点|分钟前|秒钟|年前)|[一二三四五六七八九十百千万两]+(?:年|个月|天|小时))/;

	run(text: string, start: number, mode: TokenizeMode): IStageResult {
		const m = this.re.exec(text.slice(start));
		if (!m) {
			return {tokens: [], unprocessedStart: start, consumed: false};
		}

		return {
			tokens: [{txt: m[0], type: 'date', src: 'date'}],
			unprocessedStart: start + m[0].length,
			consumed: mode === TokenizeMode.Tokenize
		};
	}
}
