import {BaseRegexArrayStage, GroupAfter} from "./BaseRegexArrayStage";
import {IToken, ITokenizerOption, TokenType} from "../../type";

export class UrlStage extends BaseRegexArrayStage {
	readonly id = 'url';
	readonly order = 7;
	readonly priority = 1000;
	readonly skipOwnLastMax = true;
	readonly breakIfProcessed = true;
	mainGroup = 1;
	protected groupTypes: Record<number, TokenType> = {
		1: 'host',
		2: 'other',
		3: 'other',
		4: 'other',
	}
	protected groupSources?: Record<number, string> = {
		2: 'url-path',
		3: 'url-query-string',
		4: 'url-hash',
	}
	protected groupAfter?: Record<number, GroupAfter> = {
		2: (token) => this.#truncateUrlPath(token),
		3: (token) => this.#truncateUrlQuery(token),
	}
	protected RegexArray: RegExp[] = [
		/^\s*(?:https?|ftp)?:[/]+((?:[a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+|localhost)(?::\d{1,5})?((?:[/][^/?#\s]*)*\/?)(?:[?]([^#\s]*)*)?(?:#(\S*))?/i,
	];

	private $option: ITokenizerOption;

	constructor(option: ITokenizerOption) {
		super();
		this.$option = option;
	}

	setOption(option: ITokenizerOption) {
		this.$option = option;
	}

	#truncateUrlPath(token: IToken): IToken {
		const limit = this.$option.urlPathLengthLimit || 32;
		if (token.txt.length <= limit) {
			return token;
		}
		
		// 寻找与限制长度最近的 / 位置（不包含开头的 /）
		const truncatePos = token.txt.lastIndexOf('/', limit);
		const finalPos = truncatePos > 0 ? truncatePos : limit;
		
		return {...token, txt: token.txt.slice(0, finalPos)};
	}

	#truncateUrlQuery(token: IToken): IToken {
		const limit = this.$option.urlQueryLengthLimit || 32;
		if (token.txt.length <= limit) {
			return token;
		}
		
		// 寻找与限制长度最近的 = 或 & 位置
		const equalPos = token.txt.lastIndexOf('=', limit);
		const ampPos = token.txt.lastIndexOf('&', limit);
		const truncatePos = Math.max(equalPos, ampPos);
		
		// 确定最终截断位置，不保留最后的=与&
		let finalPos = limit;
		if (truncatePos > 0) {
			finalPos = truncatePos;
			// 检查截断位置是否为&或=，如果是则再向前找合适位置
			while (finalPos > 0 && (token.txt[finalPos] === '&' || token.txt[finalPos] === '=')) {
				finalPos--;
			}
		}
		
		return {...token, txt: token.txt.slice(0, finalPos + 1)};
	}
}
