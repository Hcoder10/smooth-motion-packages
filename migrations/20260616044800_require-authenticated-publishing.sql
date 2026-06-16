DROP POLICY IF EXISTS motion_packages_public_insert ON public.motion_packages;
DROP POLICY IF EXISTS motion_packages_authenticated_insert ON public.motion_packages;
DROP POLICY IF EXISTS storage_motion_packages_public_insert ON storage.objects;
DROP POLICY IF EXISTS storage_motion_packages_authenticated_insert ON storage.objects;

CREATE POLICY motion_packages_authenticated_insert ON public.motion_packages
  FOR INSERT TO authenticated
  WITH CHECK (
    file_key IS NOT NULL
    AND file_url IS NOT NULL
    AND file_size > 0
    AND file_size <= 15728640
  );

CREATE POLICY storage_motion_packages_authenticated_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket = 'motion-packages'
    AND octet_length(key) <= 512
  );

REVOKE INSERT ON public.motion_packages FROM anon;
GRANT SELECT ON public.motion_packages TO anon, authenticated;
GRANT INSERT ON public.motion_packages TO authenticated;

GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT ON storage.objects TO anon, authenticated;
REVOKE INSERT ON storage.objects FROM anon;
GRANT INSERT ON storage.objects TO authenticated;
