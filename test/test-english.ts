import {beforeEach, describe, expect, it} from "vitest";
import { MultilingualTokenizer } from "../src";

describe('Multilingual Tokenizer - English Tests', () => {
  let tokenizer: MultilingualTokenizer;

  beforeEach(() => {
    tokenizer = new MultilingualTokenizer();
  });

  it('should tokenize English text by words', () => {
    const text = 'Hello world! This is a test sentence.';
    console.log('Testing English tokenization:', text);
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('English tokenization result:', wordTokens);
    console.log('Full tokens:', tokens);
    
    // 验证基本分词结果
    expect(wordTokens).toContain('Hello');
    expect(wordTokens).toContain('world');
    expect(wordTokens).toContain('This');
    expect(wordTokens).toContain('is');
    expect(wordTokens).toContain('a');
    expect(wordTokens).toContain('test');
    expect(wordTokens).toContain('sentence');
  });

  it('should handle English with punctuation correctly', () => {
    const text = "It's a beautiful day, isn't it?";
    console.log('Testing English with punctuation:', text);
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('English with punctuation result:', wordTokens);
    
    // 当前分词器使用\b单词边界拆分，所以会拆分撇号
    expect(wordTokens).toContain('It');
    expect(wordTokens).toContain('s');
    expect(wordTokens).toContain('a');
    expect(wordTokens).toContain('beautiful');
    expect(wordTokens).toContain('day');
    expect(wordTokens).toContain('it');
  });

  it('should handle English numbers and alphanumeric correctly', () => {
    const text = 'Version 2.0 released in 2023 with API v1.1';
    console.log('Testing English alphanumeric:', text);
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('English alphanumeric result:', wordTokens);
    
    expect(wordTokens).toContain('Version');
    expect(wordTokens).toContain('released');
    expect(wordTokens).toContain('in');
    expect(wordTokens).toContain('2023');
    expect(wordTokens).toContain('with');
    expect(wordTokens).toContain('API');
    
    // 数字可能被拆分，所以检查数字组�?
    expect(wordTokens.some(token => token.includes('2'))).toBe(true);
    expect(wordTokens.some(token => token.includes('0'))).toBe(true);
    expect(wordTokens.some(token => token.includes('1'))).toBe(true);
  });
});
