-- Create trigger to initialize user credits on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_credits();

-- Initialize credits for existing users who don't have records
INSERT INTO public.user_credits (user_id, balance)
SELECT id, 100
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_credits uc WHERE uc.user_id = au.id
);

-- Add welcome bonus transaction for users without credits
INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
SELECT id, 100, 'signup_bonus', 'Welcome bonus - 100 free credits'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.credit_transactions ct WHERE ct.user_id = au.id AND ct.transaction_type = 'signup_bonus'
);