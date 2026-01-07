import { describe, it, expect, beforeEach } from 'vitest';
import { getCachedTokenizer } from './utils/tokenizer-factory';

describe('Multilingual Tokenizer - Chinese Time Recognition', () => {
  let tokenizer;

  beforeEach(() => {
    tokenizer = getCachedTokenizer();
  });

  it('should tokenize single Chinese number + time unit as date type', () => {
    const testCases = [
      '五小时',
      '三天',
      '百小时',
      '十周',
      '千年',
      '一月',
      '亿分钟',
      '四秒',
      '二毫秒',
      '六天'
    ];

    for (const testCase of testCases) {
      const tokens = tokenizer.tokenize(testCase);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('date');
      expect(tokens[0].txt).toBe(testCase);
    }
  });

  it('should tokenize mixed Chinese number + time unit in sentence', () => {
    const text = '我需要工作五小时，休息三天，然后学习百小时。';
    const tokens = tokenizer.tokenize(text);

    // 检查是否有正确的日期类型token
    const dateTokens = tokens.filter(token => token.type === 'date');
    expect(dateTokens).toHaveLength(3);
    expect(dateTokens.map(t => t.txt)).toEqual(['五小时', '三天', '百小时']);
  });

  it('should handle complex Chinese number combinations', () => {
    const testCases = [
      '二十五小时',
      '三百六十五天',
      '九百九十九年',
      '十二周',
      '五十三分钟',
      '七十四秒'
    ];

    for (const testCase of testCases) {
      const tokens = tokenizer.tokenize(testCase);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('date');
      expect(tokens[0].txt).toBe(testCase);
    }
  });

  it('should still handle Arabic numbers + time unit correctly', () => {
    const testCase = '5小时和30分钟';
    const tokens = tokenizer.tokenize(testCase);

    const dateTokens = tokens.filter(token => token.type === 'date');
    expect(dateTokens).toHaveLength(2);
    expect(dateTokens.map(t => t.txt)).toEqual(['5小时', '30分钟']);
  });

  it('should handle both Chinese and Arabic numbers in same text', () => {
    const testCase = '五小时后休息30分钟';
    const tokens = tokenizer.tokenize(testCase);

    const dateTokens = tokens.filter(token => token.type === 'date');
    expect(dateTokens).toHaveLength(2);
    expect(dateTokens.map(t => t.txt)).toEqual(['五小时', '30分钟']);
  });
});
