import { beforeEach, describe, expect, it } from "vitest";
import { MultilingualTokenizer } from "../src";

describe('Multilingual Tokenizer - Chinese Tests', () => {
  let tokenizer: MultilingualTokenizer;

  beforeEach(() => {
    tokenizer = new MultilingualTokenizer();
  });

  it('should tokenize Chinese text by natural words', () => {
    const text = '我爱北京天安门，天安门上太阳升。';
    console.log('Testing Chinese tokenization:', text);
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('Chinese tokenization result:', wordTokens);
    console.log('Full tokens:', tokens);
    
    // 验证基本分词结果（具体结果可能因浏览器实现略有不同）
    expect(wordTokens.length).toBeGreaterThan(0);
    expect(tokens.some(token => token.lang === 'zh')).toBe(true);
    // 验证包含基本词汇
    expect(wordTokens.some(token => token.includes('我'))).toBe(true);
    expect(wordTokens.some(token => token.includes('爱'))).toBe(true);
    expect(wordTokens.some(token => token.includes('北京'))).toBe(true);
    expect(wordTokens.some(token => token.includes('天安门'))).toBe(true);
  });

  it('should support custom dictionary for Chinese', () => {
    const text = '我爱人工智能技术';
    console.log('Testing custom dictionary for Chinese:', text);
    
    // 添加自定义词
    tokenizer.addCustomDictionary(['人工智能', '技术'], 'zh', 100, 'custom');
    tokenizer.addCustomDictionary(['技术'], 'zh', 50, 'custom2');
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('Chinese tokenization with custom dictionary:', wordTokens);
    console.log('Full tokens:', tokens);
    
    // 验证自定义词被正确识别
    expect(wordTokens).toContain('人工智能');
  });

  it('should handle complex Chinese sentences', () => {
    const text = '中华人民共和国成立于1949年10月1日，是世界上最大的发展中国家。';
    console.log('Testing complex Chinese:', text);
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('Complex Chinese tokenization result:', wordTokens);
    
    expect(wordTokens.length).toBeGreaterThan(0);
    expect(tokens.some(token => token.lang === 'zh')).toBe(true);
    // 检查是否包含国家相关的词汇组件
    expect(wordTokens.some(token => token.includes('中华'))).toBe(true);
    expect(wordTokens.some(token => token.includes('人民'))).toBe(true);
    expect(wordTokens.some(token => token.includes('共和国'))).toBe(true);
  });
});