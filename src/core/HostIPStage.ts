import {IStageBestResult, ITokenizerStage, TokenType} from "../type";

export class HostIPStage implements ITokenizerStage {
	id = 'host-ip';
	order = 4;
	priority = 10;
	readonly skipOwnLastMax = true;

	// IPv4 + port
	private static IPV4 =
		/^(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?/;

	// IPv6（必须包含冒号）
	private static IPV6 =
		/^(?:\[[0-9a-fA-F:]*:[0-9a-fA-F:]+\]|[0-9a-fA-F]*:[0-9a-fA-F:]+)(?::\d{1,5})?/;

	// host + port（协议可选）
	private static HOST =
		/^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\:\d{1,5})?/;

	best(
		text: string,
		start: number
	): IStageBestResult {
		const rest = text.slice(start);
		let m: RegExpExecArray | null = null;
		let type: TokenType | null = null;

		// IPv6 优先
		m = HostIPStage.IPV6.exec(rest);
		if (m) type = 'ip';

		// IPv4
		if (!m) {
			m = HostIPStage.IPV4.exec(rest);
			if (m) type = 'ip';
		}

		// Host
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

		// 去协议
		raw = raw.replace(/^https?:\/\//, '');

		// IPv6 去 []
		if (type === 'ip' && raw.startsWith('[')) {
			raw = raw.slice(1, raw.indexOf(']')) +
				raw.slice(raw.indexOf(']') + 1);
		}

		return {
			tokens: [{ txt: raw, type:type! }],
			unprocessedStart: start + m[0].length,
			consumed: true
		};
	}

	all(text: string) {
		return [];
	}
}




