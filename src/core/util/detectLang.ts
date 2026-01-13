import {Lang} from "../../type";

/**
 * 检测文本语言类型
 * @param str 输入文本
 * @param fastCJK 是否快速检测CJK语言（遇到中、日、韩文字直接返回）
 * @returns 检测到的语言类型
 *
 * 支持的语言类型：
 * - EN: 英文及ASCII字母数字
 * - CJK: 中文、日文、韩文
 * - EMOJI: 表情符号（包括基础emoji、修饰符和组合标记）
 * - RU: 俄语（西里尔文）
 * - AR: 阿拉伯语
 * - HI: 印地语（天城文）
 * - TH: 泰语
 * - HE: 希伯来语
 * - EL: 希腊语
 * - SYMBOL_HALF: 半角符号（ASCII范围内的符号）
 * - SYMBOL_FULL: 全角符号（包括中文符号等Unicode符号）
 * - WHITESPACE: 空白字符（空格、制表符、换行符等）
 * - OTHER: 混合语言或其他语言
 *
 * 检测规则：
 * 1. 空字符串返回EN
 * 2. 纯空白字符返回WHITESPACE
 * 3. 纯半角符号返回SYMBOL_HALF
 * 4. 纯全角符号返回SYMBOL_FULL
 * 5. 包含中、日、韩文字且fastCJK为true时返回CJK
 * 6. 纯中、日、韩文字返回CJK
 * 7. 纯表情符号返回EMOJI
 * 8. 纯俄语返回RU
 * 9. 纯阿拉伯语返回AR
 * 10. 纯印地语返回HI
 * 11. 纯泰语返回TH
 * 12. 纯希伯来语返回HE
 * 13. 纯希腊语返回EL
 * 14. 混合不同语言类型返回OTHER
 */
export function detectLang(str: string, fastCJK = true): Lang {
	// 特殊情况：英文+数字组合应检测为英文
	if (/^[a-zA-Z0-9]+$/.test(str) && /[a-zA-Z]/.test(str)) {
		return Lang.EN;
	}

	let lang: Lang = Lang.NONE;
	let secondLang: Lang = Lang.NONE;

	// 预处理：检查是否纯空白字符
	if (/^\s+$/.test(str)) {
		return Lang.WHITESPACE;
	}

	for (let i = 0; i < str.length;) {
		const cp = str.codePointAt(i)!;

		// 空白字符处理
		if (cp <= 0x7f && (cp === 0x20 || cp === 0x09 || cp === 0x0a || cp === 0x0d)) {
			i++;
			continue;
		}

		// 先检测小类（数字类型）
		// 半角数字检测
		if (cp >= 0x30 && cp <= 0x39) {
			if (lang === Lang.NONE) {
				lang = Lang.NUMERIC_HALF;
			} else if (lang !== Lang.NUMERIC_HALF) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
				} else if (secondLang !== Lang.NUMERIC_HALF) {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | Lang.NUMERIC_HALF;
				}
			}
			i++;
			continue;
		}

		// 全角数字检测
		if (cp >= 0xff10 && cp <= 0xff19) {
			if (lang === Lang.NONE) {
				lang = Lang.NUMERIC_FULL;
			} else if (lang !== Lang.NUMERIC_FULL) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
				} else if (secondLang !== Lang.NUMERIC_FULL) {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | Lang.NUMERIC_FULL;
				}
			}
			i += cp > 0xffff ? 2 : 1;
			continue;
		}

		// 罗马数字检测
		if ((cp >= 0x2160 && cp <= 0x2188) || (cp >= 0x2150 && cp <= 0x215f)) {
			if (lang === Lang.NONE) {
				lang = Lang.NUMERIC_OTHER;
			} else if (lang !== Lang.NUMERIC_OTHER) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
				} else if (secondLang !== Lang.NUMERIC_OTHER) {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | Lang.NUMERIC_OTHER;
				}
			}
		i += cp > 0xffff ? 2 : 1;
		continue;
	}

	// 圆圈内数字检测
	if ((cp >= 0x2460 && cp <= 0x249b) || (cp >= 0x3220 && cp <= 0x325f) || (cp >= 0x32b1 && cp <= 0x32bf)) {
		if (lang === Lang.NONE) {
			lang = Lang.NUMERIC_OTHER;
		} else if (lang !== Lang.NUMERIC_OTHER) {
			if (secondLang === Lang.NONE) {
				secondLang = lang;
			} else if (secondLang !== Lang.NUMERIC_OTHER) {
				// 如果已经有两种不同语言，返回这两种语言的逻辑或
				return secondLang | lang | Lang.NUMERIC_OTHER;
			}
		}
		i += cp > 0xffff ? 2 : 1;
		continue;
	}

	// 其他特殊数字检测
	if ((cp >= 0x2070 && cp <= 0x209f) || (cp >= 0x00b2 && cp <= 0x00b3) || cp === 0x00b9) {
		if (lang === Lang.NONE) {
			lang = Lang.NUMERIC_OTHER;
		} else if (lang !== Lang.NUMERIC_OTHER) {
			if (secondLang === Lang.NONE) {
				secondLang = lang;
			} else if (secondLang !== Lang.NUMERIC_OTHER) {
				// 如果已经有两种不同语言，返回这两种语言的逻辑或
				return secondLang | lang | Lang.NUMERIC_OTHER;
			}
		}
		i += cp > 0xffff ? 2 : 1;
		continue;
	}

		// 然后检测大类
		// ASCII字符（英文、半角符号）
		if (cp <= 0x7f) {
			// 半角字母检测
			if ((cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a)) {
				if (lang === Lang.NONE) {
					lang = Lang.EN;
				} else if (lang !== Lang.EN) {
					if (secondLang === Lang.NONE) {
						secondLang = lang;
						lang = Lang.EN;
					} else {
						// 如果已经有两种不同语言，返回这两种语言的逻辑或
						return secondLang | lang | Lang.EN;
					}
				}
				i++;
				continue;
			}
			// 半角符号检测（ASCII范围内的非字母数字字符）
			if (lang === Lang.NONE) {
				lang = Lang.SYMBOL_HALF;
			} else if (lang !== Lang.SYMBOL_HALF) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
					lang = Lang.SYMBOL_HALF;
				} else {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | Lang.SYMBOL_HALF;
				}
			}
			i++;
			continue;
		}

		// CJK（中、日、韩）
		if ((cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)) {
			// 中文
			const currentCJKLang = Lang.ZH;
			if (fastCJK) return currentCJKLang;
			if (lang === Lang.NONE) {
				lang = currentCJKLang;
			} else if (lang !== currentCJKLang) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
					lang = currentCJKLang;
				} else {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | currentCJKLang;
				}
			}
			i += cp > 0xffff ? 2 : 1;
			continue;
		} else if (cp >= 0x3040 && cp <= 0x30ff) {
			// 日文
			const currentCJKLang = Lang.JA;
			if (fastCJK) return currentCJKLang;
			if (lang === Lang.NONE) {
				lang = currentCJKLang;
			} else if (lang !== currentCJKLang) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
					lang = currentCJKLang;
				} else {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | currentCJKLang;
				}
			}
			i += cp > 0xffff ? 2 : 1;
			continue;
		} else if (cp >= 0xac00 && cp <= 0xd7af) {
			// 韩文
			const currentCJKLang = Lang.KO;
			if (fastCJK) return currentCJKLang;
			if (lang === Lang.NONE) {
				lang = currentCJKLang;
			} else if (lang !== currentCJKLang) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
					lang = currentCJKLang;
				} else {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | currentCJKLang;
				}
			}
			i += cp > 0xffff ? 2 : 1;
			continue;
		}

		// Emoji
		if ((cp >= 0x1F000 && cp <= 0x1FAFF) ||
			// 经典emoji
			(cp >= 0x2600 && cp <= 0x27BF) ||
			// Emoji修饰符
			(cp >= 0x1F3FB && cp <= 0x1F3FF) ||
			// Emoji组合标记 (零宽连接符)
			(cp >= 0x200D && cp <= 0x200D) ||
			// 变体选择器
			(cp >= 0xFE00 && cp <= 0xFE0F)) {
			if (lang === Lang.NONE) {
				lang = Lang.EMOJI;
			} else if (lang !== Lang.EMOJI) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
					lang = Lang.EMOJI;
				} else {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | Lang.EMOJI;
				}
			}
			i += cp > 0xffff ? 2 : 1;
			continue;
		}

		// 其他语言类型
		// 俄语 / 西里尔
		if (cp >= 0x0400 && cp <= 0x04ff) {
			if (lang === Lang.NONE) {
				lang = Lang.RU;
			} else if (lang !== Lang.RU) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
					lang = Lang.RU;
				} else {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | Lang.RU;
				}
			}
			i += cp > 0xffff ? 2 : 1;
			continue;
		}

		// 阿拉伯
		if (cp >= 0x0600 && cp <= 0x06ff) {
			if (lang === Lang.NONE) {
				lang = Lang.AR;
			} else if (lang !== Lang.AR) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
					lang = Lang.AR;
				} else {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | Lang.AR;
				}
			}
			i += cp > 0xffff ? 2 : 1;
			continue;
		}

		// 印地语（天城文）
		if (cp >= 0x0900 && cp <= 0x097f) {
			if (lang === Lang.NONE) {
				lang = Lang.HI;
			} else if (lang !== Lang.HI) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
					lang = Lang.HI;
				} else {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | Lang.HI;
				}
			}
			i += cp > 0xffff ? 2 : 1;
			continue;
		}

		// 泰语
		if (cp >= 0x0e00 && cp <= 0x0e7f) {
			if (lang === Lang.NONE) {
				lang = Lang.TH;
			} else if (lang !== Lang.TH) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
					lang = Lang.TH;
				} else {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | Lang.TH;
				}
			}
			i += cp > 0xffff ? 2 : 1;
			continue;
		}

		// 希伯来
		if (cp >= 0x0590 && cp <= 0x05ff) {
			if (lang === Lang.NONE) {
				lang = Lang.HE;
			} else if (lang !== Lang.HE) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
					lang = Lang.HE;
				} else {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | Lang.HE;
				}
			}
			i += cp > 0xffff ? 2 : 1;
			continue;
		}

		// 希腊
		if (cp >= 0x0370 && cp <= 0x03ff) {
			if (lang === Lang.NONE) {
				lang = Lang.EL;
			} else if (lang !== Lang.EL) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
					lang = Lang.EL;
				} else {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | Lang.EL;
				}
			}
		i += cp > 0xffff ? 2 : 1;
		continue;
		}

		// 全角符号
		if (
			// 中文标点符号
			(cp >= 0x3000 && cp <= 0x303f) ||
			// 全角ASCII符号 (包含所有全角标点和括号)
			(cp >= 0xff00 && cp <= 0xffef) ||
			// 其他常见符号
			(cp >= 0x2000 && cp <= 0x206f) ||
			(cp >= 0x2100 && cp <= 0x26ff)
		) {
			if (lang === Lang.NONE) {
				lang = Lang.SYMBOL_FULL;
			} else if (lang !== Lang.SYMBOL_FULL) {
				if (secondLang === Lang.NONE) {
					secondLang = lang;
					lang = Lang.SYMBOL_FULL;
				} else {
					// 如果已经有两种不同语言，返回这两种语言的逻辑或
					return secondLang | lang | Lang.SYMBOL_FULL;
				}
			}
			i += cp > 0xffff ? 2 : 1;
			continue;
		}

		// 无法识别的字符
		if (secondLang !== Lang.NONE) {
			return secondLang | lang | Lang.OTHER;
		}
		if (lang !== Lang.NONE) {
			secondLang = lang;
		}
		lang = Lang.OTHER;
	}

	// 如果检测到两种语言，返回它们的逻辑或
	if (secondLang !== Lang.NONE) {
		return secondLang | lang;
	}
	return lang === Lang.NONE ? Lang.EN : lang;
}
