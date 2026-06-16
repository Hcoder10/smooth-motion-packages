import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Archive, Download, ExternalLink, FileUp, PackageCheck, RefreshCw, Search, Sparkles } from 'lucide-react';
import { createPackage, downloadPackage, getCurrentUser, isConfigured, listPackages, signInWithPassword, signOut, signUpWithPassword } from './insforge';
import { formatBytes, validateDraft } from './package-utils';
import type { AuthIdentity, PackageCard, PackageDraft } from './types';
import './styles.css';

const emptyDraft: PackageDraft = {
  name: '',
  version: '0.1.0',
  description: '',
  author: '',
  homepageUrl: '',
  tags: 'animation, react',
  file: null,
};

function PackageTile({ pkg, onDownload }: { pkg: PackageCard; onDownload: (pkg: PackageCard) => void }) {
  return (
    <article className="package-tile">
      <div className="package-icon" aria-hidden="true">
        <PackageCheck size={22} />
      </div>
      <div className="package-main">
        <div className="package-heading">
          <h3>{pkg.name}</h3>
          <span>v{pkg.version}</span>
        </div>
        <p>{pkg.description}</p>
        <div className="tag-row">
          {pkg.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="package-meta">
          <span>{pkg.author}</span>
          <span>{formatBytes(pkg.fileSize)}</span>
          <span>{new Date(pkg.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="package-actions">
        {pkg.homepageUrl ? (
          <a className="icon-button" href={pkg.homepageUrl} target="_blank" rel="noreferrer" aria-label={`Open ${pkg.name} homepage`}>
            <ExternalLink size={18} />
          </a>
        ) : null}
        <button className="icon-button" type="button" onClick={() => onDownload(pkg)} aria-label={`Download ${pkg.name}`}>
          <Download size={18} />
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const [draft, setDraft] = useState<PackageDraft>(emptyDraft);
  const [packages, setPackages] = useState<PackageCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Ready');
  const [busy, setBusy] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [user, setUser] = useState<AuthIdentity | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  async function refresh(nextPage = page) {
    if (!isConfigured) return;
    setBusy(true);
    setStatus('Loading packages');
    try {
      const result = await listPackages(nextPage);
      setPackages(result.items);
      setTotal(result.total);
      setStatus(`Loaded ${result.items.length} of ${result.total} packages`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not load packages');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void refresh(page);
  }, [page]);

  useEffect(() => {
    async function hydrate() {
      if (!isConfigured) return;
      setUser(await getCurrentUser());
    }
    void hydrate();
  }, []);

  const filteredPackages = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return packages;
    return packages.filter((pkg) => {
      const haystack = [pkg.name, pkg.description, pkg.author, ...pkg.tags].join(' ').toLowerCase();
      return haystack.includes(needle);
    });
  }, [packages, query]);

  function updateField(field: keyof PackageDraft) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDraft((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  async function submitPackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setStatus('Sign in before uploading packages.');
      return;
    }
    const validation = validateDraft(draft);
    if (validation) {
      setStatus(validation);
      return;
    }

    setBusy(true);
    setStatus('Uploading package');
    try {
      await createPackage(draft);
      setDraft(emptyDraft);
      setPage(0);
      await refresh(0);
      setStatus('Package published');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleAuth(action: 'sign-up' | 'sign-in' | 'sign-out') {
    setAuthBusy(true);
    try {
      if (action === 'sign-out') {
        await signOut();
        setUser(null);
        setStatus('Signed out');
        return;
      }
      const nextUser =
        action === 'sign-up'
          ? await signUpWithPassword(authEmail.trim(), authPassword)
          : await signInWithPassword(authEmail.trim(), authPassword);
      setUser(nextUser);
      setStatus(action === 'sign-up' ? 'Account created' : 'Signed in');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Auth failed');
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleDownload(pkg: PackageCard) {
    setStatus(`Preparing ${pkg.fileName}`);
    try {
      const blob = await downloadPackage(pkg);
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = pkg.fileName;
      anchor.click();
      URL.revokeObjectURL(href);
      setStatus(`Downloaded ${pkg.fileName}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Download failed');
    }
  }

  return (
    <main className="shell">
      <section className="mast">
        <div>
          <p className="eyebrow">
            <Sparkles size={16} /> motion package exchange
          </p>
          <h1>Smooth Motion Packages</h1>
          <p className="lede">Upload, browse, and download small animation libraries, easing packs, presets, and UI motion snippets.</p>
        </div>
        <div className="status-panel">
          <Archive size={22} />
          <span>{isConfigured ? status : 'Missing VITE_INSFORGE_URL or VITE_INSFORGE_ANON_KEY'}</span>
        </div>
      </section>

      <section className="workspace">
        <form className="upload-panel" onSubmit={submitPackage}>
          <div className="panel-heading">
            <FileUp size={20} />
            <h2>Publish Package</h2>
          </div>
          <div className="auth-box">
            <div className="auth-state">{user?.email ? `Signed in as ${user.email}` : 'Sign in to publish'}</div>
            {!user ? (
              <div className="auth-grid">
                <input value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} aria-label="Email" placeholder="email@example.com" autoComplete="email" />
                <input value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} aria-label="Password" placeholder="Password" type="password" autoComplete="current-password" />
                <button type="button" disabled={authBusy || !isConfigured} onClick={() => handleAuth('sign-up')}>
                  Sign up
                </button>
                <button type="button" disabled={authBusy || !isConfigured} onClick={() => handleAuth('sign-in')}>
                  Sign in
                </button>
              </div>
            ) : (
              <button className="secondary-button" type="button" disabled={authBusy} onClick={() => handleAuth('sign-out')}>
                Sign out
              </button>
            )}
          </div>
          <label>
            Package name
            <input value={draft.name} onChange={updateField('name')} placeholder="motion-spring-grid" />
          </label>
          <label>
            Version
            <input value={draft.version} onChange={updateField('version')} placeholder="1.0.0" />
          </label>
          <label>
            Description
            <textarea value={draft.description} onChange={updateField('description')} placeholder="Composable spring presets for dashboard panels." />
          </label>
          <label>
            Author
            <input value={draft.author} onChange={updateField('author')} placeholder="Studio name" />
          </label>
          <label>
            Homepage
            <input value={draft.homepageUrl} onChange={updateField('homepageUrl')} placeholder="https://example.com" />
          </label>
          <label>
            Tags
            <input value={draft.tags} onChange={updateField('tags')} placeholder="react, easing, css" />
          </label>
          <label className="file-drop">
            <input
              type="file"
              accept=".zip,.tgz,.tar,.gz,.json,.js,.ts,.css"
              onChange={(event) => setDraft((current) => ({ ...current, file: event.target.files?.[0] || null }))}
            />
            <span>{draft.file ? `${draft.file.name} (${formatBytes(draft.file.size)})` : 'Choose package archive'}</span>
          </label>
          <button className="primary-button" disabled={busy || !isConfigured || !user} type="submit">
            <FileUp size={18} /> Upload package
          </button>
        </form>

        <section className="library-panel">
          <div className="library-toolbar">
            <div className="search-box">
              <Search size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search packages" />
            </div>
            <button className="icon-button" type="button" onClick={() => refresh(page)} aria-label="Refresh packages">
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="package-list">
            {filteredPackages.length ? (
              filteredPackages.map((pkg) => <PackageTile key={pkg.id} pkg={pkg} onDownload={handleDownload} />)
            ) : (
              <div className="empty-state">No packages match this view.</div>
            )}
          </div>

          <div className="pager">
            <button type="button" disabled={page === 0 || busy} onClick={() => setPage((value) => Math.max(0, value - 1))}>
              Previous
            </button>
            <span>
              Page {page + 1} / {Math.max(1, Math.ceil(total / 9))}
            </span>
            <button type="button" disabled={(page + 1) * 9 >= total || busy} onClick={() => setPage((value) => value + 1)}>
              Next
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
