import { describe, expect, it } from 'vitest';
import { extractOrigin, isLocalhostUrl } from './localhost';

describe('isLocalhostUrl', () => {
  describe('localhost URLs', () => {
    it('accepts http://localhost', () => {
      expect(isLocalhostUrl('http://localhost')).toBe(true);
    });

    it('accepts https://localhost', () => {
      expect(isLocalhostUrl('https://localhost')).toBe(true);
    });

    it('accepts localhost with port', () => {
      expect(isLocalhostUrl('http://localhost:8080')).toBe(true);
    });

    it('accepts localhost with path', () => {
      expect(isLocalhostUrl('http://localhost:3000/api/users')).toBe(true);
    });
  });

  describe('127.0.0.1 URLs', () => {
    it('accepts http://127.0.0.1', () => {
      expect(isLocalhostUrl('http://127.0.0.1')).toBe(true);
    });

    it('accepts https://127.0.0.1', () => {
      expect(isLocalhostUrl('https://127.0.0.1')).toBe(true);
    });

    it('accepts 127.0.0.1 with port', () => {
      expect(isLocalhostUrl('http://127.0.0.1:3000')).toBe(true);
    });
  });

  describe('non-localhost URLs', () => {
    it('rejects private IP', () => {
      expect(isLocalhostUrl('http://192.168.0.1')).toBe(false);
    });

    it('rejects public domain', () => {
      expect(isLocalhostUrl('http://example.com')).toBe(false);
    });

    it('rejects 127.0.0.2', () => {
      expect(isLocalhostUrl('http://127.0.0.2')).toBe(false);
    });
  });

  describe('invalid inputs', () => {
    it('rejects empty string', () => {
      expect(isLocalhostUrl('')).toBe(false);
    });

    it('rejects malformed URL', () => {
      expect(isLocalhostUrl('not a url')).toBe(false);
    });

    it('rejects localhost without protocol', () => {
      expect(isLocalhostUrl('localhost')).toBe(false);
    });
  });
});

describe('extractOrigin', () => {
  it('extracts origin from localhost URL', () => {
    expect(extractOrigin('http://localhost')).toBe('http://localhost');
  });

  it('preserves port in origin', () => {
    expect(extractOrigin('http://localhost:8080/path')).toBe('http://localhost:8080');
  });

  it('strips default HTTP port', () => {
    expect(extractOrigin('http://localhost:80')).toBe('http://localhost');
  });

  it('strips default HTTPS port', () => {
    expect(extractOrigin('https://localhost:443')).toBe('https://localhost');
  });

  it('strips path and query', () => {
    expect(extractOrigin('http://localhost:3000/path?q=1#hash')).toBe('http://localhost:3000');
  });

  it('extracts origin from private IP', () => {
    expect(extractOrigin('http://192.168.0.1:5173')).toBe('http://192.168.0.1:5173');
  });

  it('throws on malformed URL', () => {
    expect(() => extractOrigin('not a url')).toThrow();
  });
});
