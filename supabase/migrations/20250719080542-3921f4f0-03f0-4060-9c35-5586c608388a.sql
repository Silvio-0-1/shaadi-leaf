-- Allow admins to view all user profiles for credit management
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all user credits for management
CREATE POLICY "Admins can view all user credits" 
ON public.user_credits 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));