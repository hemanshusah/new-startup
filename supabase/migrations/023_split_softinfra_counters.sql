-- 023_split_softinfra_counters.sql
-- Add split counters to softinfra
alter table public.softinfra add column if not exists guest_impression_count bigint default 0;
alter table public.softinfra add column if not exists user_impression_count bigint default 0;

-- Update the increment function to handle both
create or replace function public.increment_softinfra_impression(p_si_id uuid, p_is_guest boolean default true)
returns void as $$
begin
  if p_is_guest then
    update public.softinfra
    set guest_impression_count = guest_impression_count + 1,
        impression_count = impression_count + 1
    where id = p_si_id;
  else
    update public.softinfra
    set user_impression_count = user_impression_count + 1,
        impression_count = impression_count + 1
    where id = p_si_id;
  end if;
end;
$$ language plpgsql security definer;
