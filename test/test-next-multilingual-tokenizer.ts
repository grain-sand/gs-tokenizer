import { describe, it, expect, beforeEach } from 'vitest';
import { NextMultilingualTokenizer } from '../src/next/NextMultilingualTokenizer';
import { INextToken } from '../src';

describe('NextMultilingualTokenizer', () => {
  let tokenizer: NextMultilingualTokenizer;

  beforeEach(() => {
    tokenizer = new NextMultilingualTokenizer();
  });

  describe('addDictionary', () => {
    it('should add words to lexicon and update max word length', () => {
      tokenizer.addDictionary(['测试', '分词器', '中文'], 'chinese-lexicon');

      expect(tokenizer.loadedLexiconNames).toContain('chinese-lexicon');
      expect(tokenizer.loadedLexiconNames.length).toBe(1);
    });

    it('should handle multiple lexicons', () => {
      tokenizer.addDictionary(['hello', 'world'], 'english-lexicon');
      tokenizer.addDictionary(['test', 'tokenizer'], 'test-lexicon');

      expect(tokenizer.loadedLexiconNames).toContain('english-lexicon');
      expect(tokenizer.loadedLexiconNames).toContain('test-lexicon');
      expect(tokenizer.loadedLexiconNames.length).toBe(2);
    });
  });

  describe('removeCustomWord', () => {
    it('should remove word from specific lexicon', () => {
      tokenizer.addDictionary(['测试', '分词器', '中文'], 'chinese-lexicon');
      tokenizer.removeCustomWord('测试', undefined, 'chinese-lexicon');

      // 分词应该不再匹配'测试'
      const tokens = tokenizer.tokenize('测试分词器');
      expect(tokens.map(t => t.txt)).toEqual(['测', '试', '分词器']);
    });

    it('should remove word from all lexicons', () => {
      tokenizer.addDictionary(['测试', '分词器'], 'lexicon1');
      tokenizer.addDictionary(['测试', '中文'], 'lexicon2');
      tokenizer.removeCustomWord('测试');

      // 分词应该不再匹配'测试'
      const tokens = tokenizer.tokenize('测试分词器中文');
      expect(tokens.map(t => t.txt)).toEqual(['测', '试', '分词器', '中文']);
    });
  });

  describe('tokenize', () => {
    it('should tokenize text based on lexicon words with positions', () => {
      tokenizer.addDictionary(['中文', '分词', '测试'], 'chinese-lexicon');

      const text = '中文分词测试';
      const tokens = tokenizer.tokenize(text);

      expect(tokens).toEqual([
        {
          txt: '中文',
          type: 'word',
          lang: undefined,
          src: 'chinese-lexicon',
          start: 0,
          end: 2
        },
        {
          txt: '分词',
          type: 'word',
          lang: undefined,
          src: 'chinese-lexicon',
          start: 2,
          end: 4
        },
        {
          txt: '测试',
          type: 'word',
          lang: undefined,
          src: 'chinese-lexicon',
          start: 4,
          end: 6
        }
      ]);
    });

    it('should use longest match principle', () => {
      tokenizer.addDictionary(['中国', '人民', '中国人', '民'], 'chinese-lexicon');

      const text = '中国人民';
      const tokens = tokenizer.tokenize(text);

      // 最长匹配会优先匹配当前位置的最长词'中国人'，然后匹配'民'
      expect(tokens.map(t => t.txt)).toEqual(['中国人', '民']);

      // 验证位置信息
      expect(tokens[0].start).toBe(0);
      expect(tokens[0].end).toBe(3);
      expect(tokens[1].start).toBe(3);
      expect(tokens[1].end).toBe(4);
    });

    it('should handle unknown characters with positions', () => {
      tokenizer.addDictionary(['测试'], 'chinese-lexicon');

      const text = '测试abc';
      const tokens = tokenizer.tokenize(text);

      expect(tokens).toEqual([
        {
          txt: '测试',
          type: 'word',
          lang: undefined,
          src: 'chinese-lexicon',
          start: 0,
          end: 2
        },
        {
          txt: 'a',
          type: 'other',
          start: 2,
          end: 3
        },
        {
          txt: 'b',
          type: 'other',
          start: 3,
          end: 4
        },
        {
          txt: 'c',
          type: 'other',
          start: 4,
          end: 5
        }
      ]);
    });

    it('should work with mixed languages and positions', () => {
      tokenizer.addDictionary(['中文', '分词'], 'chinese-lexicon');
      tokenizer.addDictionary(['hello', 'world'], 'english-lexicon');

      const text = '中文hello分词world';
      const tokens = tokenizer.tokenize(text);

      expect(tokens.map(t => t.txt)).toEqual(['中文', 'hello', '分词', 'world']);

      // 验证位置信息
      expect(tokens[0].start).toBe(0);
      expect(tokens[0].end).toBe(2);
      expect(tokens[1].start).toBe(2);
      expect(tokens[1].end).toBe(7);
      expect(tokens[2].start).toBe(7);
      expect(tokens[2].end).toBe(9);
      expect(tokens[3].start).toBe(9);
      expect(tokens[3].end).toBe(14);
    });
  });

  describe('tokenizeText', () => {
    it('should return plain text tokens', () => {
      tokenizer.addDictionary(['中文', '分词', '测试'], 'chinese-lexicon');

      const text = '中文分词测试';
      const result = tokenizer.tokenizeText(text);

      expect(result).toEqual(['中文', '分词', '测试']);
    });

    it('should handle includeTypes option', () => {
      tokenizer.addDictionary(['测试'], 'chinese-lexicon');

      const text = '测试abc';
      const result = tokenizer.tokenizeText(text, { includeTypes: ['word'] });

      expect(result).toEqual(['测试']);
    });

    it('should handle excludeTypes option', () => {
      tokenizer.addDictionary(['测试'], 'chinese-lexicon');

      const text = '测试abc';
      const result = tokenizer.tokenizeText(text, { excludeTypes: ['other'] });

      expect(result).toEqual(['测试']);
    });
  });

  describe('loadedLexiconNames', () => {
    it('should return all loaded lexicon names', () => {
      tokenizer.addDictionary(['中文'], 'chinese-lexicon');
      tokenizer.addDictionary(['english'], 'english-lexicon');
      tokenizer.addDictionary(['test'], 'test-lexicon');

      expect(tokenizer.loadedLexiconNames).toEqual(expect.arrayContaining(['chinese-lexicon', 'english-lexicon', 'test-lexicon']));
      expect(tokenizer.loadedLexiconNames.length).toBe(3);
    });
  });
});
