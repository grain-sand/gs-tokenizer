import {ISpanToken, IToken, IWordIndex, IWordMatch, LexiconMeta} from "../type";

export class FirstCharWordIndex implements IWordIndex {

	readonly #wordMap = new Map<string, LexiconMeta[]>();
	readonly #firstCharIndex = new Map<string, Map<number, string[]>>();
	readonly #sortedCache = new Map<string, [number, string[]][]>();


	add(word: string, meta: LexiconMeta) {
		let metas = this.#wordMap.get(word);
		if (!metas) {
			metas = [];
			this.#wordMap.set(word, metas);
		}
		metas.push(meta);

		const ch = word[0];
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

	getLenCache(ch: string): [number, string[]][] {
		if (this.#sortedCache.has(ch)) {
			return this.#sortedCache.get(ch)!;
		}
		if (!this.#firstCharIndex.has(ch)) {
			this.#sortedCache.set(ch, []);
			return [] as any;
		}
		const arr = Array.from(this.#firstCharIndex.get(ch)!);
		this.#firstCharIndex.delete(ch);
		this.#sortedCache.set(ch, arr.sort((a, b) => b[0] - a[0]));
		return arr!;
	}

	match(text: string, pos: number) {
		const ch = text[pos];
		const lenMap = this.getLenCache(ch);
		if (!lenMap) return [];

		const result: Array<IWordMatch> = [];

		for (const [len, words] of lenMap) {
			const end = pos + len;
			if (end > text.length) continue;
			const slice = text.slice(pos, end);
			for (const w of words) {
				if (w === slice) {
					for (const m of this.#wordMap.get(w)!) {
						result.push({word: w, meta: m});
					}
				}
			}
		}
		return result;
	}

	matches(text: string, mainPos: number): Array<ISpanToken> {
		const result: Array<ISpanToken> = [];
		const ch = text[0];
		const lenArr = this.getLenCache(ch);
		if (!lenArr) return [];
		for (const [len, words] of lenArr) {
			for (const w of words) {
				// console.log(w)
				if (text.startsWith(w)) {
					const meta = this.#wordMap.get(w)!;
					// result.push({
					// 	txt: w,
					// 	type: 'word',
					// 	lang: meta.lang,
					// 	src: meta.name,
					// 	start: mainPos,
					// 	end: mainPos + len,
					// });
					// console.log(w, meta.length, meta)
				}
			}
		}
		return result;
	}
}
