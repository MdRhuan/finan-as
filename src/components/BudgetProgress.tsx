import { formatarMoeda } from '../utils/formatCurrency';

interface BudgetProgressProps {
  categoria: string;
  gasto: number;
  limite: number;
  cor: string;
  icone: string;
}

export function BudgetProgress({ categoria, gasto, limite, cor, icone }: BudgetProgressProps) {
  const pct = Math.min((gasto / limite) * 100, 100);
  const excedido = gasto > limite;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{icone}</span>
          <span className="text-sm font-medium text-gray-700">{categoria}</span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-semibold ${excedido ? 'text-red-500' : 'text-gray-900'}`}>
            {formatarMoeda(gasto)}
          </span>
          <span className="text-xs text-gray-400"> / {formatarMoeda(limite)}</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: excedido ? '#EF4444' : cor,
          }}
        />
      </div>
      {excedido && (
        <p className="text-xs text-red-500 font-medium">
          Excedido em {formatarMoeda(gasto - limite)}
        </p>
      )}
    </div>
  );
}
