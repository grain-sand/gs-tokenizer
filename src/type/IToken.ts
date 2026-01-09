import { SupportedLanguage } from './SupportedLanguage';

export type TokenType =
	| 'word'
	| 'name'
	| 'title'
	| 'hashtag'
	| 'mention'
	| 'host'
	| 'email'
	| 'url'
	| 'ip'
	| 'date'
	| 'number'
	| 'emoji'
	| 'punctuation'
	| 'space'
	| 'other';

export interface IToken {
	txt: string;
	type: TokenType;

	lang?: SupportedLanguage;
	src?: string;
}

export interface IRange {
	start: number;
	end: number;
}

export interface ISpanToken extends IToken, IRange {
}
