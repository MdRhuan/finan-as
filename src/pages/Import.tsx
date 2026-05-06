import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ImportPreviewTable } from '../components/ImportPreviewTable';
import { processarArquivo } from '../services/importService';
import type { PreviewImportacao } from '../types';

type Etapa = 'upload' | 'processando' | 'preview' | 'sucesso';

export function Import() {
  const { importarTransacoes } = useStore();
  const [etapa, setEtapa] = useState<Etapa>('upload');
  const [progresso, setProgresso] = useState(0);
  const [preview, setPreview] = useState<PreviewImportacao[]>([]);
  const [erros, setErros] = useState<string[]>([]);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [totalLinhas, setTotalLinhas] = useState(0);
  const [qtdImportada, setQtdImportada] = useState(0);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processar = async (arquivo: File) => {
    setNomeArquivo(arquivo.name); setEtapa('processando'); setProgresso(0); setErros([]); setAvisos([]);
    try {
      const r = await processarArquivo(arquivo, setProgresso);
      setPreview(r.preview); setTotalLinhas(r.totalLinhas);
      if (r.erros.length) setAvisos(r.erros);
      setEtapa('preview');
    } catch (err) {
      setErros([err instanceof Error ? err.message : 'Erro']); setEtapa('upload');
    }
  };

  const handleFile = useCallback((arquivo: File) => {
    const ext = arquivo.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) { setErros(['Use CSV ou XLSX']); return; }
    processar(arquivo);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const confirmar = () => {
    const sel = preview.filter((p) => p.selecionada);
    importarTransacoes(sel.map(({ tipo, valor, categoria, data, descricao }) => ({ tipo, valor, categoria, data, descricao })));
    setQtdImportada(sel.length); setEtapa('sucesso');
  };

  const reset = () => { setEtapa('upload'); setPreview([]); setErros([]); setAvisos([]); setProgresso(0); };

  if (etapa === 'sucesso') {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={32} color="#166534" />
        </div>
        <div>
          <h2 className="t-page" style={{ margin: 0 }}>Importação concluída</h2>
          <p className="t-label" style={{ marginTop: 6 }}>{qtdImportada} transações importadas</p>
        </div>
        <button onClick={reset} className="btn-primary">Importar outro arquivo</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 960 }}>
      <div>
        <h1 className="t-page" style={{ margin: 0 }}>Importar planilha</h1>
        <p className="t-label" style={{ marginTop: 4 }}>CSV ou Excel</p>
      </div>

      {etapa === 'upload' && (
        <>
          {erros.length > 0 && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertTriangle size={16} color="var(--neg)" />
              <div>{erros.map((e, i) => <p key={i} style={{ fontSize: 14, color: '#991B1B', margin: 0 }}>{e}</p>)}</div>
            </div>
          )}
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${drag ? 'var(--text)' : 'var(--border)'}`,
              borderRadius: 16, padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
              background: drag ? '#fafafa' : 'var(--card)', transition: 'all .15s',
            }}
          >
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <div style={{ width: 56, height: 56, borderRadius: 12, background: '#F4F4F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Upload size={26} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>{drag ? 'Solte o arquivo' : 'Arraste o arquivo aqui'}</p>
            <p className="t-label" style={{ margin: '0 0 16px' }}>ou clique para selecionar</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {['CSV', 'XLSX'].map((f) => (
                <span key={f} className="badge" style={{ background: '#F4F4F2', display: 'inline-flex', gap: 4 }}>
                  <FileSpreadsheet size={11} /> {f}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {etapa === 'processando' && (
        <div className="card" style={{ padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <FileSpreadsheet size={32} className="animate-pulse" />
          <p style={{ fontWeight: 600, margin: 0 }}>Processando {nomeArquivo}</p>
          <div style={{ width: '100%', maxWidth: 280, background: 'var(--bar-inactive)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
            <div style={{ width: `${progresso}%`, height: '100%', background: 'var(--text)', transition: 'width .3s' }} />
          </div>
          <p className="t-label" style={{ margin: 0 }}>{progresso}%</p>
        </div>
      )}

      {etapa === 'preview' && (
        <>
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileSpreadsheet size={20} />
              <div>
                <p style={{ fontWeight: 600, margin: 0 }}>{nomeArquivo}</p>
                <p className="t-label" style={{ margin: 0 }}>{totalLinhas} linhas</p>
              </div>
            </div>
            <button onClick={reset} style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={16} /></button>
          </div>

          {avisos.length > 0 && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: 14, display: 'flex', gap: 10 }}>
              <AlertTriangle size={15} color="#D97706" />
              <div>{avisos.map((a, i) => <p key={i} style={{ fontSize: 13, color: '#92400E', margin: 0 }}>{a}</p>)}</div>
            </div>
          )}

          <div className="card">
            <h3 className="t-section" style={{ margin: 0, marginBottom: 14 }}>Pré-visualização</h3>
            <ImportPreviewTable preview={preview} onChange={setPreview} />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={reset} className="btn-secondary">Cancelar</button>
            <button onClick={confirmar} disabled={preview.filter((p) => p.selecionada).length === 0} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Importar {preview.filter((p) => p.selecionada).length} <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
