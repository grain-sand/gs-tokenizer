import {IToken, TokenType} from "../../type";

export function tokenText(tokens: IToken[], exclude: TokenType[]=['punctuation','space']): string[] {
	return Array.from(new Set(tokens.filter(t => {
		return !exclude.includes(t.type);
	}).map(t => t.txt)));
}
