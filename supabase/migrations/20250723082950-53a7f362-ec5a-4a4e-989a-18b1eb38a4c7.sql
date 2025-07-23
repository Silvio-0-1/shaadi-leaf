
-- Add foreign key constraint from credit_transactions to profiles
ALTER TABLE public.credit_transactions 
ADD CONSTRAINT credit_transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint from user_credits to profiles  
ALTER TABLE public.user_credits 
ADD CONSTRAINT user_credits_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
