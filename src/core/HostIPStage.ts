import {IStageBestResult, IToken, ITokenizerStage, TokenType} from "../type";

export class HostIPStage implements ITokenizerStage {
	// IPv4 + port
	private static IPV4 =
		/^(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?/;
	// IPv6（必须包含冒号）
	private static IPV6 =
		/^(?:\[[0-9a-fA-F:]*:[0-9a-fA-F:]+]|[0-9a-fA-F]*:[0-9a-fA-F:]+)(?::\d{1,5})?/;
	// host + port（协议可选）
	private static HOST =
		/^(?:https\/\/)?(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+|localhost)(?::\d{1,5})?/;
	readonly id = 'host-ip';
	readonly order = 4;
	readonly priority = 10;
	readonly skipOwnLastMax = true;
	#Sub = /[^a-zA-Z0-9-]+/;

	best(
		text: string,
		start: number
	): IStageBestResult {
		const rest = text.slice(start);
		let m: RegExpExecArray | null;
		let type: TokenType | null = null;

		m = HostIPStage.IPV6.exec(rest);
		if (m) type = 'ip';

		if (!m) {
			m = HostIPStage.IPV4.exec(rest);
			if (m) type = 'ip';
		}

		if (!m) {
			m = HostIPStage.HOST.exec(rest);
			if (m) type = 'host';
		}

		if (!m) {
			return {
				tokens: [],
				unprocessedStart: start,
				consumed: false
			};
		}

		let raw = m[0];

		raw = raw.replace(/^https\/\//, '');

		if (type === 'ip' && raw.startsWith('[')) {
			raw = raw.slice(1, raw.indexOf(']')) +
				raw.slice(raw.indexOf(']') + 1);
		}

		return {
			tokens: [{txt: raw, type: type!}],
			unprocessedStart: start + m[0].length,
			consumed: true
		};
	}

	all(rest: string): IToken[] {
		let m: RegExpExecArray | null;
		let type!: TokenType;

		m = HostIPStage.IPV6.exec(rest);
		if (m) type = 'ip';

		if (!m) {
			m = HostIPStage.HOST.exec(rest);
			if (m) type = 'host';
		}

		if (!m) {
			m = HostIPStage.IPV4.exec(rest);
			if (m) type = 'ip';
		}
		if (!m) return [];
		const txt = m[0];

		const token = {txt, type, src: type};
		if (this.#Sub.test(txt)) {
			return [
				token,
				...txt.split(this.#Sub).map((s) => ({txt: s, type: 'word', src: `${type}-sub`})) as any
			]
		}
		return [token];
	}
}




