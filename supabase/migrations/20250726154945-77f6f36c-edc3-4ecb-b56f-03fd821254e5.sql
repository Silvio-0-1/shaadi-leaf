-- Critical Security Fix: Tighten user_roles RLS policies to prevent privilege escalation

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "System can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only system functions can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only system functions can delete roles" ON public.user_roles;

-- Create new restrictive policies to prevent privilege escalation
-- 1. Users can view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Admins can view all roles (but not modify through direct table access)
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- 3. System can insert roles (for automatic role assignment)
CREATE POLICY "System can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (true);

-- 4. Block all direct updates and deletes to prevent privilege escalation
-- Only secure functions can modify roles
CREATE POLICY "Block direct role updates" 
ON public.user_roles 
FOR UPDATE 
USING (false);

CREATE POLICY "Block direct role deletions" 
ON public.user_roles 
FOR DELETE 
USING (false);

-- Add audit logging table for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type TEXT,
  target_user_id UUID,
  action_details JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (admin_user_id, target_user_id, action, details)
  VALUES (auth.uid(), target_user_id, action_type, action_details);
END;
$$;