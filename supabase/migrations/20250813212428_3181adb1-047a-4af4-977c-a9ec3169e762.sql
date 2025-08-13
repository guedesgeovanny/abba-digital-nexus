-- Set default value for whatsapp_connected_at to automatically use current timestamp
ALTER TABLE public.conexoes 
ALTER COLUMN whatsapp_connected_at SET DEFAULT now();