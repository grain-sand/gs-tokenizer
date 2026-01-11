import {describe, expect, it} from 'vitest';
import {detectChar, Lang} from '../../../src';

describe('detectChar', () => {
  describe('空白字符', () => {
    it('应该识别空格', () => {
      expect(detectChar(' '.codePointAt(0)!)).toBe(Lang.WHITESPACE);
    });

    it('应该识别制表符', () => {
      expect(detectChar('\t'.codePointAt(0)!)).toBe(Lang.WHITESPACE);
    });

    it('应该识别换行符', () => {
      expect(detectChar('\n'.codePointAt(0)!)).toBe(Lang.WHITESPACE);
    });

    it('应该识别回车符', () => {
      expect(detectChar('\r'.codePointAt(0)!)).toBe(Lang.WHITESPACE);
    });
  });

  describe('数字', () => {
    it('应该识别半角数字', () => {
      expect(detectChar('0'.codePointAt(0)!)).toBe(Lang.NUMERIC_HALF);
      expect(detectChar('5'.codePointAt(0)!)).toBe(Lang.NUMERIC_HALF);
      expect(detectChar('9'.codePointAt(0)!)).toBe(Lang.NUMERIC_HALF);
    });

    it('应该识别全角数字', () => {
      expect(detectChar('０'.codePointAt(0)!)).toBe(Lang.NUMERIC_FULL);
      expect(detectChar('５'.codePointAt(0)!)).toBe(Lang.NUMERIC_FULL);
      expect(detectChar('９'.codePointAt(0)!)).toBe(Lang.NUMERIC_FULL);
    });

    it('应该识别罗马数字', () => {
      expect(detectChar('Ⅰ'.codePointAt(0)!)).toBe(Lang.NUMERIC_OTHER); // Ⅰ (U+2160)
      expect(detectChar('Ⅴ'.codePointAt(0)!)).toBe(Lang.NUMERIC_OTHER); // Ⅴ (U+2164)
      expect(detectChar('Ⅹ'.codePointAt(0)!)).toBe(Lang.NUMERIC_OTHER); // Ⅹ (U+2169)
    });

    it('应该识别圆圈内数字', () => {
      expect(detectChar('①'.codePointAt(0)!)).toBe(Lang.NUMERIC_OTHER); // ① (U+2460)
      expect(detectChar('⑩'.codePointAt(0)!)).toBe(Lang.NUMERIC_OTHER); // ⑩ (U+2469)
    });

    it('应该识别其他特殊数字', () => {
      expect(detectChar('²'.codePointAt(0)!)).toBe(Lang.NUMERIC_OTHER); // ² (U+00B2)
      expect(detectChar('³'.codePointAt(0)!)).toBe(Lang.NUMERIC_OTHER); // ³ (U+00B3)
    });
  });

  describe('英文字母', () => {
    it('应该识别大写英文字母', () => {
      expect(detectChar('A'.codePointAt(0)!)).toBe(Lang.EN);
      expect(detectChar('Z'.codePointAt(0)!)).toBe(Lang.EN);
    });

    it('应该识别小写英文字母', () => {
      expect(detectChar('a'.codePointAt(0)!)).toBe(Lang.EN);
      expect(detectChar('z'.codePointAt(0)!)).toBe(Lang.EN);
    });
  });

  describe('CJK字符', () => {
    it('应该识别中文字符', () => {
      expect(detectChar('中'.codePointAt(0)!)).toBe(Lang.CJK);
      expect(detectChar('文'.codePointAt(0)!)).toBe(Lang.CJK);
    });

    it('应该识别日文假名', () => {
      expect(detectChar('あ'.codePointAt(0)!)).toBe(Lang.CJK); // 平假名
      expect(detectChar('ア'.codePointAt(0)!)).toBe(Lang.CJK); // 片假名
    });

    it('应该识别韩文字符', () => {
      expect(detectChar('한'.codePointAt(0)!)).toBe(Lang.CJK);
      expect(detectChar('글'.codePointAt(0)!)).toBe(Lang.CJK);
    });
  });

  describe('表情符号', () => {
    it('应该识别经典emoji', () => {
      expect(detectChar('😀'.codePointAt(0)!)).toBe(Lang.EMOJI); // 😀 (U+1F600)
      expect(detectChar('❤️'.codePointAt(0)!)).toBe(Lang.EMOJI); // ❤️ (U+2764)
    });

    it('应该识别emoji修饰符', () => {
      expect(detectChar('🏻'.codePointAt(0)!)).toBe(Lang.EMOJI); // 🏻 (U+1F3FB)
    });

    it('应该识别变体选择器', () => {
      expect(detectChar('🇦'.codePointAt(0)!)).toBe(Lang.EMOJI); // 🇦 (U+1F1E6)
    });
  });

  describe('其他语言', () => {
    it('应该识别俄语字符', () => {
      expect(detectChar('А'.codePointAt(0)!)).toBe(Lang.RU);
      expect(detectChar('я'.codePointAt(0)!)).toBe(Lang.RU);
    });

    it('应该识别阿拉伯语字符', () => {
      expect(detectChar('ا'.codePointAt(0)!)).toBe(Lang.AR);
      expect(detectChar('ي'.codePointAt(0)!)).toBe(Lang.AR);
    });

    it('应该识别印地语字符', () => {
      expect(detectChar('अ'.codePointAt(0)!)).toBe(Lang.HI);
      expect(detectChar('ह'.codePointAt(0)!)).toBe(Lang.HI);
    });

    it('应该识别泰语字符', () => {
      expect(detectChar('ก'.codePointAt(0)!)).toBe(Lang.TH);
      expect(detectChar('ฮ'.codePointAt(0)!)).toBe(Lang.TH);
    });

    it('应该识别希伯来语字符', () => {
      expect(detectChar('א'.codePointAt(0)!)).toBe(Lang.HE);
      expect(detectChar('ת'.codePointAt(0)!)).toBe(Lang.HE);
    });

    it('应该识别希腊语字符', () => {
      expect(detectChar('Α'.codePointAt(0)!)).toBe(Lang.EL);
      expect(detectChar('ω'.codePointAt(0)!)).toBe(Lang.EL);
    });
  });

  describe('符号', () => {
    it('应该识别半角符号', () => {
      expect(detectChar('!'.codePointAt(0)!)).toBe(Lang.SYMBOL_HALF);
      expect(detectChar('@'.codePointAt(0)!)).toBe(Lang.SYMBOL_HALF);
      expect(detectChar('#'.codePointAt(0)!)).toBe(Lang.SYMBOL_HALF);
      expect(detectChar('$'.codePointAt(0)!)).toBe(Lang.SYMBOL_HALF);
      expect(detectChar('%'.codePointAt(0)!)).toBe(Lang.SYMBOL_HALF);
    });

    it('应该识别全角符号', () => {
      expect(detectChar('！'.codePointAt(0)!)).toBe(Lang.SYMBOL_FULL);
      expect(detectChar('＠'.codePointAt(0)!)).toBe(Lang.SYMBOL_FULL);
      expect(detectChar('＃'.codePointAt(0)!)).toBe(Lang.SYMBOL_FULL);
      expect(detectChar('。'.codePointAt(0)!)).toBe(Lang.SYMBOL_FULL);
      expect(detectChar('，'.codePointAt(0)!)).toBe(Lang.SYMBOL_FULL);
    });
  });

  describe('无法识别的字符', () => {
    it('应该返回OTHER类型', () => {
      // 使用一个不在任何已知范围内的Unicode码点
      expect(detectChar(0x030000)).toBe(Lang.OTHER);
    });
  });
});
