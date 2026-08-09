-- Beacon - optional shared contact detail + consent at listing time.
--
-- contact_value: when a reporter picks "phone" or "email", they can share a
-- number/address that neighbours see as a tel:/mailto: link. Nullable and
-- opt-in - nothing personal is exposed unless the poster provides it.
--
-- contact_consent: records that the poster agreed to the Terms and consented to
-- their report details (and any contact detail) being shared with neighbours so
-- they can be contacted. Captured when the listing is created.

alter table public.pet_reports add column if not exists contact_value text;
alter table public.pet_reports add column if not exists contact_consent boolean not null default false;
