import { SupportedLanguage } from './SupportedLanguage';
import { IToken } from './IToken';

export interface INameLexiconGroup {
	lastName: string[];
	firstName: string[];
	title: string[];
}

export interface LexiconMeta {
	name: string;
	priority: number;
	lang?: SupportedLanguage;
}

export interface IWordMatch {
	start?: number;
	end?: number;
	word: string;
	meta: LexiconMeta;
}

export interface IWordIndex {

	add(word: string, meta: LexiconMeta): void;
	addBatch(words: { word: string; meta: LexiconMeta }[]): void;

	match(text: string, pos: number): IWordMatch[];

	matches(text: string): IToken[];
}
