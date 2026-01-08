import {IToken, IWordIndex, IWordMatch, LexiconMeta} from "../type";

export class FirstCharWordIndex implements IWordIndex {

	readonly #wordMap = new Map<string, LexiconMeta>();
	readonly #firstCharIndex = new Map<string, Map<number, string[]>>();
	// readonly #sortedCache = new Map<string, [number, string[]][]>();


	add(word: string, meta: LexiconMeta) {
		const ch = word[0];
		// if(this.#sortedCache.has(ch)) {
		// 	throw new Error(`FirstCharWordIndex: add word ${word} with meta ${meta.name} failed, because it has been added before`);
		// }

		this.#wordMap.set(word, meta);
		const len = word.length;

		let lenMap = this.#firstCharIndex.get(ch);
		if (!lenMap) {
			lenMap = new Map();
			this.#firstCharIndex.set(ch, lenMap);
		}

		let list = lenMap.get(len);
		if (!list) {
			list = [];
			lenMap.set(len, list);
		}
		list.push(word);
	}

	// getLenCache(ch: string): [number, string[]][] {
	// 	if (this.#sortedCache.has(ch)) {
	// 		return this.#sortedCache.get(ch)!;
	// 	}
	// 	if (!this.#firstCharIndex.has(ch)) {
	// 		this.#sortedCache.set(ch, []);
	// 		return [] as any;
	// 	}
	// 	const arr = Array.from(this.#firstCharIndex.get(ch)!);
	// 	this.#firstCharIndex.delete(ch);
	// 	this.#sortedCache.set(ch, arr.sort((a, b) => b[0] - a[0]));
	// 	return arr!;
	// }

	match(text: string, pos: number) {
		const ch = text[pos];
		const lenMap = this.#firstCharIndex.get(ch);
		if (!lenMap) return [];

		const result: Array<IWordMatch> = [];

		for (const [len, words] of lenMap) {
			const end = pos + len;
			if (end > text.length) continue;
			const slice = text.slice(pos, end);
			for (const w of words) {
				if (w === slice) {
					result.push({word: w, meta: this.#wordMap.get(w)!});
				}
			}
		}
		return result;
	}

	matches(text: string) {
		const result: IToken[] = [];
		const ch = text[0];
		const lenArr = this.#firstCharIndex.get(ch);
		if (!lenArr) return [];
		for (const [, words] of lenArr) {
			for (const w of words) {
				if (text.startsWith(w)) {
					const meta = this.#wordMap.get(w)!;
					result.push({
						txt: w,
						type: 'word',
						lang: meta.lang,
						src: meta.name
					});
				}
			}
		}
		return result;
	}
}
