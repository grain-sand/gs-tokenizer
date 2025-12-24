import { beforeEach, describe, expect, it } from "vitest";
import { MultilingualTokenizer } from "../src/core";

describe('Multilingual Tokenizer - Custom Dictionary Tests', () => {
  let tokenizer: MultilingualTokenizer;

  beforeEach(() => {
    tokenizer = new MultilingualTokenizer();
  });

  describe('Basic Custom Dictionary Operations', () => {
    it('should add and use custom dictionary for Chinese', () => {
      const text = '我爱人工智能技术';
      console.log('\n=== Testing basic custom dictionary for Chinese ===');
      console.log('Input text:', text);
      
      tokenizer.addCustomDictionary(['人工智能', '技术'], 'zh', 100, 'tech_dict');
      
      const tokens = tokenizer.tokenize(text);
      const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
      
      console.log('Word tokens:', wordTokens);
      console.log('\nFull tokens with all fields:');
      tokens.forEach((token, index) => {
        console.log(`  Token ${index + 1}: Text="${token.txt}", Type=${token.type}, Language=${token.lang}, Source=${token.src}`);
      });
      
      // 验证词库结构
      const tokenizerInstance = tokenizer as any;
      const zhDictionaries = tokenizerInstance.customDictionaries['zh'];
      console.log('\nCustom dictionary structure:');
      zhDictionaries.forEach((dict: any) => {
        console.log(`  Dictionary: ${dict.name}, Language: zh, Priority: ${dict.priority}`);
        console.log(`    Words: ${Array.from(dict.data).join(', ')}`);
      });
      
      expect(wordTokens).toContain('人工智能');
      expect(wordTokens).toContain('技术');
    });

    it('should add and use custom dictionary for English', () => {
      const text = 'I love machine learning and deep learning';
      console.log('\n=== Testing basic custom dictionary for English ===');
      console.log('Input text:', text);
      
      tokenizer.addCustomDictionary(['machine learning', 'deep learning'], 'en', 100, 'tech_dict');
      
      const tokens = tokenizer.tokenize(text);
      const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
      
      console.log('Word tokens:', wordTokens);
      console.log('\nFull tokens with all fields:');
      tokens.forEach((token, index) => {
        console.log(`  Token ${index + 1}: Text="${token.txt}", Type=${token.type}, Language=${token.lang}, Source=${token.src}`);
      });
      
      // 验证词库结构
      const tokenizerInstance = tokenizer as any;
      const enDictionaries = tokenizerInstance.customDictionaries['en'];
      console.log('\nCustom dictionary structure:');
      if (enDictionaries) {
        enDictionaries.forEach((dict: any) => {
          console.log(`  Dictionary: ${dict.name}, Language: en, Priority: ${dict.priority}`);
          console.log(`    Words: ${Array.from(dict.data).join(', ')}`);
        });
      }
      
      expect(enDictionaries).toBeDefined();
      expect(enDictionaries.length).toBe(1);
      expect(Array.from(enDictionaries[0].data)).toContain('machine learning');
    });
  });

  describe('Dictionary Merging Logic', () => {
    it('should merge dictionaries with same name, language, and priority', () => {
      const text = '我爱人工智能和自然语言处理';
      console.log('\n=== Testing dictionary merging with same name, language, and priority ===');
      console.log('Input text:', text);
      
      // 添加第一个词库
      tokenizer.addCustomDictionary(['人工智能'], 'zh', 100, 'tech_dict');
      // 添加同名同语言同优先级的词库- 应该合并
      tokenizer.addCustomDictionary(['自然语言处理'], 'zh', 100, 'tech_dict');
      
      // 执行分词
      const tokens = tokenizer.tokenize(text);
      const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
      
      console.log('Word tokens after merging:', wordTokens);
      console.log('\nFull tokens with all fields:');
      tokens.forEach((token, index) => {
        console.log(`  Token ${index + 1}: Text="${token.txt}", Type=${token.type}, Language=${token.lang}, Source=${token.src}`);
      });
      
      const tokenizerInstance = tokenizer as any;
      const zhDictionaries = tokenizerInstance.customDictionaries['zh'];
      
      console.log('\nChinese custom dictionaries after merging:');
      zhDictionaries.forEach((dict: any) => {
        console.log(`  Dictionary: ${dict.name}, Language: zh, Priority: ${dict.priority}`);
        console.log(`    Words: ${Array.from(dict.data).join(', ')}`);
      });
      
      // 应该只有一个tech_dict词库，包含两个词
      expect(zhDictionaries.length).toBe(1);
      expect(zhDictionaries[0].name).toBe('tech_dict');
      expect(zhDictionaries[0].priority).toBe(100);
      expect(Array.from(zhDictionaries[0].data)).toEqual(expect.arrayContaining(['人工智能', '自然语言处理']));
      expect(Array.from(zhDictionaries[0].data).length).toBe(2);
    });

    it('should not merge dictionaries with same name and language but different priority', () => {
      const text = '我爱人工智能和深度学习';
      console.log('\n=== Testing dictionary merging with same name and language but different priority ===');
      console.log('Input text:', text);
      
      // 添加第一个词库（优先级100）
      tokenizer.addCustomDictionary(['人工智能'], 'zh', 100, 'tech_dict');
      // 添加同名同语言不同优先级的词库 - 不应该合并
      tokenizer.addCustomDictionary(['深度学习'], 'zh', 200, 'tech_dict');
      
      // 执行分词
      const tokens = tokenizer.tokenize(text);
      const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
      
      console.log('Word tokens with different priorities:', wordTokens);
      console.log('\nFull tokens with all fields:');
      tokens.forEach((token, index) => {
        console.log(`  Token ${index + 1}: Text="${token.txt}", Type=${token.type}, Language=${token.lang}, Source=${token.src}`);
      });
      
      const tokenizerInstance = tokenizer as any;
      const zhDictionaries = tokenizerInstance.customDictionaries['zh'];
      
      console.log('\nChinese custom dictionaries with different priorities:');
      zhDictionaries.forEach((dict: any) => {
        console.log(`  Dictionary: ${dict.name}, Language: zh, Priority: ${dict.priority}`);
        console.log(`    Words: ${Array.from(dict.data).join(', ')}`);
      });
      
      // 应该有两个tech_dict词库，分别对应不同优先级
      expect(zhDictionaries.length).toBe(2);
      
      const dict100 = zhDictionaries.find((dict: any) => dict.priority === 100);
      const dict200 = zhDictionaries.find((dict: any) => dict.priority === 200);
      
      expect(dict100).toBeDefined();
      expect(dict200).toBeDefined();
      expect(Array.from(dict100.data)).toContain('人工智能');
      expect(Array.from(dict200.data)).toContain('深度学习');
    });

    it('should not merge dictionaries with same name and priority but different language', () => {
      const text = '我爱人工智能 (Artificial Intelligence)';
      console.log('\n=== Testing dictionary merging with same name and priority but different language ===');
      console.log('Input text:', text);
      
      // 添加中文词库
      tokenizer.addCustomDictionary(['人工智能'], 'zh', 100, 'tech_dict');
      // 添加同名同优先级的英文词库- 不应该合并
      tokenizer.addCustomDictionary(['artificial intelligence'], 'en', 100, 'tech_dict');
      
      // 执行分词
      const tokens = tokenizer.tokenize(text);
      console.log('\nFull tokens with all fields:');
      tokens.forEach((token, index) => {
        console.log(`  Token ${index + 1}: Text="${token.txt}", Type=${token.type}, Language=${token.lang}, Source=${token.src}`);
      });
      
      const tokenizerInstance = tokenizer as any;
      const zhDictionaries = tokenizerInstance.customDictionaries['zh'];
      const enDictionaries = tokenizerInstance.customDictionaries['en'];
      
      console.log('\nChinese custom dictionaries:');
      zhDictionaries.forEach((dict: any) => {
        console.log(`  Dictionary: ${dict.name}, Language: zh, Priority: ${dict.priority}`);
        console.log(`    Words: ${Array.from(dict.data).join(', ')}`);
      });
      
      console.log('\nEnglish custom dictionaries:');
      enDictionaries.forEach((dict: any) => {
        console.log(`  Dictionary: ${dict.name}, Language: en, Priority: ${dict.priority}`);
        console.log(`    Words: ${Array.from(dict.data).join(', ')}`);
      });
      
      // 应该分别在不同语言的词库中
      expect(zhDictionaries.length).toBe(1);
      expect(enDictionaries.length).toBe(1);
      expect(Array.from(zhDictionaries[0].data)).toContain('人工智能');
      expect(Array.from(enDictionaries[0].data)).toContain('artificial intelligence');
    });

    it('should not merge dictionaries with same language and priority but different name', () => {
      const text = '我爱人工智能和机器学习';
      console.log('\n=== Testing dictionary merging with same language and priority but different name ===');
      console.log('Input text:', text);
      
      // 添加第一个词库
      tokenizer.addCustomDictionary(['人工智能'], 'zh', 100, 'tech_dict1');
      // 添加同语言同优先级不同名称的词库 - 不应该合并
      tokenizer.addCustomDictionary(['机器学习'], 'zh', 100, 'tech_dict2');
      
      // 执行分词
      const tokens = tokenizer.tokenize(text);
      const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
      
      console.log('Word tokens with different dictionary names:', wordTokens);
      console.log('\nFull tokens with all fields:');
      tokens.forEach((token, index) => {
        console.log(`  Token ${index + 1}: Text="${token.txt}", Type=${token.type}, Language=${token.lang}, Source=${token.src}`);
      });
      
      const tokenizerInstance = tokenizer as any;
      const zhDictionaries = tokenizerInstance.customDictionaries['zh'];
      
      console.log('\nChinese custom dictionaries with different names:');
      zhDictionaries.forEach((dict: any) => {
        console.log(`  Dictionary: ${dict.name}, Language: zh, Priority: ${dict.priority}`);
        console.log(`    Words: ${Array.from(dict.data).join(', ')}`);
      });
      
      // 应该有两个不同名称的词库
      expect(zhDictionaries.length).toBe(2);
      
      const dict1 = zhDictionaries.find((dict: any) => dict.name === 'tech_dict1');
      const dict2 = zhDictionaries.find((dict: any) => dict.name === 'tech_dict2');
      
      expect(dict1).toBeDefined();
      expect(dict2).toBeDefined();
      expect(Array.from(dict1.data)).toContain('人工智能');
      expect(Array.from(dict2.data)).toContain('机器学习');
    });
  });

  describe('Multiple Dictionaries Priority Tests', () => {
    it('should respect dictionary priorities when tokenizing', () => {
      const text = '我爱自然语言处理技术';
      console.log('\n=== Testing dictionary priorities ===');
      console.log('Input text:', text);
      
      // 添加低优先级词库
      tokenizer.addCustomDictionary(['自然语言', '处理技术'], 'zh', 50, 'low_prio_dict');
      // 添加高优先级词库
      tokenizer.addCustomDictionary(['自然语言处理', '技术'], 'zh', 150, 'high_prio_dict');
      
      const tokens = tokenizer.tokenize(text);
      const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
      
      console.log('Word tokens with priority consideration:', wordTokens);
      console.log('\nFull tokens with all fields:');
      tokens.forEach((token, index) => {
        console.log(`  Token ${index + 1}: Text="${token.txt}", Type=${token.type}, Language=${token.lang}, Source=${token.src}`);
      });
      
      const tokenizerInstance = tokenizer as any;
      const zhDictionaries = tokenizerInstance.customDictionaries['zh'];
      
      console.log('\nChinese custom dictionaries with priorities:');
      zhDictionaries.forEach((dict: any) => {
        console.log(`  Dictionary: ${dict.name}, Language: zh, Priority: ${dict.priority}`);
        console.log(`    Words: ${Array.from(dict.data).join(', ')}`);
      });
      
      // 高优先级的词应该优先匹配
      expect(wordTokens).toContain('自然语言处理');
      expect(wordTokens).toContain('技术');
    });

    it('should handle overlapping words from different dictionaries', () => {
      const text = '我爱人工智能技术发展';
      console.log('\n=== Testing overlapping words from different dictionaries ===');
      console.log('Input text:', text);
      
      // 添加不同优先级的词库，包含重叠词
      tokenizer.addCustomDictionary(['人工智能', '技术发展'], 'zh', 100, 'dict1');
      tokenizer.addCustomDictionary(['智能技术', '技术'], 'zh', 200, 'dict2');
      
      const tokens = tokenizer.tokenize(text);
      const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
      
      console.log('Word tokens with overlapping words:', wordTokens);
      console.log('\nFull tokens with all fields:');
      tokens.forEach((token, index) => {
        console.log(`  Token ${index + 1}: Text="${token.txt}", Type=${token.type}, Language=${token.lang}, Source=${token.src}`);
      });
      
      // 检查是否包含预期的词
      expect(wordTokens).toContain('人工智能');
      expect(wordTokens).toContain('技术发展');
    });
  });
});