import { describe, expect, it } from 'vitest';
import {
  buildPortScopedOrigins,
  extractPortFromUrl,
  isLocalDevUrl,
  originsToHostPatterns,
  originsToUrlPatterns,
} from './local-dev';

describe('isLocalDevUrl', () => {
  it('accepts localhost URL', () => {
    expect(isLocalDevUrl('http://localhost:3000')).toBe(true);
  });

  it('accepts 127.0.0.1 URL', () => {
    expect(isLocalDevUrl('http://127.0.0.1:8080')).toBe(true);
  });

  it('accepts private IP URL', () => {
    expect(isLocalDevUrl('http://192.168.0.2:5173')).toBe(true);
  });

  it('accepts private IP with path', () => {
    expect(isLocalDevUrl('http://192.168.0.2:5173/signup')).toBe(true);
  });

  it('rejects public domain', () => {
    expect(isLocalDevUrl('http://example.com')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isLocalDevUrl('')).toBe(false);
  });

  it('rejects malformed URL', () => {
    expect(isLocalDevUrl('not a url')).toBe(false);
  });
});

describe('extractPortFromUrl', () => {
  it('extracts non-default port', () => {
    expect(extractPortFromUrl('http://localhost:5173')).toBe('5173');
  });

  it('returns empty string for default HTTP port', () => {
    expect(extractPortFromUrl('http://localhost:80')).toBe('');
  });

  it('returns empty string for default HTTPS port', () => {
    expect(extractPortFromUrl('https://localhost:443')).toBe('');
  });

  it('returns empty string when no port specified', () => {
    expect(extractPortFromUrl('http://localhost')).toBe('');
  });

  it('extracts port from private IP URL', () => {
    expect(extractPortFromUrl('http://192.168.0.2:5173/signup')).toBe('5173');
  });

  it('returns null for malformed URL', () => {
    expect(extractPortFromUrl('not a url')).toBe(null);
  });
});

describe('buildPortScopedOrigins', () => {
  describe('localhost only (no private IPs)', () => {
    it('builds origins with port', () => {
      const result = buildPortScopedOrigins('5173', []);

      expect(result.portOrigins).toEqual([
        'http://localhost:5173',
        'https://localhost:5173',
        'http://127.0.0.1:5173',
        'https://127.0.0.1:5173',
      ]);
    });

    it('builds cookie origins without port', () => {
      const result = buildPortScopedOrigins('5173', []);

      expect(result.cookieOrigins).toEqual([
        'http://localhost',
        'https://localhost',
        'http://127.0.0.1',
        'https://127.0.0.1',
      ]);
    });

    it('builds URL patterns with wildcard', () => {
      const result = buildPortScopedOrigins('5173', []);

      expect(result.portUrlPatterns).toEqual([
        'http://localhost:5173/*',
        'https://localhost:5173/*',
        'http://127.0.0.1:5173/*',
        'https://127.0.0.1:5173/*',
      ]);
    });

    it('omits port suffix for empty port string', () => {
      const result = buildPortScopedOrigins('', []);

      expect(result.portOrigins).toEqual([
        'http://localhost',
        'https://localhost',
        'http://127.0.0.1',
        'https://127.0.0.1',
      ]);
    });
  });

  describe('with private IP hostnames', () => {
    it('includes private IPs in port origins', () => {
      const result = buildPortScopedOrigins('5173', ['192.168.0.2']);

      expect(result.portOrigins).toContain('http://192.168.0.2:5173');
      expect(result.portOrigins).toContain('https://192.168.0.2:5173');
    });

    it('includes private IPs in cookie origins without port', () => {
      const result = buildPortScopedOrigins('5173', ['192.168.0.2']);

      expect(result.cookieOrigins).toContain('http://192.168.0.2');
      expect(result.cookieOrigins).toContain('https://192.168.0.2');
    });

    it('includes private IPs in URL patterns', () => {
      const result = buildPortScopedOrigins('5173', ['192.168.0.2']);

      expect(result.portUrlPatterns).toContain('http://192.168.0.2:5173/*');
      expect(result.portUrlPatterns).toContain('https://192.168.0.2:5173/*');
    });

    it('handles multiple private IPs', () => {
      const result = buildPortScopedOrigins('8080', ['192.168.0.1', '192.168.0.2']);

      expect(result.portOrigins).toHaveLength(8); // (2 localhost + 2 IPs) × 2 protocols
      expect(result.portOrigins).toContain('http://192.168.0.1:8080');
      expect(result.portOrigins).toContain('http://192.168.0.2:8080');
    });
  });
});

describe('originsToUrlPatterns', () => {
  it('appends /* to each origin', () => {
    expect(originsToUrlPatterns(['http://localhost'])).toEqual(['http://localhost/*']);
  });

  it('handles multiple origins', () => {
    expect(originsToUrlPatterns(['http://localhost', 'https://127.0.0.1:8080'])).toEqual([
      'http://localhost/*',
      'https://127.0.0.1:8080/*',
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(originsToUrlPatterns([])).toEqual([]);
  });
});

describe('originsToHostPatterns', () => {
  it('converts origins to host patterns', () => {
    expect(originsToHostPatterns(['http://localhost'])).toEqual(['http://localhost/*']);
  });

  it('strips port from patterns', () => {
    expect(originsToHostPatterns(['http://localhost:8080'])).toEqual(['http://localhost/*']);
  });

  it('deduplicates same-host origins with different ports', () => {
    const result = originsToHostPatterns([
      'http://localhost:8080',
      'http://localhost:3000',
    ]);
    expect(result).toEqual(['http://localhost/*']);
  });

  it('preserves different protocols as separate patterns', () => {
    const result = originsToHostPatterns(['http://localhost', 'https://localhost']);
    expect(result).toEqual(['http://localhost/*', 'https://localhost/*']);
  });

  it('skips invalid origins', () => {
    const result = originsToHostPatterns(['http://localhost', 'invalid', 'https://127.0.0.1']);
    expect(result).toEqual(['http://localhost/*', 'https://127.0.0.1/*']);
  });

  it('returns empty array for empty input', () => {
    expect(originsToHostPatterns([])).toEqual([]);
  });

  it('returns empty array for all invalid origins', () => {
    expect(originsToHostPatterns(['invalid', '', 'not-a-url'])).toEqual([]);
  });
});
