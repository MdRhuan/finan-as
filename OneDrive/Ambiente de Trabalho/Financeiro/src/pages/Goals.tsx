import { useState } from 'react';
import { Plus, Trash2, Pencil, X, PiggyBank } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatarMoeda } from '../utils/formatCurrency';
import { formatarData } from '../utils/formatDate';
import type { Meta } from '../types';

const ICONES = ['🎯', '✈️', '🏠', '🚗', '💻', '📱', '🏖️', '🎓', '💍', '🐾', '🏋️', '🎸', '📦', '💰', '🌍'];
const CORES = ['#3B82F6', '#00F5D4', '#F97316', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#F43F5E', '#06B6D4', '#6366F1'];
const AGORA_MS = Date.now();

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
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontFamily: '"JetBrains Mono", monospace',
};

interface FormMeta {
  nome: string; descricao: string; valorAlvo: string; valorAtual: string; prazo: string; icone: string; cor: string;
}
const FORM_VAZIO: FormMeta = { nome: '', descricao: '', valorAlvo: '', valorAtual: '0', prazo: '', icone: '🎯', cor: '#00F5D4' };

export function Goals() {
  const { metas, adicionarMeta, editarMeta, excluirMeta, depositarNaMeta } = useStore();
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Meta | null>(null);
  const [depositModal, setDepositModal] = useState<Meta | null>(null);
  const [valorDeposito, setValorDeposito] = useState('');
  const [form, setForm] = useState<FormMeta>(FORM_VAZIO);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState<'todas' | 'ativas' | 'concluidas'>('todas');

  const abrirNova = () => { setEditando(null); setForm(FORM_VAZIO); setErro(''); setModalAberto(true); };
  const abrirEditar = (meta: Meta) => {
    setEditando(meta);
    setForm({ nome: meta.nome, descricao: meta.descricao || '', valorAlvo: String(meta.valorAlvo), valorAtual: String(meta.valorAtual), prazo: meta.prazo, icone: meta.icone, cor: meta.cor });
    setErro(''); setModalAberto(true);
  };

  const handleSalvar = () => {
    setErro('');
    if (!form.nome.trim()) { setErro('Informe o nome da meta'); return; }
    const alvo = parseFloat(form.valorAlvo.replace(',', '.'));
    if (!alvo || alvo <= 0) { setErro('Informe um valor alvo válido'); return; }
    const atual = parseFloat(form.valorAtual.replace(',', '.')) || 0;
    if (!form.prazo) { setErro('Informe o prazo'); return; }
    const dados = { nome: form.nome.trim(), descricao: form.descricao.trim() || undefined, valorAlvo: alvo, valorAtual: Math.min(atual, alvo), prazo: form.prazo, icone: form.icone, cor: form.cor };
    if (editando) editarMeta(editando.id, { ...dados, concluida: dados.valorAtual >= dados.valorAlvo });
    else adicionarMeta(dados);
    setModalAberto(false);
  };

  const handleDepositar = () => {
    if (!depositModal) return;
    const v = parseFloat(valorDeposito.replace(',', '.'));
    if (!v || v <= 0) return;
    depositarNaMeta(depositModal.id, v);
    setValorDeposito(''); setDepositModal(null);
  };

  const handleExcluir = (id: string, nome: string) => {
    if (confirm(`Excluir a meta "${nome}"?`)) excluirMeta(id);
  };

  const metasFiltradas = metas.filter((m) => {
    if (filtro === 'ativas') return !m.concluida;
    if (filtro === 'concluidas') return m.concluida;
    return true;
  });

  const totalAlvo = metas.filter((m) => !m.concluida).reduce((a, m) => a + m.valorAlvo, 0);
  const totalJuntado = metas.filter((m) => !m.concluida).reduce((a, m) => a + m.valorAtual, 0);

  const modalBase: React.CSSProperties = {
    position: 'relative',
    background: 'rgba(13,18,32,0.98)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid #1E2D40',
    boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,245,212,0.06)',
    padding: '24px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '768px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#E2E8F0', margin: 0, letterSpacing: '-0.03em' }}>Metas</h1>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontFamily: '"JetBrains Mono", monospace' }}>objetivos de economia</p>
        </div>
        <button onClick={abrirNova} className="btn-neon" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', fontSize: '14px', fontFamily: '"Space Grotesk", system-ui' }}>
          <Plus size={15} /> Nova meta
        </button>
      </div>

      {/* Resumo */}
      {metas.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            { label: 'Metas ativas', valor: String(metas.filter((m) => !m.concluida).length), accent: '#64748B', mono: false },
            { label: 'Total alvo', valor: formatarMoeda(totalAlvo), accent: '#3B82F6', mono: true },
            { label: 'Total juntado', valor: formatarMoeda(totalJuntado), accent: '#00F5D4', mono: true },
          ].map((item) => (
            <div key={item.label} style={{ ...card, textAlign: 'center', border: `1px solid ${item.accent}20` }}>
              <p style={{ fontSize: '11px', color: '#475569', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>{item.label}</p>
              <p style={{ fontSize: item.mono ? '16px' : '24px', fontWeight: 700, color: item.accent, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '-0.02em' }}>{item.valor}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      {metas.length > 0 && (
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['todas', 'ativas', 'concluidas'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                padding: '7px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                backgroundColor: filtro === f ? 'rgba(0,245,212,0.15)' : 'transparent',
                color: filtro === f ? '#00F5D4' : '#475569',
                border: filtro === f ? '1px solid rgba(0,245,212,0.35)' : '1px solid #1E2D40',
                fontFamily: '"Space Grotesk", system-ui',
              }}
            >
              {f === 'todas' ? 'Todas' : f === 'ativas' ? 'Ativas' : 'Concluídas'}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      {metasFiltradas.length === 0 ? (
        <div style={{ ...card, padding: '64px 16px', textAlign: 'center' }}>
          <PiggyBank style={{ color: '#1E2D40', margin: '0 auto 12px' }} size={48} />
          <p style={{ color: '#475569', fontWeight: 500, marginBottom: '4px' }}>
            {metas.length === 0 ? 'Nenhuma meta criada ainda' : 'Nenhuma meta nesta categoria'}
          </p>
          {metas.length === 0 && <p style={{ fontSize: '13px', color: '#334155', fontFamily: '"JetBrains Mono", monospace' }}>crie sua primeira meta de economia</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {metasFiltradas.map((meta) => {
            const pct = Math.min((meta.valorAtual / meta.valorAlvo) * 100, 100);
            const falta = meta.valorAlvo - meta.valorAtual;
            const diasRestantes = Math.ceil((new Date(meta.prazo).getTime() - AGORA_MS) / 86400000);
            const atrasada = !meta.concluida && diasRestantes < 0;

            return (
              <div
                key={meta.id}
                style={{
                  ...card,
                  borderColor: meta.concluida ? 'rgba(0,245,212,0.3)' : atrasada ? 'rgba(244,63,94,0.3)' : '#1E2D40',
                  boxShadow: meta.concluida ? '0 0 20px rgba(0,245,212,0.08)' : 'none',
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, backgroundColor: `${meta.cor}18`, border: `1px solid ${meta.cor}30` }}>
                    {meta.concluida ? '✅' : meta.icone}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontWeight: 700, color: '#E2E8F0', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{meta.nome}</h3>
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        {!meta.concluida && (
                          <button
                            onClick={() => { setDepositModal(meta); setValorDeposito(''); }}
                            style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 700, borderRadius: '6px', color: '#080C14', border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${meta.cor}, ${meta.cor}AA)`, fontFamily: '"Space Grotesk", system-ui' }}
                          >
                            + Depositar
                          </button>
                        )}
                        <button onClick={() => abrirEditar(meta)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#475569', transition: 'all 0.15s' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,245,212,0.1)'; (e.currentTarget as HTMLElement).style.color = '#00F5D4'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleExcluir(meta.id, meta.nome)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#475569', transition: 'all 0.15s' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(244,63,94,0.15)'; (e.currentTarget as HTMLElement).style.color = '#F43F5E'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {meta.descricao && <p style={{ fontSize: '12px', color: '#475569', marginBottom: '10px', fontFamily: '"JetBrains Mono", monospace' }}>{meta.descricao}</p>}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: meta.cor, fontSize: '14px' }}>{formatarMoeda(meta.valorAtual)}</span>
                      <span style={{ color: '#475569', fontFamily: '"JetBrains Mono", monospace', fontSize: '12px' }}>de {formatarMoeda(meta.valorAlvo)}</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#1E2D40', borderRadius: '999px', height: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div style={{ width: `${pct}%`, height: '8px', borderRadius: '999px', background: `linear-gradient(90deg, ${meta.cor}, ${meta.cor}AA)`, transition: 'width 0.7s cubic-bezier(0.16,1,0.3,1)', boxShadow: `0 0 8px ${meta.cor}50` }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: meta.cor, fontFamily: '"JetBrains Mono", monospace' }}>{pct.toFixed(0)}%</span>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {!meta.concluida && falta > 0 && <span style={{ fontSize: '12px', color: '#475569', fontFamily: '"JetBrains Mono", monospace' }}>faltam {formatarMoeda(falta)}</span>}
                        <span style={{ fontSize: '12px', fontWeight: 500, color: atrasada ? '#F43F5E' : '#475569', fontFamily: '"JetBrains Mono", monospace' }}>
                          {meta.concluida ? '🎉 Concluída!' : atrasada ? '⚠️ Vencida' : `📅 ${formatarData(meta.prazo)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal criar/editar */}
      {modalAberto && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }} onClick={() => setModalAberto(false)} />
          <div className="animate-slide-up" style={{ ...modalBase, maxWidth: '448px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#E2E8F0', margin: 0, letterSpacing: '-0.02em' }}>{editando ? 'Editar Meta' : 'Nova Meta'}</h2>
                <div style={{ width: 28, height: 2, background: 'linear-gradient(90deg, #00F5D4, transparent)', marginTop: '5px', borderRadius: '1px' }} />
              </div>
              <button onClick={() => setModalAberto(false)} style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#475569' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(244,63,94,0.1)'; (e.currentTarget as HTMLElement).style.color = '#F43F5E'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}>
                <X size={18} />
              </button>
            </div>

            <div>
              <label style={labelStyle}>Nome</label>
              <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Viagem para Europa..." style={inputStyle} autoFocus />
            </div>
            <div>
              <label style={labelStyle}>Descrição (opcional)</label>
              <input type="text" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Detalhes sobre a meta..." style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Valor alvo (R$)</label>
                <input type="number" value={form.valorAlvo} onChange={(e) => setForm({ ...form, valorAlvo: e.target.value })} placeholder="5000" min="0.01" step="0.01" style={{ ...inputStyle, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }} />
              </div>
              <div>
                <label style={labelStyle}>Já guardado (R$)</label>
                <input type="number" value={form.valorAtual} onChange={(e) => setForm({ ...form, valorAtual: e.target.value })} placeholder="0" min="0" step="0.01" style={{ ...inputStyle, fontFamily: '"JetBrains Mono", monospace' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Prazo</label>
              <input type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Ícone</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {ICONES.map((ic) => (
                  <button key={ic} type="button" onClick={() => setForm({ ...form, icone: ic })}
                    style={{ width: 38, height: 38, borderRadius: '10px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: form.icone === ic ? '2px solid #00F5D4' : '1px solid #1E2D40', backgroundColor: form.icone === ic ? 'rgba(0,245,212,0.1)' : '#080C14', transition: 'all 0.15s' }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Cor</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {CORES.map((cor) => (
                  <button key={cor} type="button" onClick={() => setForm({ ...form, cor })}
                    style={{ width: 28, height: 28, borderRadius: '6px', backgroundColor: cor, cursor: 'pointer', border: form.cor === cor ? '3px solid #E2E8F0' : '2px solid transparent', transform: form.cor === cor ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.15s', boxShadow: form.cor === cor ? `0 0 10px ${cor}80` : 'none' }} />
                ))}
              </div>
            </div>

            {erro && <p style={{ fontSize: '13px', color: '#F43F5E', padding: '8px 12px', backgroundColor: 'rgba(244,63,94,0.1)', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.2)' }}>{erro}</p>}

            <button
              onClick={handleSalvar}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', color: '#080C14', background: `linear-gradient(135deg, ${form.cor}, ${form.cor}BB)`, border: 'none', cursor: 'pointer', fontFamily: '"Space Grotesk", system-ui', boxShadow: `0 0 20px ${form.cor}30`, transition: 'all 0.2s' }}
            >
              {editando ? 'Salvar alterações' : 'Criar meta'}
            </button>
          </div>
        </div>
      )}

      {/* Modal depositar */}
      {depositModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }} onClick={() => setDepositModal(null)} />
          <div className="animate-slide-up" style={{ ...modalBase, maxWidth: '384px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#E2E8F0', margin: 0, letterSpacing: '-0.02em' }}>Depositar na meta</h2>
              <button onClick={() => setDepositModal(null)} style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#475569' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ borderRadius: '12px', padding: '16px', textAlign: 'center', backgroundColor: `${depositModal.cor}12`, border: `1px solid ${depositModal.cor}25` }}>
              <p style={{ fontSize: '28px', marginBottom: '6px' }}>{depositModal.icone}</p>
              <p style={{ fontWeight: 700, color: '#E2E8F0', fontSize: '14px' }}>{depositModal.nome}</p>
              <p style={{ fontSize: '13px', fontFamily: '"JetBrains Mono", monospace', marginTop: '4px', color: depositModal.cor }}>{formatarMoeda(depositModal.valorAtual)} / {formatarMoeda(depositModal.valorAlvo)}</p>
            </div>
            <div>
              <label style={labelStyle}>Valor a depositar (R$)</label>
              <input
                type="number" value={valorDeposito} onChange={(e) => setValorDeposito(e.target.value)}
                placeholder="0,00" min="0.01" step="0.01" autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleDepositar()}
                style={{ ...inputStyle, fontSize: '24px', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', padding: '12px 14px', color: depositModal.cor }}
              />
            </div>
            <button
              onClick={handleDepositar}
              disabled={!valorDeposito || parseFloat(valorDeposito) <= 0}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', color: '#080C14', background: `linear-gradient(135deg, ${depositModal.cor}, ${depositModal.cor}BB)`, border: 'none', cursor: 'pointer', opacity: (!valorDeposito || parseFloat(valorDeposito) <= 0) ? 0.4 : 1, fontFamily: '"Space Grotesk", system-ui' }}
            >
              Confirmar depósito
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
