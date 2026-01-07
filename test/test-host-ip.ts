import { describe, it, expect, beforeEach } from 'vitest';
import { OldMultilingualTokenizer } from '../src';

describe('Host and IP Tokenization', () => {
  let tokenizer: OldMultilingualTokenizer;

  beforeEach(() => {
    tokenizer = new OldMultilingualTokenizer();
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
    const result = tokenizer.tokenizeText(text);

    expect(result).toEqual(['Visit', 'example.com', 'and', 'check', '192.168.1.1']);
  });



  // 测试新的tokenizeText方法
  it('should work correctly with new tokenizeText method', () => {
    const text = 'Visit example.com:8080 and check 192.168.1.1:8080, 2023-12-31!';

    // Test tokenizeText method
    const result = tokenizer.tokenizeText(text);
    expect(result).toContain('example.com:8080');
    expect(result).toContain('192.168.1.1:8080');
  });
});
