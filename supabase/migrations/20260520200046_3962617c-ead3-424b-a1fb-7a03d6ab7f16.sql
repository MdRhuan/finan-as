
-- Trigger function for updated_at (reusable)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- TRANSACTIONS
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita','despesa')),
  valor NUMERIC(14,2) NOT NULL,
  categoria TEXT NOT NULL,
  data DATE NOT NULL,
  descricao TEXT NOT NULL,
  conta TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_transactions_user_data ON public.transactions(user_id, data DESC);
CREATE POLICY "own_select" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_delete" ON public.transactions FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_transactions_updated BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CATEGORIES
CREATE TABLE public.categories (
  id TEXT NOT NULL,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL,
  icone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_delete" ON public.categories FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ACCOUNTS
CREATE TABLE public.accounts (
  id TEXT NOT NULL,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('banco','dinheiro','outro')),
  saldo NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_delete" ON public.accounts FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_accounts_updated BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- GOALS
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  valor_alvo NUMERIC(14,2) NOT NULL,
  valor_atual NUMERIC(14,2) NOT NULL DEFAULT 0,
  prazo DATE NOT NULL,
  icone TEXT NOT NULL,
  cor TEXT NOT NULL,
  concluida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_goals_user ON public.goals(user_id);
CREATE POLICY "own_select" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_delete" ON public.goals FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_goals_updated BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
