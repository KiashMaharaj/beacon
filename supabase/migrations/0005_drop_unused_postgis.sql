-- Beacon - remove the unused PostGIS extension.
--
-- An earlier version enabled PostGIS "just in case", but Beacon computes
-- distances with the plain-SQL distance_km() haversine helper and never uses
-- any PostGIS type or function. PostGIS creates public.spatial_ref_sys (a
-- reference table with no RLS), which Supabase's security advisor flags as
-- "rls_disabled_in_public". Dropping the extension removes that table and the
-- warning. It holds only map-projection reference data, never user data.
--
-- Safe: nothing in this schema depends on PostGIS. No-op if it was never
-- installed. Run this on existing databases (new setups skip PostGIS entirely).

drop extension if exists postgis;
