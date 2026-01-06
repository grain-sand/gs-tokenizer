import {IMultilingualTokenizer, INextToken, IToken} from "../type";

type TokenType = IToken['type'];

interface TrieWord {
	txt: string;
	type: TokenType;
	src: string;
	priority: number;
	lang?: string;
}

class TrieNode {
	children = new Map<string, TrieNode>();
	words: TrieWord[] = [];
}

class Trie {
	root = new TrieNode();

	insert(word: TrieWord) {
		let node = this.root;
		for (const ch of word.txt) {
			if (!node.children.has(ch)) {
				node.children.set(ch, new TrieNode());
			}
			node = node.children.get(ch)!;
		}
		node.words.push(word);
	}

	remove(txt: string, src?: string) {
		const dfs = (node: TrieNode, i: number): boolean => {
			if (i === txt.length) {
				node.words = node.words.filter(w => !(w.txt === txt && (!src || w.src === src)));
			} else {
				const ch = txt[i];
				const next = node.children.get(ch);
				if (next && dfs(next, i + 1)) {
					node.children.delete(ch);
				}
			}
			return node.words.length === 0 && node.children.size === 0;
		};
		dfs(this.root, 0);
	}

	match(text: string, start: number): TrieWord | null {
		let node = this.root;
		let best: TrieWord | null = null;

		for (let i = start; i < text.length; i++) {
			const ch = text[i];
			node = node.children.get(ch)!;
			if (!node) break;
			if (node.words.length) {
				best = node.words.sort((a, b) =>
					b.txt.length - a.txt.length || b.priority - a.priority
				)[0];
			}
		}
		return best;
	}
}

export class NextMultilingualTokenizer implements IMultilingualTokenizer {
	private tries = new Map<string, Trie>();
	private lexicons = new Map<string, { lang: string; priority: number }>();

	get loadedLexiconNames() {
		return [...this.lexicons.keys()];
	}

	addDictionary(words: string[], name: string, priority = 100, language = 'und') {
		if (!this.tries.has(language)) {
			this.tries.set(language, new Trie());
		}
		const trie = this.tries.get(language)!;
		this.lexicons.set(name, { lang: language, priority });

		for (const w of words) {
			trie.insert({
				txt: w,
				type: 'word',
				src: name,
				priority,
				lang: language
			});
		}
	}

	removeCustomWord(word: string, language?: string, lexiconName?: string) {
		const langs = language ? [language] : [...this.tries.keys()];
		for (const lang of langs) {
			this.tries.get(lang)?.remove(word, lexiconName);
		}
	}

	tokenize(text: string, language = 'und'): INextToken[] {
		const trie = this.tries.get(language);
		const tokens: INextToken[] = [];
		let i = 0;

		while (i < text.length) {
			const ch = text[i];

			if (/\s/.test(ch)) {
				const s = i;
				while (i < text.length && /\s/.test(text[i])) i++;
				tokens.push({ txt: text.slice(s, i), type: 'space', start: s, end: i });
				continue;
			}

			if (/[.,!?;:]/.test(ch)) {
				tokens.push({ txt: ch, type: 'punctuation', start: i, end: i + 1 });
				i++;
				continue;
			}

			const hit = trie?.match(text, i);
			if (hit) {
				const end = i + hit.txt.length;
				tokens.push({
					txt: hit.txt,
					type: hit.type,
					src: hit.src,
					lang: hit.lang,
					start: i,
					end
				});
				i = end;
			} else {
				tokens.push({
					txt: ch,
					type: 'other',
					start: i,
					end: i + 1
				});
				i++;
			}
		}
		return tokens;
	}

	tokenizeText(text: string): string[] {
		return this.tokenize(text)
			.filter(t => t.type === 'word')
			.map(t => t.txt);
	}
}
