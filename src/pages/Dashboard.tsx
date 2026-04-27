import { useEffect, useState } from 'react';
import { useDatabase } from '@/src/context/DatabaseContext';
import { DashboardCard } from '@/src/components/DashboardCard';
import { DashboardTable } from '@/src/components/DashboardTable';

export default function Dashboard() {
  const { db } = useDatabase();
  const [balances, setBalances] = useState<{ ticker: string; qty: number; avgPrice: number }[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    try {
      const [b, lu, pc] = await Promise.all([db.getBalances(), db.getLastUpdated(), db.countPendingTransactions()]);
      setBalances(b as any);
      setLastUpdated(lu);
      setPendingCount(pc);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [db]);

  const handleConsolidate = async () => {
    await db.consolidateTrades();
    loadData();
  };

  if (isLoading) {
    return <div className="flex justify-center py-20 text-gray-400">Carregando dados...</div>;
  }

  const tableData = balances.map(b => ({
    data: { 
      ...b,
      total: b.qty * b.avgPrice
    },
    flags: { canEdit: false, canDelete: false }
  }));

  const tableColumns = {
    ticker: "Ticker",
    qty: { label: "Quantidade", type: "number", align: "right" } as any,
    avgPrice: { label: "Preço Médio", type: "number", align: "right", formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 } } as any,
    total: { label: "Total", type: "number", align: "right", formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 } } as any
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard
          title="Database Status"
          content="🟢 Conectado"
          footer={lastUpdated ? `Updated: ${new Date(lastUpdated).toLocaleString()}` : 'Updated: N/A'}
        />

        <DashboardCard
          title="Assets Total"
          content={`${balances.length} Tickers`}
          footer="Portfolio Ativo"
        />

        <DashboardCard
          title="Armazenamento"
          content="Dexie (IndexedDB)"
          footer="Estabilidade: Optimized"
        />

        <DashboardCard
          title="Ativos pendentes"
          content={pendingCount > 0 ? `🟡 ${pendingCount} ativos pendentes` : "🟢 Ok"}
          footer={
             (pendingCount>0) && <button
              onClick={handleConsolidate}
              disabled={pendingCount === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400 hover:bg-blue-700 transition"
            >
              Consolidar
            </button>}
          
        />
      </div>

      <DashboardTable 
        heading="Posição das ações"
        data={tableData}
        columns={tableColumns}
      />
    </div>
  );
}
