import {IStageResult, ITokenizerStage, TokenizeMode} from "../type";

export class HostIPStage implements ITokenizerStage {
	id = 'host-ip';
	order = 4;
	priority = 10;
	consuming = true;

	private ipRe = /^(?:\d{1,3}\.){3}\d{1,3}/;
	private hostRe = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|^localhost/;

	run(text: string, start: number, mode: TokenizeMode): IStageResult {
		const slice = text.slice(start);

		const ip = this.ipRe.exec(slice);
		if (ip) {
			return {
				tokens: [{ txt: ip[0], type: 'ip', src: 'host-ip' }],
				unprocessedStart: start + ip[0].length,
				consumed: mode === TokenizeMode.Tokenize
			};
		}

		const host = this.hostRe.exec(slice);
		if (host) {
			return {
				tokens: [{ txt: host[0], type: 'host', src: 'host-ip' }],
				unprocessedStart: start + host[0].length,
				consumed: mode === TokenizeMode.Tokenize
			};
		}

		return { tokens: [], unprocessedStart: start, consumed: false };
	}
}

