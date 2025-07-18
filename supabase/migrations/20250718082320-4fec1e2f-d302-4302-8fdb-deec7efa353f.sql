-- Set the admin role for your account
-- First, let's check if there are any users in the auth.users table and get the user ID
-- You'll need to replace 'YOUR_EMAIL_HERE' with your actual email

-- For now, let's create a function to easily set admin role
CREATE OR REPLACE FUNCTION public.set_user_as_admin(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role (use ON CONFLICT to avoid duplicates)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Call the function to set your account as admin
-- Replace 'silviosudra@gmail.com' with your actual email if different
SELECT public.set_user_as_admin('silviosudra@gmail.com');