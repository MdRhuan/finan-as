import { useState } from 'react';
import { Trash2, Download, AlertTriangle, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import ExcelJS from 'exceljs';
import { useStore } from '../store/useStore';
import { filtrarPorMes } from '../services/transactionService';
import { formatarMes, formatarData } from '../utils/formatDate';
import { usuarioAtual } from '../services/auth';

function mudarMes(mes: string, delta: number) {
  const [a, m] = mes.split('-').map(Number);
  const d = new Date(a, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function Settings() {
  const { transacoes, mesSelecionado, setMesSelecionado, limparTudo } = useStore();
  const [confirmando, setConfirmando] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const usuario = usuarioAtual();

  const exportar = (formato: 'xlsx' | 'csv') => {
    const doMes = filtrarPorMes(transacoes, mesSelecionado);
    const linhas = doMes.map((t) => ({
      Data: formatarData(t.data),
      Descrição: t.descricao,
      Valor: t.tipo === 'receita' ? t.valor : -t.valor,
      Tipo: t.tipo === 'receita' ? 'Receita' : 'Despesa',
      Categoria: t.categoria,
    }));
    const ws = XLSX.utils.json_to_sheet(linhas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, mesSelecionado);
    const nome = `financeiro_${usuario}_${mesSelecionado}.${formato}`;
    if (formato === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = nome; a.click();
      URL.revokeObjectURL(url);
    } else {
      XLSX.writeFile(wb, nome);
    }
  };

  const confirmarExclusao = () => {
    if (confirmText !== 'EXCLUIR') return;
    limparTudo();
    setConfirmando(false);
    setConfirmText('');
  };

  const doMes = filtrarPorMes(transacoes, mesSelecionado);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 className="t-hero" style={{ margin: 0 }}>Configurações</h1>
        <p className="t-label" style={{ marginTop: 4 }}>
          Conta: <strong style={{ color: 'var(--text)' }}>{usuario}</strong>
        </p>
      </div>

      {/* Exportar */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <FileSpreadsheet size={18} />
          <h2 className="t-section" style={{ margin: 0 }}>Exportar planilha do mês</h2>
        </div>
        <p className="t-label" style={{ marginBottom: 16 }}>
          Baixe todas as transações do mês selecionado em Excel ou CSV.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '6px 10px' }}>
            <button onClick={() => setMesSelecionado(mudarMes(mesSelecionado, -1))} style={btnIcon}><ChevronLeft size={14} /></button>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 140, textAlign: 'center', textTransform: 'capitalize' }}>{formatarMes(mesSelecionado)}</span>
            <button onClick={() => setMesSelecionado(mudarMes(mesSelecionado, 1))} style={btnIcon}><ChevronRight size={14} /></button>
          </div>
          <span className="t-label">{doMes.length} transação(ões) no mês</span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => exportar('xlsx')} disabled={doMes.length === 0} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: doMes.length === 0 ? 0.5 : 1 }}>
            <Download size={14} /> Baixar Excel (.xlsx)
          </button>
          <button className="btn-secondary" onClick={() => exportar('csv')} disabled={doMes.length === 0} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: doMes.length === 0 ? 0.5 : 1 }}>
            <Download size={14} /> Baixar CSV
          </button>
        </div>
      </div>

      {/* Zona de perigo */}
      <div className="card" style={{ borderColor: '#FECACA' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <AlertTriangle size={18} style={{ color: 'var(--neg)' }} />
          <h2 className="t-section" style={{ margin: 0, color: 'var(--neg)' }}>Zona de perigo</h2>
        </div>
        <p className="t-label" style={{ marginBottom: 16 }}>
          Esta ação remove permanentemente todas as suas transações, categorias personalizadas, contas e metas.
          O cadastro de usuário é mantido. Outros usuários não são afetados.
        </p>

        {!confirmando ? (
          <button
            className="btn-primary"
            onClick={() => setConfirmando(true)}
            style={{ background: 'var(--neg)', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Trash2 size={14} /> Excluir todas as informações
          </button>
        ) : (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 16 }}>
            <p style={{ margin: 0, marginBottom: 10, fontSize: 13, color: '#991B1B' }}>
              Tem certeza? Digite <strong>EXCLUIR</strong> para confirmar.
            </p>
            <input
              className="input"
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="EXCLUIR"
              style={{ marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-primary"
                onClick={confirmarExclusao}
                disabled={confirmText !== 'EXCLUIR'}
                style={{ background: 'var(--neg)', opacity: confirmText !== 'EXCLUIR' ? 0.5 : 1 }}
              >
                Confirmar exclusão
              </button>
              <button className="btn-secondary" onClick={() => { setConfirmando(false); setConfirmText(''); }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const btnIcon: React.CSSProperties = { padding: 4, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text)' };
