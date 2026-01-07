import { beforeEach, describe, expect, it } from "vitest";
import { OldMultilingualTokenizer } from "../src";

describe('Multilingual Tokenizer - Specific Words Tests', () => {
  let tokenizer: OldMultilingualTokenizer;

  beforeEach(() => {
    tokenizer = new OldMultilingualTokenizer();
  });

  it('should correctly tokenize specific Chinese words with numbers', () => {
    const text = '这是测试文本下行傻13想多了恶女权贵0佣金霸道这是测试文本';
    console.log('Input text:', text);

    // 添加用户提到的特定词汇到最高优先级词库
    const problemWords = ['下行', '傻13', '想多了', '恶女', '权贵', '0佣金', '霸道'];
    tokenizer.addDictionary(problemWords, 'high_prio_dict', 1000, 'zh');

    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);

    console.log('Word tokens:', wordTokens);
    console.log('Full tokens with all fields:');
    tokens.forEach((token, index) => {
      console.log(`  Token ${index + 1}: Text="${token.txt}", Type=${token.type}, Language=${token.lang}`);
    });

    // 验证所有问题词汇都被正确识别为一个单词
    problemWords.forEach(word => {
      expect(wordTokens).toContain(word);
    });
  });

  it('should handle mixed text with specific words', () => {
    const text = '我需要处理下行数据，不要傻13一样想多了，恶女权贵都喜欢0佣金的霸道服务';
    console.log('Input text:', text);

    // 添加特定词汇到词库
    const problemWords = ['下行', '傻13', '想多了', '恶女', '权贵', '0佣金', '霸道'];
    tokenizer.addDictionary(problemWords, 'high_prio_dict', 1000, 'zh');

    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);

    console.log('Word tokens:', wordTokens);

    // 验证特定词汇在句子中也能被正确识别
    expect(wordTokens).toContain('下行');
    expect(wordTokens).toContain('傻13');
    expect(wordTokens).toContain('想多了');
    expect(wordTokens).toContain('恶女');
    expect(wordTokens).toContain('权贵');
    expect(wordTokens).toContain('0佣金');
    expect(wordTokens).toContain('霸道');
  });

  it('should still correctly identify normal numbers', () => {
    const text = '这是一个数字123，这是另一个数字45.67，这是百分比89%';
    console.log('Input text:', text);

    const tokens = tokenizer.tokenize(text);
    const numberTokens = tokens.filter(token => token.type === 'number').map(token => token.txt);

    console.log('Number tokens:', numberTokens);

    // 验证正常数字仍然被正确识别
    expect(numberTokens).toContain('123');
    expect(numberTokens).toContain('45.67');
    expect(numberTokens).toContain('89%');
  });
});
