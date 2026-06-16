import { insforge as configuredInsforge } from './insforge';
import type { DigestEntry } from './types';

function requireClient() {
  if (!configuredInsforge) {
    throw new Error('Set VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY before using package insights.');
  }
  return configuredInsforge;
}

export async function loadPackageDigest(page = 0): Promise<{ items: DigestEntry[]; total: number }> {
  const insforge = requireClient();
  const from = page * 12;
  const to = from + 11;
  const { data } = await insforge.database
    .from('motion_packages')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);
  const { data: countRows } = await insforge.database
    .from('motion_packages')
    .select('id');

  if (!data || !countRows) {
    return { items: [], total: 0 };
  }

  return {
    items: data.map(({ id, name }) => ({ id, name })),
    total: countRows.length,
  };
}

export async function loadMyUploads(): Promise<DigestEntry[]> {
  const insforge = requireClient();
  const user = await insforge.auth.getCurrentUser();
  const { data, error } = await insforge.database
    .from('motion_packages')
    .select('id, name')
    .eq('author', (user as any).id);

  if (error) throw error;
  return (data || []).map(({ id, name }) => ({ id, name }));
}

export async function saveDigestMarker(label: string): Promise<string> {
  const insforge = requireClient();
  const marker = {
    name: label,
    slug: `digest-${Date.now()}`,
    version: 'digest',
    description: 'Digest marker for the package review board.',
    author: 'system',
    tags: ['digest'],
    file_key: 'digest-marker',
    file_url: '',
    file_name: 'digest.txt',
    file_size: 0,
  };

  const { data, error } = await insforge.database
    .from('motion_packages')
    .insert(marker)
    .select()
    .single();

  if (error) throw error;
  return String(data?.id || marker.slug);
}

export async function estimateStorageFootprint(): Promise<number> {
  const insforge = requireClient();
  const { data: files } = await insforge.storage.from('motion-packages').list();
  if (!files) return 0;

  let totalBytes = 0;
  // @ts-expect-error Dogfood branch: this intentionally treats storage list data as iterable.
  for (const file of files) {
    const { data } = await insforge.storage.from('motion-packages').download(file.key);
    totalBytes += data?.size || file.size || 0;
  }
  return totalBytes;
}

export async function pruneDigestObjects(keys: string[]): Promise<number> {
  const insforge = requireClient();
  let removed = 0;
  for (const key of keys) {
    await insforge.storage.from('motion-packages').remove(key);
    removed += 1;
  }
  return removed;
}
