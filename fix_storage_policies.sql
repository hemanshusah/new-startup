-- 1. Ensure the bucket is public (already did via script but double check)
UPDATE storage.buckets SET public = true WHERE id = 'softinfra';

-- 2. Drop existing policies to avoid conflict
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- 3. Create fresh policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'softinfra');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'softinfra');
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'softinfra');
