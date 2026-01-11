import {SupportedLanguage} from './SupportedLanguage';
import {Lang} from './Lang';

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

	supLang?: SupportedLanguage;
	lang?: Lang;
	src?: string;
}

export interface IRange {
	start: number;
	end: number;
}

export interface ISpanToken extends IToken, IRange {
}
