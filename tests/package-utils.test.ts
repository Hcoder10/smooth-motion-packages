import { describe, expect, it } from 'vitest';
import { formatBytes, parseTags, slugify, validateDraft } from '../src/package-utils';

describe('package utilities', () => {
  it('creates stable slugs', () => {
    expect(slugify(' Motion Spring Grid 1.0.0 ')).toBe('motion-spring-grid-1-0-0');
  });

  it('deduplicates and caps tags', () => {
    expect(parseTags('React, CSS, react, spring motion, easing, ui, svg')).toEqual([
      'react',
      'css',
      'spring-motion',
      'easing',
      'ui',
      'svg',
    ]);
  });

  it('formats file sizes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1024 * 1024 * 2)).toBe('2.0 MB');
  });

  it('validates required upload fields', () => {
    expect(
      validateDraft({
        name: '',
        version: '0.1.0',
        description: 'A package',
        author: 'Team',
        homepageUrl: '',
        tags: '',
        file: new File(['x'], 'pkg.zip'),
      }),
    ).toBe('Package name is required.');
  });
});
