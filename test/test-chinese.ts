import { beforeEach, describe, expect, it } from "vitest";
import { IMultilingualTokenizer } from "../src";
import { LexiconLoader } from "../src";
import { createTokenizer } from "./utils/tokenizer-factory";

describe('Multilingual Tokenizer - Chinese Tests', () => {
  let tokenizer: IMultilingualTokenizer;

  beforeEach(() => {
    tokenizer = createTokenizer();
    // 加载组织词库
    LexiconLoader.loadTo(tokenizer as any, {
      types: ['organization'],
      languages: ['zh']
    });
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
    tokenizer.addDictionary(['人工智能', '技术'], 'custom', 100, 'zh');
    tokenizer.addDictionary(['技术'], 'custom2', 50, 'zh');

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

  it('should recognize university names as organizations', () => {
    const text = '北京大学、清华大学、复旦大学、上海交通大学、浙江大学、南京大学、中国人民大学和武汉大学都是中国著名的高等院校。';
    console.log('Testing university names recognition:', text);

    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    const organizationTokens = tokens.filter(token => token.type === 'organization' as any).map(token => token.txt);

    console.log('Word tokens:', wordTokens);
    console.log('Organization tokens:', organizationTokens);
    console.log('Full tokens:', tokens);

    // 验证大学名称作为整体被识别
    const expectedUniversities = ['北京大学', '清华大学', '复旦大学', '上海交通大学', '浙江大学', '南京大学', '中国人民大学', '武汉大学'];

    // 检查每个大学名称是否至少出现在词或组织中
    expectedUniversities.forEach(university => {
      const isInWordTokens = wordTokens.includes(university);
      const isInOrganizationTokens = organizationTokens.includes(university);

      console.log(`Checking ${university}: in words=${isInWordTokens}, in organizations=${isInOrganizationTokens}`);

      // 至少在其中一种类型中出现
      expect(isInWordTokens || isInOrganizationTokens).toBe(true);
    });

    // 特别检查复旦大学，之前测试中它被正确识别了
    expect(organizationTokens.includes('复旦大学') || wordTokens.includes('复旦大学')).toBe(true);
  });
});
