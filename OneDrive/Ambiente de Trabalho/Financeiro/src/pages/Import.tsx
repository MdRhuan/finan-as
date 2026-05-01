import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ImportPreviewTable } from '../components/ImportPreviewTable';
import { processarArquivo } from '../services/importService';
import type { PreviewImportacao } from '../types';

type Etapa = 'upload' | 'processando' | 'preview' | 'sucesso';

const card: React.CSSProperties = {
  background: 'rgba(17,24,39,0.7)',
  backdropFilter: 'blur(12px)',
  borderRadius: '16px',
  border: '1px solid #1E2D40',
  padding: '20px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
};

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
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processarFile = async (arquivo: File) => {
    setNomeArquivo(arquivo.name); setEtapa('processando'); setProgresso(0); setErros([]); setAvisos([]);
    try {
      const resultado = await processarArquivo(arquivo, (p) => setProgresso(p));
      setPreview(resultado.preview); setTotalLinhas(resultado.totalLinhas);
      if (resultado.erros.length > 0) setAvisos(resultado.erros);
      setEtapa('preview');
    } catch (err: unknown) {
      setErros([err instanceof Error ? err.message : 'Erro desconhecido']); setEtapa('upload');
    }
  };

  const handleFile = useCallback((arquivo: File) => {
    const ext = arquivo.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) { setErros(['Formato não suportado. Use CSV ou XLSX.']); return; }
    processarFile(arquivo);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const arquivo = e.dataTransfer.files[0];
    if (arquivo) handleFile(arquivo);
  }, [handleFile]);

  const handleConfirmar = () => {
    const selecionadas = preview.filter((p) => p.selecionada);
    importarTransacoes(selecionadas.map((p) => ({ tipo: p.tipo, valor: p.valor, categoria: p.categoria, data: p.data, descricao: p.descricao })));
    setQtdImportada(selecionadas.length); setEtapa('sucesso');
  };

  const reiniciar = () => { setEtapa('upload'); setPreview([]); setErros([]); setAvisos([]); setNomeArquivo(''); setProgresso(0); };

  if (etapa === 'sucesso') {
    return (
      <div style={{ maxWidth: '512px', margin: '0 auto', textAlign: 'center', padding: '80px 0', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'rgba(0,245,212,0.1)', border: '1px solid rgba(0,245,212,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 32px rgba(0,245,212,0.2)' }}>
          <CheckCircle style={{ color: '#00F5D4' }} size={36} />
        </div>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#E2E8F0', marginBottom: '8px', letterSpacing: '-0.02em' }}>Importação concluída!</h2>
          <p style={{ fontSize: '14px', color: '#64748B', fontFamily: '"JetBrains Mono", monospace' }}>
            <span style={{ fontWeight: 700, color: '#00F5D4' }}>{qtdImportada}</span> transações importadas com sucesso
          </p>
        </div>
        <button onClick={reiniciar} className="btn-neon" style={{ padding: '12px 28px', borderRadius: '12px', fontSize: '14px', fontFamily: '"Space Grotesk", system-ui' }}>
          Importar outro arquivo
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '896px' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#E2E8F0', margin: 0, letterSpacing: '-0.03em' }}>Importar Planilha</h1>
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontFamily: '"JetBrains Mono", monospace' }}>importe transações via CSV ou Excel</p>
      </div>

      {etapa === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {erros.length > 0 && (
            <div style={{ backgroundColor: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertTriangle style={{ color: '#F43F5E', flexShrink: 0, marginTop: '2px' }} size={16} />
              <div>{erros.map((e, i) => <p key={i} style={{ fontSize: '14px', color: '#F43F5E' }}>{e}</p>)}</div>
            </div>
          )}

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? '#00F5D4' : '#1E2D40'}`,
              borderRadius: '20px',
              padding: '56px 48px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragging ? 'rgba(0,245,212,0.04)' : 'rgba(17,24,39,0.4)',
              transition: 'all 0.2s',
              boxShadow: isDragging ? '0 0 32px rgba(0,245,212,0.1) inset' : 'none',
            }}
          >
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <div style={{ width: 64, height: 64, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', backgroundColor: isDragging ? 'rgba(0,245,212,0.15)' : '#0D1220', border: `1px solid ${isDragging ? 'rgba(0,245,212,0.4)' : '#1E2D40'}` }}>
              <Upload style={{ color: isDragging ? '#00F5D4' : '#475569' }} size={28} />
            </div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#E2E8F0', marginBottom: '6px', letterSpacing: '-0.02em' }}>
              {isDragging ? 'Solte o arquivo aqui' : 'Arraste o arquivo aqui'}
            </p>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>ou clique para selecionar</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              {['CSV', 'XLSX / XLS'].map((fmt) => (
                <span key={fmt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', backgroundColor: '#0D1220', border: '1px solid #1E2D40', padding: '4px 14px', borderRadius: '999px', fontFamily: '"JetBrains Mono", monospace' }}>
                  <FileSpreadsheet size={12} /> {fmt}
                </span>
              ))}
            </div>
          </div>

          <div style={card}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Formato esperado</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#080C14' }}>
                    {['Data', 'Descrição', 'Valor', 'Tipo (opcional)', 'Categoria (opcional)'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#475569', fontWeight: 600, borderBottom: '1px solid #1E2D40', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['01/05/2026', 'iFood', '-45,90', 'despesa', 'Alimentação'],
                    ['02/05/2026', 'Salário', '5000,00', 'receita', 'Salário'],
                  ].map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: ri === 0 ? '1px solid #1E2D40' : 'none' }}>
                      <td style={{ padding: '8px 10px', fontFamily: '"JetBrains Mono", monospace', color: '#CBD5E1' }}>{row[0]}</td>
                      <td style={{ padding: '8px 10px', color: '#CBD5E1' }}>{row[1]}</td>
                      <td style={{ padding: '8px 10px', fontFamily: '"JetBrains Mono", monospace', color: ri === 0 ? '#F43F5E' : '#10B981' }}>{row[2]}</td>
                      <td style={{ padding: '8px 10px', color: '#475569' }}>{row[3]}</td>
                      <td style={{ padding: '8px 10px', color: '#475569' }}>{row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '12px', fontFamily: '"JetBrains Mono", monospace' }}>→ Valores negativos são detectados como despesas automaticamente</p>
          </div>
        </div>
      )}

      {etapa === 'processando' && (
        <div style={{ ...card, padding: '56px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: 64, height: 64, backgroundColor: 'rgba(0,245,212,0.1)', border: '1px solid rgba(0,245,212,0.3)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileSpreadsheet style={{ color: '#00F5D4' }} size={28} className="animate-pulse" />
          </div>
          <div>
            <p style={{ fontWeight: 700, color: '#E2E8F0', marginBottom: '4px' }}>Processando {nomeArquivo}</p>
            <p style={{ fontSize: '13px', color: '#475569', fontFamily: '"JetBrains Mono", monospace' }}>analisando dados...</p>
          </div>
          <div style={{ width: '100%', maxWidth: '280px' }}>
            <div style={{ width: '100%', backgroundColor: '#1E2D40', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${progresso}%`, height: '6px', background: 'linear-gradient(90deg, #00F5D4, #10B981)', borderRadius: '999px', transition: 'width 0.3s', boxShadow: '0 0 10px rgba(0,245,212,0.4)' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '8px', fontFamily: '"JetBrains Mono", monospace' }}>{progresso}%</p>
          </div>
        </div>
      )}

      {etapa === 'preview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 40, height: 40, backgroundColor: 'rgba(0,245,212,0.1)', border: '1px solid rgba(0,245,212,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileSpreadsheet style={{ color: '#00F5D4' }} size={18} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: '#E2E8F0', fontSize: '14px' }}>{nomeArquivo}</p>
                  <p style={{ fontSize: '12px', color: '#475569', fontFamily: '"JetBrains Mono", monospace' }}>{totalLinhas} linhas encontradas</p>
                </div>
              </div>
              <button onClick={reiniciar} style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#475569' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {avisos.length > 0 && (
            <div style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertTriangle style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }} size={15} />
              <div>{avisos.map((a, i) => <p key={i} style={{ fontSize: '14px', color: '#F59E0B' }}>{a}</p>)}</div>
            </div>
          )}

          <div style={card}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pré-visualização — edite antes de salvar</h3>
            <ImportPreviewTable preview={preview} onChange={setPreview} />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={reiniciar}
              style={{ padding: '10px 20px', border: '1px solid #1E2D40', borderRadius: '12px', fontSize: '14px', fontWeight: 500, color: '#64748B', backgroundColor: '#080C14', cursor: 'pointer', fontFamily: '"Space Grotesk", system-ui' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={preview.filter((p) => p.selecionada).length === 0}
              className="btn-neon"
              style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontFamily: '"Space Grotesk", system-ui', display: 'flex', alignItems: 'center', gap: '8px', opacity: preview.filter((p) => p.selecionada).length === 0 ? 0.4 : 1 }}
            >
              Importar {preview.filter((p) => p.selecionada).length} transações
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
