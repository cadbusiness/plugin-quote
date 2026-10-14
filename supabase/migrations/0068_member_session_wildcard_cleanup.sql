-- Poisoned member sessions from the unescaped ilike login bug stored the typed
-- pattern (for example '%@%') and then loaded every quote for that org.
-- `_` is a legal email character, so only non-addresses and '%' patterns go.

delete from public.member_space_sessions
where position('%' in email) > 0
   or email !~* '^[^[:space:]@%]+@[^[:space:]@%]+\.[^[:space:]@%]+$';
