import type { PackageDraft, PackageCard, PackageRow } from './types';

const MAX_TAGS = 6;

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

export function parseTags(input: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of input.split(',')) {
    const tag = raw.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
    if (tags.length >= MAX_TAGS) break;
  }
  return tags;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value >= 10 || exponent === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`;
}

export function validateDraft(draft: PackageDraft): string | null {
  if (!draft.name.trim()) return 'Package name is required.';
  if (!draft.version.trim()) return 'Version is required.';
  if (!draft.description.trim()) return 'Description is required.';
  if (!draft.author.trim()) return 'Author is required.';
  if (!draft.file) return 'Upload a package archive.';
  if (draft.file.size > 15 * 1024 * 1024) return 'Package archives must be 15 MB or smaller.';
  return null;
}

export function toCard(row: PackageRow): PackageCard {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    version: row.version,
    description: row.description,
    author: row.author,
    homepageUrl: row.homepage_url,
    tags: row.tags || [],
    fileKey: row.file_key,
    fileUrl: row.file_url,
    fileName: row.file_name,
    fileSize: row.file_size,
    createdAt: row.created_at,
  };
}
