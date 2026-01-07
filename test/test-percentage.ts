import { describe, it, expect } from 'vitest';
import { getCachedTokenizer } from './utils/tokenizer-factory';

describe('Multilingual Tokenizer - Percentage Recognition', () => {
  const tokenizer = getCachedTokenizer();

  it('应该正确识别基本百分比格式', () => {
    const testCases = ['50%', '100%', '0%', '-50%', '+50%'];

    testCases.forEach(text => {
      const tokens = tokenizer.tokenize(text);
      expect(tokens.length).toBe(1);
      expect(tokens[0].type).toBe('number');
      expect(tokens[0].txt).toBe(text);
    });
  });

  it('应该正确识别带小数的百分比格式', () => {
    const testCases = ['50.5%', '100.12%', '0.5%', '-50.5%', '+50.5%'];

    testCases.forEach(text => {
      const tokens = tokenizer.tokenize(text);
      expect(tokens.length).toBe(1);
      expect(tokens[0].type).toBe('number');
      expect(tokens[0].txt).toBe(text);
    });
  });

  it('应该正确识别基本千分比格式', () => {
    const testCases = ['50‰', '100‰', '0‰', '-50‰', '+50‰'];

    testCases.forEach(text => {
      const tokens = tokenizer.tokenize(text);
      expect(tokens.length).toBe(1);
      expect(tokens[0].type).toBe('number');
      expect(tokens[0].txt).toBe(text);
    });
  });

  it('应该正确识别带小数的千分比格式', () => {
    const testCases = ['50.5‰', '100.12‰', '0.5‰', '-50.5‰', '+50.5‰'];

    testCases.forEach(text => {
      const tokens = tokenizer.tokenize(text);
      expect(tokens.length).toBe(1);
      expect(tokens[0].type).toBe('number');
      expect(tokens[0].txt).toBe(text);
    });
  });

  it('应该在中文文本中正确识别百分比', () => {
    const text = '商品优惠50%';
    const tokens = tokenizer.tokenize(text);

    expect(tokens.length).toBe(3);
    expect(tokens[0].type).toBe('word');
    expect(tokens[0].txt).toBe('商品');
    expect(tokens[1].type).toBe('word');
    expect(tokens[1].txt).toBe('优惠');
    expect(tokens[2].type).toBe('number');
    expect(tokens[2].txt).toBe('50%');
  });

  it('应该在中文文本中正确识别千分比', () => {
    const text = '返现50‰';
    const tokens = tokenizer.tokenize(text);

    // 允许"返现"作为整体词汇
    expect(tokens.length).toBeGreaterThanOrEqual(2);
    expect(tokens[tokens.length - 1].type).toBe('number');
    expect(tokens[tokens.length - 1].txt).toBe('50‰');
  });

  it('应该在英文文本中正确识别百分比', () => {
    const text = 'discount 50%';
    const tokens = tokenizer.tokenize(text);

    expect(tokens.length).toBe(3);
    expect(tokens[0].type).toBe('word');
    expect(tokens[0].txt).toBe('discount');
    expect(tokens[1].type).toBe('space');
    expect(tokens[1].txt).toBe(' ');
    expect(tokens[2].type).toBe('number');
    expect(tokens[2].txt).toBe('50%');
  });

  it('应该在混合文本中正确识别百分比和千分比', () => {
    const text = '价格上涨了50%，而成本下降了0.5‰';
    const tokens = tokenizer.tokenize(text);

    // 检查是否包含正确的数字token
    const numberTokens = tokens.filter(token => token.type === 'number');
    expect(numberTokens.length).toBe(2);
    expect(numberTokens[0].txt).toBe('50%');
    expect(numberTokens[1].txt).toBe('0.5‰');
  });
});
