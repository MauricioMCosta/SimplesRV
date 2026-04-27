import { useEffect, useState } from 'react';
import { useDatabase } from '@/src/context/DatabaseContext';
import { Sell } from '@/src/db/database';
import { DashboardTable } from '@/src/components/DashboardTable';
import { cn } from '@/src/lib/utils';

export default function Sells() {
  const { db } = useDatabase();
  const [sells, setSells] = useState<Sell[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [db.getSells]);

  const loadData = async () => {
    try {
      const data = await db.getSells();
      setSells(data);
    } catch (err) {
      console.error('Failed to load sells', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20 text-gray-400">Carregando dados...</div>;
  }

  const tableData = sells.map(s => ({
    data: { 
      ...s,
      profitPct: s.avgCost > 0 ? (s.profit / (s.qty * s.avgCost)) * 100 : 0
    },
    flags: { canEdit: false, canDelete: false }
  }));

  const tableColumns = {
    date: "Data",
    ticker: "Ticker",
    type: "Tipo",
    qty: { label: "Qtd", type: "number", align: "right" } as any,
    avgCost: { label: "Preço Médio", type: "number", align: "right", formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 } } as any,
    sellPrice: { label: "Preço Venda", type: "number", align: "right", formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 } } as any,
    profit: { label: "Lucro/Prejuízo", type: "number", align: "right", formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 } } as any,
  };

  const tableHeading = (
    <div>
      <h3 className="text-sm font-bold text-brand-ink uppercase tracking-wider">Histórico de Vendas (Realizado)</h3>
      <p className="text-[10px] text-slate-400 font-mono">LUCRO TOTAL: R$ {sells.reduce((acc, curr) => acc + curr.profit, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-title">Lucro Day Trade</div>
          <div className={cn(
            "stat-value",
            sells.filter(s => s.type === 'DAY').reduce((acc, curr) => acc + curr.profit, 0) >= 0 ? "text-green-600" : "text-red-600"
          )}>
            R$ {sells.filter(s => s.type === 'DAY').reduce((acc, curr) => acc + curr.profit, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="card-helper">COMPRA E VENDA NO MESMO DIA</div>
        </div>
        <div className="card">
          <div className="card-title">Lucro Swing Trade</div>
          <div className={cn(
             "stat-value",
             sells.filter(s => s.type === 'SWING').reduce((acc, curr) => acc + curr.profit, 0) >= 0 ? "text-green-600" : "text-red-600"
          )}>
            R$ {sells.filter(s => s.type === 'SWING').reduce((acc, curr) => acc + curr.profit, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="card-helper">POSIÇÕES MANTIDAS POR MAIS DE UM DIA</div>
        </div>
      </div>

      <DashboardTable 
        heading={tableHeading}
        data={tableData}
        columns={tableColumns}
      />
    </div>
  );
}
