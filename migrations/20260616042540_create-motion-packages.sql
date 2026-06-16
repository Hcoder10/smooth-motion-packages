CREATE TABLE public.motion_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  slug TEXT NOT NULL,
  version TEXT NOT NULL CHECK (char_length(version) BETWEEN 1 AND 40),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 8 AND 800),
  author TEXT NOT NULL CHECK (char_length(author) BETWEEN 2 AND 120),
  homepage_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  file_key TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 15728640),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slug)
);

CREATE INDEX motion_packages_created_at_idx ON public.motion_packages (created_at DESC);
CREATE INDEX motion_packages_tags_idx ON public.motion_packages USING GIN (tags);

ALTER TABLE public.motion_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY motion_packages_public_read ON public.motion_packages
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY motion_packages_authenticated_insert ON public.motion_packages
  FOR INSERT TO authenticated
  WITH CHECK (
    file_key IS NOT NULL
    AND file_url IS NOT NULL
    AND file_size > 0
    AND file_size <= 15728640
  );

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.motion_packages TO anon, authenticated;
GRANT INSERT ON public.motion_packages TO authenticated;

CREATE TRIGGER motion_packages_updated_at
  BEFORE UPDATE ON public.motion_packages
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY storage_motion_packages_public_read ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket = 'motion-packages');

CREATE POLICY storage_motion_packages_authenticated_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket = 'motion-packages'
    AND octet_length(key) <= 512
  );

GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT ON storage.objects TO authenticated;
