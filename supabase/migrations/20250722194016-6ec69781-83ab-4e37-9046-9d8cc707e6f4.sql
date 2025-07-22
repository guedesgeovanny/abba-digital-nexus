
-- Confirmar emails automaticamente para usuários com status active
-- Isso permite que façam login sem precisar confirmar email

UPDATE auth.users 
SET email_confirmed_at = now(), 
    confirmed_at = now()
WHERE id IN (
  SELECT id FROM public.profiles 
  WHERE status = 'active' 
  AND id IN (
    SELECT id FROM auth.users 
    WHERE email_confirmed_at IS NULL
  )
);

-- Também vamos garantir que usuários com status active sejam automaticamente confirmados
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now())
WHERE id IN (
  SELECT id FROM public.profiles WHERE status = 'active'
);
