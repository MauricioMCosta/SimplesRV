import { useEffect, useState, useMemo } from 'react';
import { useDatabase } from '@/src/context/DatabaseContext';
import { SRVCard } from '@/src/components/SRVCard';
import { DashboardTable } from '@/src/components/DashboardTable';
import { DataTableWrapper } from '../components/DataTableWrapper';


export default function Dashboard() {
  const { positions, transactions, assets, custodians, db } = useDatabase();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadMeta() {
    try {
      const lu = await db.getLastUpdated();
      setLastUpdated(lu);
    } catch (err) {
      console.error('Failed to load dashboard meta', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMeta();
  }, [db, positions]);

  const handleConsolidate = async () => {
    await db.consolidateTrades();
  };

  const pendingTransactions = useMemo(() => transactions.filter(t => t.is_pending).length, [transactions]);
  const pendingAssets = useMemo(() => assets.filter(a => a.is_pending).length, [assets]);
  const pendingCustodians = useMemo(() => custodians.filter(c => c.is_pending).length, [custodians]);

  const tableData = useMemo(() => positions.map(b => ({
    id: b.ticker,
    data: { 
      ...b,
      total: b.qty * b.avgPrice
    },
    flags: { canEdit: false, canDelete: false }
  })), [positions]);

  const tableColumns = useMemo(() => ({
    ticker: "Ticker",
    qty: { label: "Quantidade", type: "number", align: "right" } as any,
    avgPrice: { label: "Preço Médio", type: "number", align: "right", formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 } } as any,
    total: { label: "Total", type: "number", align: "right", formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 } } as any
  }), []);

  const handleColumnRender = (row: any, key: string, val: any) => {
    if (key === 'ticker') {
      return { cellStyle: "font-bold text-brand-ink font-mono" };
    }
    return null;
  };

  if (isLoading) {
    return <div className="flex justify-center py-20 text-gray-400">Carregando dados...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SRVCard
          title="Consolidação"
          content={pendingTransactions > 0 ? `🟡 ${pendingTransactions} pendentes` : "🟢 OK"}
          footer={
             (pendingTransactions > 0) ? (
              <button
                onClick={handleConsolidate}
                className="bg-brand-sidebar text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-brand-ink transition shadow-sm"
              >
                Consolidar
              </button>
             ) : (lastUpdated ? `Sincronizado: ${new Date(lastUpdated).toLocaleTimeString()}` : 'Pronto')
          }
        />

        <SRVCard
          title="Ativos Pendentes"
          content={pendingAssets > 0 ? `🟡 ${pendingAssets} por completar` : "🟢 OK"}
          footer={pendingAssets > 0 ? "Verifique a aba Ativos" : "Todos dados ok"}
        />

        <SRVCard
          title="Custodias Pendentes"
          content={pendingCustodians > 0 ? `🟡 ${pendingCustodians} pendentes` : "🟢 OK"}
          footer={pendingCustodians > 0 ? "Verifique a aba Custodiantes" : "Tudo conferido"}
        />

        <SRVCard
          title="Resumo Carteira"
          content={`${positions.length} Tickers`}
          footer={`Total: R$ ${positions.reduce((acc, p) => acc + (p.qty * p.avgPrice), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        />
      </div>
      <DataTableWrapper initialData={tableData}>
      <DashboardTable 
        heading="Posição das ações"
        columns={tableColumns}
        onColumnRender={handleColumnRender}
      />
      </DataTableWrapper>
    </div>
  );
}
