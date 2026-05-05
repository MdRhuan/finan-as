import { AlertCircle } from 'lucide-react';
import type { PreviewImportacao } from '../types';
import { formatarMoeda } from '../utils/formatCurrency';
import { useStore } from '../store/useStore';

interface ImportPreviewTableProps {
  preview: PreviewImportacao[];
  onChange: (preview: PreviewImportacao[]) => void;
}

export function ImportPreviewTable({ preview, onChange }: ImportPreviewTableProps) {
  const categorias = useStore((s) => s.categorias);

  const toggleSelecionada = (idx: number) => {
    const novo = [...preview];
    novo[idx] = { ...novo[idx], selecionada: !novo[idx].selecionada };
    onChange(novo);
  };

  const toggleTodas = (val: boolean) => {
    onChange(preview.map((p) => ({ ...p, selecionada: p.erro ? false : val })));
  };

  const atualizarCampo = (idx: number, campo: keyof PreviewImportacao, valor: string) => {
    const novo = [...preview];
    novo[idx] = { ...novo[idx], [campo]: valor };
    onChange(novo);
  };

  const selecionadas = preview.filter((p) => p.selecionada).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{selecionadas}</span> de {preview.length} selecionadas
        </p>
        <div className="flex gap-2">
          <button onClick={() => toggleTodas(true)} className="text-xs text-blue-500 hover:text-blue-700 font-medium">Selecionar todas</button>
          <span className="text-gray-300">|</span>
          <button onClick={() => toggleTodas(false)} className="text-xs text-gray-400 hover:text-gray-600 font-medium">Desmarcar</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-3 text-left w-8"></th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Data</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Descrição</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {preview.map((p, idx) => (
              <tr
                key={idx}
                className={`transition-colors ${
                  p.erro ? 'bg-red-50/50' : p.selecionada ? 'bg-white' : 'bg-gray-50/50 opacity-60'
                }`}
              >
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={p.selecionada}
                    disabled={!!p.erro}
                    onChange={() => toggleSelecionada(idx)}
                    className="rounded accent-blue-500 cursor-pointer"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="date"
                    value={p.data}
                    onChange={(e) => atualizarCampo(idx, 'data', e.target.value)}
                    className="border-0 bg-transparent text-xs text-gray-600 font-mono w-28 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    value={p.descricao}
                    onChange={(e) => atualizarCampo(idx, 'descricao', e.target.value)}
                    className="border-0 bg-transparent text-xs text-gray-800 w-full min-w-32 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                  />
                  {p.erro && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                      <AlertCircle size={11} />
                      {p.erro}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <select
                    value={p.categoria}
                    onChange={(e) => atualizarCampo(idx, 'categoria', e.target.value)}
                    className="border-0 bg-transparent text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <select
                    value={p.tipo}
                    onChange={(e) => atualizarCampo(idx, 'tipo', e.target.value as 'receita' | 'despesa')}
                    className="border-0 bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                    style={{ color: p.tipo === 'receita' ? '#10B981' : '#EF4444' }}
                  >
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </select>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className={`text-xs font-mono font-semibold ${p.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {formatarMoeda(p.valor)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
