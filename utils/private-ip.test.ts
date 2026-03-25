import { describe, expect, it } from 'vitest';
import { isPrivateIpHostname, isPrivateIpUrl } from './private-ip';

describe('isPrivateIpHostname', () => {
  describe('valid private IPs', () => {
    it('accepts 192.168.0.0', () => {
      expect(isPrivateIpHostname('192.168.0.0')).toBe(true);
    });

    it('accepts 192.168.0.1', () => {
      expect(isPrivateIpHostname('192.168.0.1')).toBe(true);
    });

    it('accepts 192.168.0.255', () => {
      expect(isPrivateIpHostname('192.168.0.255')).toBe(true);
    });

    it('accepts 192.168.0.128', () => {
      expect(isPrivateIpHostname('192.168.0.128')).toBe(true);
    });
  });

  describe('out of range octets', () => {
    it('rejects 192.168.0.256', () => {
      expect(isPrivateIpHostname('192.168.0.256')).toBe(false);
    });

    it('rejects 192.168.0.-1', () => {
      expect(isPrivateIpHostname('192.168.0.-1')).toBe(false);
    });
  });

  describe('wrong subnet prefix', () => {
    it('rejects 192.168.1.1', () => {
      expect(isPrivateIpHostname('192.168.1.1')).toBe(false);
    });

    it('rejects 10.0.0.1', () => {
      expect(isPrivateIpHostname('10.0.0.1')).toBe(false);
    });

    it('rejects 172.16.0.1', () => {
      expect(isPrivateIpHostname('172.16.0.1')).toBe(false);
    });
  });

  describe('malformed hostnames', () => {
    it('rejects empty string', () => {
      expect(isPrivateIpHostname('')).toBe(false);
    });

    it('rejects non-numeric octet', () => {
      expect(isPrivateIpHostname('192.168.0.abc')).toBe(false);
    });

    it('rejects extra octets', () => {
      expect(isPrivateIpHostname('192.168.0.1.2')).toBe(false);
    });

    it('rejects floating point octet', () => {
      expect(isPrivateIpHostname('192.168.0.1.5')).toBe(false);
    });

    it('rejects localhost', () => {
      expect(isPrivateIpHostname('localhost')).toBe(false);
    });

    it('rejects 127.0.0.1', () => {
      expect(isPrivateIpHostname('127.0.0.1')).toBe(false);
    });
  });
});

describe('isPrivateIpUrl', () => {
  describe('valid private IP URLs', () => {
    it('accepts http with private IP', () => {
      expect(isPrivateIpUrl('http://192.168.0.1')).toBe(true);
    });

    it('accepts https with private IP', () => {
      expect(isPrivateIpUrl('https://192.168.0.1')).toBe(true);
    });

    it('accepts private IP with port', () => {
      expect(isPrivateIpUrl('http://192.168.0.1:8080')).toBe(true);
    });

    it('accepts private IP with path and query', () => {
      expect(isPrivateIpUrl('http://192.168.0.1:5173/signup?ref=home')).toBe(true);
    });

    it('accepts boundary IP 192.168.0.0', () => {
      expect(isPrivateIpUrl('http://192.168.0.0')).toBe(true);
    });

    it('accepts boundary IP 192.168.0.255', () => {
      expect(isPrivateIpUrl('http://192.168.0.255')).toBe(true);
    });
  });

  describe('non-private IP URLs', () => {
    it('rejects localhost', () => {
      expect(isPrivateIpUrl('http://localhost')).toBe(false);
    });

    it('rejects 127.0.0.1', () => {
      expect(isPrivateIpUrl('http://127.0.0.1')).toBe(false);
    });

    it('rejects public domain', () => {
      expect(isPrivateIpUrl('http://example.com')).toBe(false);
    });

    it('rejects different subnet', () => {
      expect(isPrivateIpUrl('http://192.168.1.1')).toBe(false);
    });
  });

  describe('invalid inputs', () => {
    it('rejects empty string', () => {
      expect(isPrivateIpUrl('')).toBe(false);
    });

    it('rejects malformed URL', () => {
      expect(isPrivateIpUrl('not a url')).toBe(false);
    });

    it('rejects IP without protocol', () => {
      expect(isPrivateIpUrl('192.168.0.1')).toBe(false);
    });
  });
});
