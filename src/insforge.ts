import { createClient } from '@insforge/sdk';
import type { AuthIdentity, PackageDraft, PackageCard, PackageRow } from './types';
import { parseTags, slugify, toCard } from './package-utils';

const baseUrl = import.meta.env.VITE_INSFORGE_URL;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

export const isConfigured = Boolean(baseUrl && anonKey);

export const insforge = isConfigured
  ? createClient({
      baseUrl,
      anonKey,
    })
  : null;

function assertClient() {
  if (!insforge) {
    throw new Error('Set VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY before using the package library.');
  }
  return insforge;
}

export async function listPackages(page = 0, pageSize = 9): Promise<{ items: PackageCard[]; total: number }> {
  const client = assertClient();
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await client.database
    .from('motion_packages')
    .select('id, name, slug, version, description, author, homepage_url, tags, file_key, file_url, file_name, file_size, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return {
    items: ((data || []) as PackageRow[]).map(toCard),
    total: count || 0,
  };
}

export async function createPackage(draft: PackageDraft): Promise<PackageCard> {
  const client = assertClient();
  if (!draft.file) throw new Error('Package archive is required.');

  const slug = slugify(`${draft.name}-${draft.version}`) || `package-${Date.now()}`;
  const objectKey = `${slug}/${Date.now()}-${draft.file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const uploaded = await client.storage.from('motion-packages').upload(objectKey, draft.file);
  if (uploaded.error) throw uploaded.error;
  if (!uploaded.data) throw new Error('Upload did not return storage metadata.');

  const { data, error } = await client.database
    .from('motion_packages')
    .insert([
      {
        name: draft.name.trim(),
        slug,
        version: draft.version.trim(),
        description: draft.description.trim(),
        author: draft.author.trim(),
        homepage_url: draft.homepageUrl.trim() || null,
        tags: parseTags(draft.tags),
        file_key: uploaded.data.key,
        file_url: uploaded.data.url,
        file_name: draft.file.name,
        file_size: draft.file.size,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return toCard(data as PackageRow);
}

export async function downloadPackage(pkg: PackageCard): Promise<Blob> {
  const client = assertClient();
  const { data, error } = await client.storage.from('motion-packages').download(pkg.fileKey);
  if (error) throw error;
  if (!data) throw new Error('Download did not return file data.');
  return data;
}

export async function getCurrentUser(): Promise<AuthIdentity | null> {
  const client = assertClient();
  const { data, error } = await client.auth.getCurrentUser();
  if (error) return null;
  return (data?.user || null) as AuthIdentity | null;
}

export async function signUpWithPassword(email: string, password: string): Promise<AuthIdentity | null> {
  const client = assertClient();
  const { data, error } = await client.auth.signUp({ email, password, name: email.split('@')[0] });
  if (error) throw error;
  return (data?.user || null) as AuthIdentity | null;
}

export async function signInWithPassword(email: string, password: string): Promise<AuthIdentity | null> {
  const client = assertClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return (data?.user || null) as AuthIdentity | null;
}

export async function signOut(): Promise<void> {
  const client = assertClient();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}
