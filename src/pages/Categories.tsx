import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

const CORES = ['#EF4444', '#F97316', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B', '#111111'];
const ICONES = ['🍽️', '🚗', '📄', '🎮', '❤️', '📚', '💰', '📈', '🛍️', '🏠', '✈️', '💻', '🎵', '🐾', '🌿', '📦'];

export function Categories() {
  const { categorias, adicionarCategoria, excluirCategoria } = useStore();
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#111111');
  const [icone, setIcone] = useState('📦');
  const [erro, setErro] = useState('');

  const handleAdd = () => {
    setErro('');
    if (!nome.trim()) return setErro('Informe o nome');
    if (categorias.some((c) => c.nome.toLowerCase() === nome.trim().toLowerCase())) return setErro('Já existe');
    adicionarCategoria({ nome: nome.trim(), cor, icone });
    setNome(''); setAberto(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="t-page" style={{ margin: 0 }}>Categorias</h1>
          <p className="t-label" style={{ marginTop: 4 }}>{categorias.length} configuradas</p>
        </div>
        <button onClick={() => setAberto(!aberto)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={15} /> Nova
        </button>
      </div>

      {aberto && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="t-label">Nome</label>
            <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Academia, Pets..." style={{ marginTop: 6 }} autoFocus />
          </div>
          <div>
            <label className="t-label">Ícone</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {ICONES.map((ic) => (
                <button key={ic} onClick={() => setIcone(ic)} style={{ width: 36, height: 36, borderRadius: 8, fontSize: 18, cursor: 'pointer', border: icone === ic ? '2px solid var(--text)' : '1px solid var(--border)', background: 'var(--card)' }}>{ic}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="t-label">Cor</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {CORES.map((c) => (
                <button key={c} onClick={() => setCor(c)} style={{ width: 28, height: 28, borderRadius: 6, background: c, cursor: 'pointer', border: cor === c ? '3px solid var(--text)' : '1px solid var(--border)' }} />
              ))}
            </div>
          </div>
          {erro && <p style={{ color: 'var(--neg)', fontSize: 13, margin: 0 }}>{erro}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setAberto(false)} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
            <button onClick={handleAdd} className="btn-primary" style={{ flex: 1 }}>Criar</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {categorias.map((c, i) => (
          <div key={c.id} className="group" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < categorias.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: '#F4F4F2' }}>{c.icone}</div>
            <p style={{ flex: 1, margin: 0, fontWeight: 500 }}>{c.nome}</p>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.cor }} />
            <button onClick={() => confirm(`Excluir "${c.nome}"?`) && excluirCategoria(c.id)} className="opacity-0 group-hover:opacity-100" style={{ padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
