-- ============================================================
-- RPC HELPER FUNCTION: increment_click
-- Used by server-side click tracking to bump click_count.
-- ============================================================
create or replace function public.increment_click(p_ad_id uuid)
returns void as $$
begin
  update public.ads
  set click_count = click_count + 1
  where id = p_ad_id;
end;
$$ language plpgsql security definer;
