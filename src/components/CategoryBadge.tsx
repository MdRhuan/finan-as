import { useStore } from '../store/useStore';

interface CategoryBadgeProps {
  categoria: string;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ categoria, size = 'md' }: CategoryBadgeProps) {
  const categorias = useStore((s) => s.categorias);
  const cat = categorias.find((c) => c.nome === categoria);

  const cor = cat?.cor || '#475569';
  const icone = cat?.icone || '📦';
  const padding = size === 'sm' ? '2px 7px' : '3px 10px';

  return (
    <span
      className="inline-flex items-center gap-1 font-medium"
      style={{
        fontSize: '11px',
        borderRadius: '6px',
        padding,
        backgroundColor: `${cor}18`,
        color: cor,
        border: `1px solid ${cor}25`,
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
      }}
    >
      <span style={{ fontSize: '10px' }}>{icone}</span>
      {categoria}
    </span>
  );
}
