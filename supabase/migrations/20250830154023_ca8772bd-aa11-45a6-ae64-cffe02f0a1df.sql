-- Recreate the missing app_role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'user');