import { describe, it, expect, beforeEach } from 'vitest';
import { MultilingualTokenizer, createTokenizer } from '../src';

describe('URL and IP Tokenization', () => {
  let tokenizer: MultilingualTokenizer;

  beforeEach(() => {
    tokenizer = createTokenizer();
  });

  describe('URL Tokenization', () => {
    it('should recognize HTTP URLs', () => {
      const text = 'Visit http://www.example.com for more information.';
      const tokens = tokenizer.tokenize(text);
      
      const urlToken = tokens.find(token => token.type === 'url');
      expect(urlToken).toBeDefined();
      expect(urlToken?.txt).toBe('http://www.example.com');
      expect(urlToken?.lang).toBe('en');
    });

    it('should recognize HTTPS URLs', () => {
      const text = 'Check out https://github.com/grain-sand/gs-multilingual-tokenizer';
      const tokens = tokenizer.tokenize(text);
      
      const urlToken = tokens.find(token => token.type === 'url');
      expect(urlToken).toBeDefined();
      expect(urlToken?.txt).toBe('https://github.com/grain-sand/gs-multilingual-tokenizer');
    });

    it('should recognize URLs without protocol', () => {
      const text = 'The website is www.example.com';
      const tokens = tokenizer.tokenize(text);
      
      const urlToken = tokens.find(token => token.type === 'url');
      expect(urlToken).toBeDefined();
      expect(urlToken?.txt).toBe('www.example.com');
    });

    it('should recognize URLs with paths', () => {
      const text = 'Read the docs at https://example.com/docs/api';
      const tokens = tokenizer.tokenize(text);
      
      const urlToken = tokens.find(token => token.type === 'url');
      expect(urlToken).toBeDefined();
      expect(urlToken?.txt).toBe('https://example.com/docs/api');
    });

    it('should recognize URLs with ports', () => {
      const text = 'Local server at http://localhost:3000';
      const tokens = tokenizer.tokenize(text);
      
      const urlToken = tokens.find(token => token.type === 'url');
      expect(urlToken).toBeDefined();
      expect(urlToken?.txt).toBe('http://localhost:3000');
    });
  });

  describe('IP Address Tokenization', () => {
    it('should recognize IPv4 addresses', () => {
      const text = 'The server is at 192.168.1.1';
      const tokens = tokenizer.tokenize(text);
      
      const ipToken = tokens.find(token => token.type === 'ip');
      expect(ipToken).toBeDefined();
      expect(ipToken?.txt).toBe('192.168.1.1');
      expect(ipToken?.lang).toBe('en');
    });

    it('should recognize loopback IP address', () => {
      const text = 'Localhost is 127.0.0.1';
      const tokens = tokenizer.tokenize(text);
      
      const ipToken = tokens.find(token => token.type === 'ip');
      expect(ipToken).toBeDefined();
      expect(ipToken?.txt).toBe('127.0.0.1');
    });

    it('should recognize IP addresses with ports', () => {
      const text = 'Server at 192.168.1.1:8080';
      const tokens = tokenizer.tokenize(text);
      
      // Note: With current regex, this will be treated as URL
      const urlToken = tokens.find(token => token.type === 'url');
      expect(urlToken).toBeDefined();
      expect(urlToken?.txt).toBe('192.168.1.1:8080');
    });
  });

  describe('Mixed Content Tokenization', () => {
    it('should handle text with multiple URLs and IPs', () => {
      const text = 'Visit https://example.com, 192.168.1.1, and http://test.org for more info.';
      const tokens = tokenizer.tokenize(text);
      
      const urlTokens = tokens.filter(token => token.type === 'url');
      const ipTokens = tokens.filter(token => token.type === 'ip');
      
      expect(urlTokens).toHaveLength(2);
      expect(ipTokens).toHaveLength(1);
      expect(urlTokens[0]?.txt).toBe('https://example.com');
      expect(ipTokens[0]?.txt).toBe('192.168.1.1');
      expect(urlTokens[1]?.txt).toBe('http://test.org');
    });

    it('should handle URLs with special characters in path', () => {
      const text = 'Check this: https://example.com/path?query=value#fragment';
      const tokens = tokenizer.tokenize(text);
      
      const urlToken = tokens.find(token => token.type === 'url');
      expect(urlToken).toBeDefined();
      expect(urlToken?.txt).toBe('https://example.com/path?query=value#fragment');
    });

    it('should handle URLs in different languages', () => {
      const text = '访问 https://zh.wikipedia.org/wiki/中文 了解更多。';
      const tokens = tokenizer.tokenize(text);
      
      const urlToken = tokens.find(token => token.type === 'url');
      expect(urlToken).toBeDefined();
      expect(urlToken?.txt).toBe('https://zh.wikipedia.org/wiki/中文');
      expect(urlToken?.type).toBe('url');
    });
  });
  
  // 测试tokenizeText方法是否包含URL和IP
  it('should include URLs and IPs in tokenizeText results', () => {
    const text = 'Visit https://example.com and check 192.168.1.1';
    const result = tokenizer.tokenizeText(text, {
      language: 'en'
    });
    
    expect(result).toEqual(['Visit', 'https://example.com', 'and', 'check', '192.168.1.1']);
  });
  
  // 测试tokenizeText方法的includeTypes选项
  it('should include only specified types with includeTypes option', () => {
    const text = 'Visit https://example.com and check 192.168.1.1, 2023-12-31!';
    const result = tokenizer.tokenizeText(text, {
      language: 'en',
      includeTypes: ['url', 'ip']
    });
    
    expect(result).toEqual(['https://example.com', '192.168.1.1']);
  });
  
  // 测试tokenizeText方法的excludeTypes选项
  it('should exclude specified types with excludeTypes option', () => {
    const text = 'Visit https://example.com and check 192.168.1.1, 2023-12-31!';
    const result = tokenizer.tokenizeText(text, {
      language: 'en',
      excludeTypes: ['url', 'ip']
    });
    
    expect(result).toEqual(['Visit', 'and', 'check', '2023-12-31']);
  });
  
  // 测试tokenizeText方法的默认行为包含所有非排除类型
  it('should include all non-excluded types by default', () => {
    const text = 'Visit https://example.com and check 192.168.1.1, 2023-12-31!';
    const result = tokenizer.tokenizeText(text, {
      language: 'en'
    });
    
    expect(result).toEqual(['Visit', 'https://example.com', 'and', 'check', '192.168.1.1', '2023-12-31']);
  });
  
  // 测试新的tokenizeText方法
  it('should work correctly with new tokenizeText method', () => {
    const text = 'Visit https://example.com and check 192.168.1.1, 2023-12-31!';
    
    // Test with language in options
    const result1 = tokenizer.tokenizeText(text, {
      language: 'en'
    });
    expect(result1).toEqual(['Visit', 'https://example.com', 'and', 'check', '192.168.1.1', '2023-12-31']);

    // Test with includeTypes
    const result2 = tokenizer.tokenizeText(text, {
      language: 'en',
      includeTypes: ['url', 'ip']
    });
    expect(result2).toEqual(['https://example.com', '192.168.1.1']);

    // Test with excludeTypes
    const result3 = tokenizer.tokenizeText(text, {
      language: 'en',
      excludeTypes: ['url', 'ip']
    });
    expect(result3).toEqual(['Visit', 'and', 'check', '2023-12-31']);
  });
});