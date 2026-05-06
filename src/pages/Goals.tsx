import { useState } from 'react';
import { Plus, Trash2, Pencil, X, Target } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatarMoeda } from '../utils/formatCurrency';
import { formatarData, dataHoje } from '../utils/formatDate';
import { DateInput } from '../components/DateInput';
import type { Meta } from '../types';

const ICONES = ['🎯', '✈️', '🏠', '🚗', '💻', '📱', '🏖️', '🎓', '💍', '🐾', '🏋️', '🎸', '📦', '💰', '🌍'];
const CORES = ['#3B82F6', '#22C55E', '#F97316', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#06B6D4', '#111111'];

interface FormMeta { nome: string; descricao: string; valorAlvo: string; valorAtual: string; prazo: string; icone: string; cor: string; }
const VAZIO: FormMeta = { nome: '', descricao: '', valorAlvo: '', valorAtual: '0', prazo: dataHoje(), icone: '🎯', cor: '#111111' };

export function Goals() {
  const { metas, adicionarMeta, editarMeta, excluirMeta, depositarNaMeta } = useStore();
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Meta | null>(null);
  const [depositMeta, setDepositMeta] = useState<Meta | null>(null);
  const [valorDep, setValorDep] = useState('');
  const [form, setForm] = useState<FormMeta>(VAZIO);
  const [erro, setErro] = useState('');

  const abrirNova = () => { setEditando(null); setForm(VAZIO); setErro(''); setModalAberto(true); };
  const abrirEditar = (m: Meta) => {
    setEditando(m);
    setForm({ nome: m.nome, descricao: m.descricao || '', valorAlvo: String(m.valorAlvo), valorAtual: String(m.valorAtual), prazo: m.prazo, icone: m.icone, cor: m.cor });
    setErro(''); setModalAberto(true);
  };

  const salvar = () => {
    setErro('');
    if (!form.nome.trim()) return setErro('Nome obrigatório');
    const alvo = parseFloat(form.valorAlvo.replace(',', '.'));
    if (!alvo || alvo <= 0) return setErro('Valor alvo inválido');
    const atual = parseFloat(form.valorAtual.replace(',', '.')) || 0;
    if (!form.prazo) return setErro('Informe o prazo');
    const dados = { nome: form.nome.trim(), descricao: form.descricao.trim() || undefined, valorAlvo: alvo, valorAtual: Math.min(atual, alvo), prazo: form.prazo, icone: form.icone, cor: form.cor };
    if (editando) editarMeta(editando.id, { ...dados, concluida: dados.valorAtual >= dados.valorAlvo });
    else adicionarMeta(dados);
    setModalAberto(false);
  };

  const depositar = () => {
    if (!depositMeta) return;
    const v = parseFloat(valorDep.replace(',', '.'));
    if (!v || v <= 0) return;
    depositarNaMeta(depositMeta.id, v);
    setValorDep(''); setDepositMeta(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="t-page" style={{ margin: 0 }}>Metas</h1>
          <p className="t-label" style={{ marginTop: 4 }}>Objetivos de economia</p>
        </div>
        <button onClick={abrirNova} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={15} /> Nova meta
        </button>
      </div>

      {metas.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
          <Target size={42} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{ margin: 0 }}>Nenhuma meta criada ainda</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {metas.map((m) => {
            const pct = Math.min((m.valorAtual / m.valorAlvo) * 100, 100);
            return (
              <div key={m.id} className="card group">
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: '#F4F4F2' }}>
                    {m.concluida ? '✅' : m.icone}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>{m.nome}</h3>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {!m.concluida && (
                          <button onClick={() => { setDepositMeta(m); setValorDep(''); }} className="btn-primary" style={{ padding: '4px 10px', fontSize: 12 }}>+ Depositar</button>
                        )}
                        <button onClick={() => abrirEditar(m)} style={iconBtn}><Pencil size={13} /></button>
                        <button onClick={() => confirm(`Excluir "${m.nome}"?`) && excluirMeta(m.id)} style={iconBtn}><Trash2 size={13} /></button>
                      </div>
                    </div>
                    {m.descricao && <p className="t-label" style={{ margin: '0 0 8px' }}>{m.descricao}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{formatarMoeda(m.valorAtual)}</span>
                      <span style={{ color: 'var(--muted)' }}>de {formatarMoeda(m.valorAlvo)}</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bar-inactive)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--bar-active)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
                      <span>{pct.toFixed(0)}%</span>
                      <span>📅 {formatarData(m.prazo)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ padding: 16 }}>
          <div className="absolute inset-0" style={{ background: 'rgba(17,17,17,0.4)' }} onClick={() => setModalAberto(false)} />
          <div className="card animate-slide-up" style={{ position: 'relative', width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="t-page" style={{ margin: 0 }}>{editando ? 'Editar meta' : 'Nova meta'}</h2>
              <button onClick={() => setModalAberto(false)} style={{ padding: 4, border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <Field label="Nome">
              <input className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Viagem para..." autoFocus />
            </Field>
            <Field label="Descrição (opcional)">
              <input className="input" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Valor alvo (R$)">
                <input className="input" type="number" value={form.valorAlvo} onChange={(e) => setForm({ ...form, valorAlvo: e.target.value })} placeholder="5000" />
              </Field>
              <Field label="Já guardado (R$)">
                <input className="input" type="number" value={form.valorAtual} onChange={(e) => setForm({ ...form, valorAtual: e.target.value })} placeholder="0" />
              </Field>
            </div>
            <Field label="Prazo">
              <DateInput value={form.prazo} onChange={(v) => setForm({ ...form, prazo: v })} />
            </Field>
            <Field label="Ícone">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ICONES.map((ic) => (
                  <button key={ic} type="button" onClick={() => setForm({ ...form, icone: ic })}
                    style={{ width: 36, height: 36, borderRadius: 8, fontSize: 18, cursor: 'pointer', border: form.icone === ic ? '2px solid var(--text)' : '1px solid var(--border)', background: 'var(--card)' }}>
                    {ic}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Cor">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CORES.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, cor: c })}
                    style={{ width: 28, height: 28, borderRadius: 6, background: c, cursor: 'pointer', border: form.cor === c ? '3px solid var(--text)' : '1px solid var(--border)' }} />
                ))}
              </div>
            </Field>
            {erro && <p style={{ color: 'var(--neg)', fontSize: 13, margin: 0 }}>{erro}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setModalAberto(false)} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={salvar} className="btn-primary" style={{ flex: 1 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {depositMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ padding: 16 }}>
          <div className="absolute inset-0" style={{ background: 'rgba(17,17,17,0.4)' }} onClick={() => setDepositMeta(null)} />
          <div className="card animate-slide-up" style={{ position: 'relative', width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 className="t-page" style={{ margin: 0 }}>Depositar em {depositMeta.nome}</h2>
            <Field label="Valor (R$)">
              <input className="input" type="number" value={valorDep} onChange={(e) => setValorDep(e.target.value)} autoFocus placeholder="0,00" />
            </Field>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setDepositMeta(null)} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={depositar} className="btn-primary" style={{ flex: 1 }}>Depositar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = { padding: 6, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card)', cursor: 'pointer', color: 'var(--text)' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="t-label" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
