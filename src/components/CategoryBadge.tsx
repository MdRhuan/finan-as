import { useStore } from '../store/useStore';

interface Props { categoria: string; size?: 'sm' | 'md'; }

export function CategoryBadge({ categoria }: Props) {
  const categorias = useStore((s) => s.categorias);
  const cat = categorias.find((c) => c.nome === categoria);
  return (
    <span className="badge" style={{ background: '#F4F4F2', color: 'var(--text)', border: '1px solid var(--border)' }}>
      <span>{cat?.icone || '📦'}</span>
      {categoria}
    </span>
  );
}
