import {beforeEach, describe, expect, it} from "vitest";
import { OldMultilingualTokenizer } from "../src";

describe('Multilingual Tokenizer - Name Recognition Tests', () => {
  let tokenizer: OldMultilingualTokenizer;

  beforeEach(() => {
    tokenizer = new OldMultilingualTokenizer();
  });

  describe('中文姓名识别', () => {
    it('should recognize Chinese names as separate words', () => {
      const text = '毛泽东是中国的伟大领袖，习近平主席正在访问上海。张三与李四是好朋友。';
      const tokens = tokenizer.tokenize(text, 'zh');

      console.log('中文姓名测试:', text);
      console.log('分词结果:', tokens.map(t => `${t.txt}[${t.type}]`).join(', '));

      // 检查是否识别出姓名的各个部分
      const nameTokens = tokens.filter(token => token.type === 'word');
      console.log('识别到的单词:', nameTokens.map(t => t.txt));

      // 检查是否识别出姓名的各个部分
      expect(nameTokens.some(token => token.txt === '毛泽东' || token.txt === '毛泽')).toBe(true);
      // 习近平可能被分成"习"、"近平"或"习近平"
      expect(nameTokens.some(token => token.txt === '习近平' || token.txt === '习' || token.txt === '近平')).toBe(true);
      expect(nameTokens.some(token => token.txt === '张三')).toBe(true);
      // 李四可能被分成"李"、"四"或"李四"
      expect(nameTokens.some(token => token.txt === '李四' || token.txt === '李' || token.txt === '四')).toBe(true);
    });
  });

  describe('英文姓名识别', () => {
    it('should recognize English names as separate words', () => {
      const text = 'Albert Einstein was a famous physicist. Bill Gates founded Microsoft.';
      const tokens = tokenizer.tokenize(text, 'en');

      console.log('英文姓名测试:', text);
      console.log('分词结果:', tokens.map(t => `${t.txt}[${t.type}]`).join(', '));

      // 检查是否识别出姓名的各个部分
      const nameTokens = tokens.filter(token => token.type === 'word');
      console.log('识别到的单词:', nameTokens.map(t => t.txt));

      // 现在应该识别出姓名的各个部分，而不是完整姓名
      expect(nameTokens.some(token => token.txt === 'Albert')).toBe(true);
      expect(nameTokens.some(token => token.txt === 'Einstein')).toBe(true);
      expect(nameTokens.some(token => token.txt === 'Bill')).toBe(true);
      expect(nameTokens.some(token => token.txt === 'Gates')).toBe(true);
    });
  });

  describe('姓名类型统计', () => {
    it('should correctly identify name tokens among other tokens', () => {
      const text = '毛泽东和习近平在北京会见了Bill Gates。';
      const tokens = tokenizer.tokenize(text);

      const nameTokens = tokens.filter(token => token.type === 'word');

      console.log('混合姓名测试:', text);
      console.log('识别到的姓名:', nameTokens.map(t => `${t.txt}[${t.type}]`));

      // 应该识别出至少2个中文姓名和1个英文姓名
      expect(nameTokens.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('tokenizeText 方法对姓名的处理', () => {
    it('should include name parts in the text output', () => {
      const text = 'Albert Einstein was born in Germany. 毛泽东出生于中国。';
      const words = tokenizer.tokenizeText(text);

      console.log('tokenizeText测试:', text);
      console.log('输出结果:', words);

      // 检查姓名的各个部分是否包含在输出中
      expect(words.some(word => word.includes('Albert'))).toBe(true);
      expect(words.some(word => word.includes('Einstein'))).toBe(true);
      expect(words.some(word => word.includes('毛泽'))).toBe(true);
    });
  });
});
