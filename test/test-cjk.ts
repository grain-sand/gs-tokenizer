import {beforeEach, describe, expect, it} from "vitest";
import { MultilingualTokenizer } from "../src/core";

// const console = (top as any).console;

describe('Multilingual Tokenizer - CJK Tests', () => {
  let tokenizer: MultilingualTokenizer;

  beforeEach(() => {
    tokenizer = new MultilingualTokenizer();
  });

  describe('Chinese Tests', () => {
    it('should tokenize Chinese text by natural words', () => {
      const text = '我爱北京天安门，天安门上太阳升。';
      const tokens = tokenizer.tokenize(text);
      const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
      
      console.log('Chinese tokenization result:', wordTokens);
      console.log('Full tokens:', tokens);
      
      // 验证基本分词结果（具体结果可能因浏览器实现略有不同）
      expect(wordTokens.length).toBeGreaterThan(0);
      expect(tokens.some(token => token.lang === 'zh')).toBe(true);
      // 验证包含基本词汇
      expect(wordTokens.some(token => token.includes('北京'))).toBe(true);
      expect(wordTokens.some(token => token.includes('天安门'))).toBe(true);
    });

    it('should support custom dictionary for Chinese', () => {
      const text = '我爱人工智能技术';
      console.log('Testing custom dictionary for Chinese:', text);
      
      // 添加自定义词
      tokenizer.addCustomDictionary(['人工智能', '技术'], 'zh', 100, 'custom');
      
      const tokens = tokenizer.tokenize(text);
      const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
      
      console.log('Chinese tokenization with custom dictionary:', wordTokens);
      console.log('Full tokens:', tokens);
      
      // 验证自定义词被正确识别
      expect(wordTokens).toContain('人工智能');
    });

    it('should handle multiple custom dictionaries with priority and merging logic', () => {
      const text = '我爱人工智能和机器学习技术';
      console.log('\nTesting multiple custom dictionaries:', text);
      
      // 添加多个自定义词库
      // 同名同语言不同优先级- 应该分别存在
      tokenizer.addCustomDictionary(['人工智能', '机器学习'], 'zh', 100, 'tech_dict');
      tokenizer.addCustomDictionary(['深度学习'], 'zh', 200, 'tech_dict'); // 同名同语言不同优先级
      
      // 同名不同语言 - 应该分别存在
      tokenizer.addCustomDictionary(['人工智能'], 'en', 100, 'tech_dict');
      
      const tokens = tokenizer.tokenize(text);
      const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
      
      console.log('Chinese tokenization with multiple custom dictionaries:', wordTokens);
      console.log('Full tokens:', tokens);
      
      // 验证分词结果
      expect(wordTokens.length).toBeGreaterThan(0);
      expect(wordTokens).toContain('人工智能');
      expect(wordTokens).toContain('机器学习');
      
      // 验证词库结构
      const tokenizerInstance = tokenizer as any;
      const zhDictionaries = tokenizerInstance.customDictionaries['zh'];
      const enDictionaries = tokenizerInstance.customDictionaries['en'];
      
      expect(zhDictionaries.length).toBe(2); // 两个不同优先级的中文词库
      expect(enDictionaries.length).toBe(1); // 一个英文词库
    });
  });

  describe('Japanese Tests', () => {
    it('should tokenize Japanese text by natural words', () => {
      const text = 'こんにちは世界！私は日本人です。';
      console.log('\nTesting Japanese tokenization:', text);
      
      const tokens = tokenizer.tokenize(text);
      const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
      
      console.log('Japanese tokenization result:', wordTokens);
      console.log('Full tokens:', tokens);
      
      // 验证基本分词结果
      expect(wordTokens.length).toBeGreaterThan(0);
      expect(tokens.some(token => token.lang === 'ja')).toBe(true);
    });

    it('should support custom dictionary for Japanese', () => {
      const text = '私は人工知能が好きです。';
      console.log('\nTesting custom dictionary for Japanese:', text);
      
      // 添加自定义词
      tokenizer.addCustomDictionary(['人工知能'], 'ja', 100, 'custom');
      
      const tokens = tokenizer.tokenize(text);
      const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
      
      console.log('Japanese tokenization with custom dictionary:', wordTokens);
      console.log('Full tokens:', tokens);
      
      // 验证自定义词被正确识别
      expect(wordTokens).toContain('人工知能');
    });
  });

  describe('Korean Tests', () => {
    it('should tokenize Korean text by natural words', () => {
      const text = '안녕하세요 세계! 저는 한국인입니다.';
      console.log('\nTesting Korean tokenization:', text);
      
      const tokens = tokenizer.tokenize(text);
      const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
      
      console.log('Korean tokenization result:', wordTokens);
      console.log('Full tokens:', tokens);
      
      // 验证基本分词结果
      expect(wordTokens.length).toBeGreaterThan(0);
      expect(tokens.some(token => token.lang === 'ko')).toBe(true);
    });

    it('should support custom dictionary for Korean', () => {
      const text = '저는 인공지능을 좋아합니다.';
      console.log('\nTesting custom dictionary for Korean:', text);
      
      // 添加自定义词
      tokenizer.addCustomDictionary(['인공지능'], 'ko', 100, 'custom');
      
      const tokens = tokenizer.tokenize(text);
      const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
      
      console.log('Korean tokenization with custom dictionary:', wordTokens);
      console.log('Full tokens:', tokens);
      
      // 验证自定义词被正确识别（考虑韩语格助词）
      expect(wordTokens.some(token => token.includes('인공지능'))).toBe(true);
    });
  });
});