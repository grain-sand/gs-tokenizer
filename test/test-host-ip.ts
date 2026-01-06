import { describe, it, expect, beforeEach } from 'vitest';
import { MultilingualTokenizer } from '../src';

describe('Host and IP Tokenization', () => {
  let tokenizer: MultilingualTokenizer;

  beforeEach(() => {
    tokenizer = new MultilingualTokenizer();
  });

  describe('Host Tokenization', () => {
    it('should recognize hostnames', () => {
      const text = 'Visit www.example.com for more information.';
      const tokens = tokenizer.tokenize(text);

      const hostToken = tokens.find(token => token.type === 'host');
      expect(hostToken).toBeDefined();
      expect(hostToken?.txt).toBe('www.example.com');
      expect(hostToken?.lang).toBe('en');
    });

    it('should recognize hostnames with ports', () => {
      const text = 'Check out api.example.com:8080';
      const tokens = tokenizer.tokenize(text);

      const hostToken = tokens.find(token => token.type === 'host');
      expect(hostToken).toBeDefined();
      expect(hostToken?.txt).toBe('api.example.com:8080');
    });

    it('should recognize localhost', () => {
      const text = 'The website is localhost';
      const tokens = tokenizer.tokenize(text);

      const hostToken = tokens.find(token => token.type === 'host');
      expect(hostToken).toBeDefined();
      expect(hostToken?.txt).toBe('localhost');
    });

    it('should recognize localhost with port', () => {
      const text = 'Local server at localhost:3000有中文';
      const tokens = tokenizer.tokenize(text);

      const hostToken = tokens.find(token => token.type === 'host');
      expect(hostToken).toBeDefined();
      expect(hostToken?.txt).toBe('localhost:3000');
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
      const text = 'Server at 192.168.1.1:8080是不是';
      const tokens = tokenizer.tokenize(text);

      const ipToken = tokens.find(token => token.type === 'ip');
      expect(ipToken).toBeDefined();
      expect(ipToken?.txt).toBe('192.168.1.1:8080');
    });
  });

  describe('Mixed Content Tokenization', () => {
    it('should handle text with multiple hosts and IPs', () => {
      const text = 'Visit example.com:8080, 192.168.1.1, and test.org for more info.';
      const tokens = tokenizer.tokenize(text);

      const hostTokens = tokens.filter(token => token.type === 'host');
      const ipTokens = tokens.filter(token => token.type === 'ip');

      expect(hostTokens).toHaveLength(2);
      expect(ipTokens).toHaveLength(1);
      expect(hostTokens[0]?.txt).toBe('example.com:8080');
      expect(ipTokens[0]?.txt).toBe('192.168.1.1');
      expect(hostTokens[1]?.txt).toBe('test.org');
    });

    it('should handle hosts with subdomains', () => {
      const text = 'Check this: api.example.com';
      const tokens = tokenizer.tokenize(text);

      const hostToken = tokens.find(token => token.type === 'host');
      expect(hostToken).toBeDefined();
      expect(hostToken?.txt).toBe('api.example.com');
    });

    it('should handle hosts in different languages', () => {
      const text = '访问 zh.wikipedia.org 了解更多。';
      const tokens = tokenizer.tokenize(text);

      const hostToken = tokens.find(token => token.type === 'host');
      expect(hostToken).toBeDefined();
      expect(hostToken?.txt).toBe('zh.wikipedia.org');
      expect(hostToken?.type).toBe('host');
    });
  });

  // 测试tokenizeText方法是否包含Host和IP
  it('should include Hosts and IPs in tokenizeText results', () => {
    const text = 'Visit example.com and check 192.168.1.1';
    const result = tokenizer.tokenizeText(text, {
      language: 'en'
    });

    expect(result).toEqual(['Visit', 'example.com', 'and', 'check', '192.168.1.1']);
  });

  // 测试tokenizeText方法的includeTypes选项
  it('should include only specified types with includeTypes option', () => {
    const text = 'Visit example.com:8080 and check 192.168.1.1:8080, 2023-12-31!';
    const result = tokenizer.tokenizeText(text, {
      language: 'en',
      includeTypes: ['host', 'ip']
    });

    expect(result).toEqual(['example.com:8080', '192.168.1.1:8080']);
  });

  // 测试tokenizeText方法的excludeTypes选项
  it('should exclude specified types with excludeTypes option', () => {
    const text = 'Visit example.com and check 192.168.1.1, 2023-12-31!';
    const result = tokenizer.tokenizeText(text, {
      language: 'en',
      excludeTypes: ['host', 'ip']
    });

    expect(result).toEqual(['Visit', 'and', 'check', '2023-12-31']);
  });

  // 测试tokenizeText方法的默认行为包含所有非排除类型
  it('should include all non-excluded types by default', () => {
    const text = 'Visit example.com and check 192.168.1.1, 2023-12-31!';
    const result = tokenizer.tokenizeText(text, {
      language: 'en'
    });

    expect(result).toEqual(['Visit', 'example.com', 'and', 'check', '192.168.1.1', '2023-12-31']);
  });

  // 测试新的tokenizeText方法
  it('should work correctly with new tokenizeText method', () => {
    const text = 'Visit example.com:8080 and check 192.168.1.1:8080, 2023-12-31!';

    // Test with language in options
    const result1 = tokenizer.tokenizeText(text, {
      language: 'en'
    });
    expect(result1).toEqual(['Visit', 'example.com:8080', 'and', 'check', '192.168.1.1:8080', '2023-12-31']);

    // Test with includeTypes
    const result2 = tokenizer.tokenizeText(text, {
      language: 'en',
      includeTypes: ['host', 'ip']
    });
    expect(result2).toEqual(['example.com:8080', '192.168.1.1:8080']);

    // Test with excludeTypes
    const result3 = tokenizer.tokenizeText(text, {
      language: 'en',
      excludeTypes: ['host', 'ip']
    });
    expect(result3).toEqual(['Visit', 'and', 'check', '2023-12-31']);
  });
});
