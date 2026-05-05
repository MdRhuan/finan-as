import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

const CORES_PADRAO = ['#F43F5E', '#F97316', '#F59E0B', '#10B981', '#00F5D4', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];
const ICONES_PADRAO = ['🍽️', '🚗', '📄', '🎮', '❤️', '📚', '💰', '📈', '🛍️', '🏠', '✈️', '💻', '🎵', '🐾', '🌿', '📦'];

const card: React.CSSProperties = {
  background: 'rgba(17,24,39,0.7)',
  backdropFilter: 'blur(12px)',
  borderRadius: '16px',
  border: '1px solid #1E2D40',
  padding: '20px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #1E2D40',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '14px',
  color: '#E2E8F0',
  backgroundColor: '#080C14',
  outline: 'none',
  fontFamily: '"Space Grotesk", system-ui, sans-serif',
  marginTop: '6px',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontFamily: '"JetBrains Mono", monospace',
};

export function Categories() {
  const { categorias, adicionarCategoria, excluirCategoria } = useStore();
  const [novoNome, setNovoNome] = useState('');
  const [novaCor, setNovaCor] = useState('#00F5D4');
  const [novoIcone, setNovoIcone] = useState('📦');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState('');

  const handleAdicionar = () => {
    setErro('');
    if (!novoNome.trim()) { setErro('Informe o nome da categoria'); return; }
    if (categorias.some((c) => c.nome.toLowerCase() === novoNome.trim().toLowerCase())) {
      setErro('Já existe uma categoria com esse nome'); return;
    }
    adicionarCategoria({ nome: novoNome.trim(), cor: novaCor, icone: novoIcone });
    setNovoNome(''); setNovaCor('#00F5D4'); setNovoIcone('📦'); setMostrarForm(false);
  };

  const handleExcluir = (id: string, nome: string) => {
    if (confirm(`Excluir a categoria "${nome}"?`)) excluirCategoria(id);
  };

  const focusInput = (e: React.FocusEvent<HTMLInputElement>) => {
    (e.target as HTMLElement).style.borderColor = '#00F5D4';
    (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(0,245,212,0.1)';
  };
  const blurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    (e.target as HTMLElement).style.borderColor = '#1E2D40';
    (e.target as HTMLElement).style.boxShadow = 'none';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#E2E8F0', margin: 0, letterSpacing: '-0.03em' }}>Categorias</h1>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontFamily: '"JetBrains Mono", monospace' }}>{categorias.length} categorias configuradas</p>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="btn-neon"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', fontSize: '14px', fontFamily: '"Space Grotesk", system-ui' }}
        >
          <Plus size={15} />
          Nova categoria
        </button>
      </div>

      {mostrarForm && (
        <div style={card}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '16px' }}>Nova categoria</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Nome</label>
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Academia, Pets..."
              style={inputStyle}
              onKeyDown={(e) => e.key === 'Enter' && handleAdicionar()}
              onFocus={focusInput} onBlur={blurInput}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Ícone</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {ICONES_PADRAO.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setNovoIcone(ic)}
                  style={{
                    width: 38, height: 38, borderRadius: '10px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    border: novoIcone === ic ? '2px solid #00F5D4' : '1px solid #1E2D40',
                    backgroundColor: novoIcone === ic ? 'rgba(0,245,212,0.1)' : '#080C14',
                    boxShadow: novoIcone === ic ? '0 0 8px rgba(0,245,212,0.2)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Cor</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {CORES_PADRAO.map((cor) => (
                <button
                  key={cor}
                  onClick={() => setNovaCor(cor)}
                  style={{
                    width: 28, height: 28, borderRadius: '6px', backgroundColor: cor, cursor: 'pointer',
                    border: novaCor === cor ? `3px solid #E2E8F0` : '2px solid transparent',
                    transform: novaCor === cor ? 'scale(1.2)' : 'scale(1)',
                    transition: 'transform 0.15s',
                    boxShadow: novaCor === cor ? `0 0 10px ${cor}80` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {erro && <p style={{ fontSize: '13px', color: '#F43F5E', marginBottom: '12px', padding: '8px 12px', backgroundColor: 'rgba(244,63,94,0.1)', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.2)' }}>{erro}</p>}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setMostrarForm(false)}
              style={{ flex: 1, padding: '10px', border: '1px solid #1E2D40', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#64748B', backgroundColor: '#080C14', cursor: 'pointer', fontFamily: '"Space Grotesk", system-ui' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleAdicionar}
              className="btn-neon"
              style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '14px', fontFamily: '"Space Grotesk", system-ui' }}
            >
              Criar categoria
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div style={{ background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid #1E2D40', overflow: 'hidden' }}>
        {categorias.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>Nenhuma categoria ainda</div>
        )}
        {categorias.map((c, i) => (
          <div
            key={c.id}
            className="group"
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderBottom: i < categorias.length - 1 ? '1px solid #1E2D40' : 'none', transition: 'background 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
          >
            <div style={{ width: 40, height: 40, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, backgroundColor: `${c.cor}18`, border: `1px solid ${c.cor}30` }}>
              {c.icone}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: '#E2E8F0', fontSize: '14px' }}>{c.nome}</p>
            </div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c.cor, flexShrink: 0, boxShadow: `0 0 6px ${c.cor}` }} />
            <button
              onClick={() => handleExcluir(c.id, c.nome)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ padding: '7px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#475569', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(244,63,94,0.15)'; (e.currentTarget as HTMLElement).style.color = '#F43F5E'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
