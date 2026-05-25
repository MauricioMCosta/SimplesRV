import React, { useState } from 'react';
import { useDatabase } from '@/src/context/DatabaseContext';
import { useSRVGlobalDialog } from '@/src/context/SRVGlobalDialogContext';
import { Download, Upload, ShieldCheck, Database, RefreshCw, Zap, Trash2 } from 'lucide-react';

export default function Settings() {
  const { db } = useDatabase();
  const { exportDB, importDB, forceRecalculate, consolidateTrades, resetDB } = db;
  const { showAlertDialog, showConfirmDialog } = useSRVGlobalDialog();
  const [isImporting, setIsImporting] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isConsolidating, setIsConsolidating] = useState(false);
  
  const [recalcTickers, setRecalcTickers] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async () => {
    const data = await exportDB();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finlocal-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccess('Backup exportado com sucesso!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      await importDB(text);
      setSuccess('Backup restaurado com sucesso!');
      setTimeout(() => {
        setSuccess(null);
        window.location.reload(); // Refresh to update all views
      }, 2000);
    } catch (err) {
      showAlertDialog('Erro ao importar backup. Verifique o formato do arquivo.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const tickersArr = recalcTickers.split(',')
        .map(t => t.trim().toUpperCase())
        .filter(t => t.length > 0);

      await forceRecalculate(tickersArr.length > 0 ? tickersArr : undefined);
      
      setSuccess('Posições recalculadas com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
 
      setRecalcTickers('');
    } catch (err) {
      showAlertDialog('Erro ao recalcular posições.');
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleConsolidate = async () => {
    setIsConsolidating(true);
    await consolidateTrades()
      .then(() => {
        setSuccess('Trade consolidado com sucesso!');
        setTimeout(() => setSuccess(null), 3000);
      })
      .catch(() => { showAlertDialog('Erro ao consolidar trades.'); })
      .finally(() => { setIsConsolidating(false); })

  };

  const handleReset = async () => {
    showConfirmDialog('Tem certeza que deseja apagar todos os dados? Esta ação é irreversível.', async () => {
      await resetDB();
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Database size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-brand-ink uppercase tracking-wider">Configuração do Banco de Dados</h2>
            <p className="text-[11px] text-slate-500">Sistema de Armazenamento: Dexie (IndexedDB)</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* PAINEL DE PROCESSAMENTO UNIFICADO */}
          <div className="p-4 bg-slate-50 border border-brand-line rounded space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <RefreshCw size={18} className={isRecalculating ? "text-blue-500 animate-spin mt-0.5" : (isConsolidating ? "text-amber-500 animate-pulse mt-0.5" : "text-brand-ink mt-0.5")} />
                <div className="text-[11px]">
                  <p className="font-bold text-brand-ink uppercase">Processamento & Consolidação</p>
                  <p className="text-slate-500 max-w-md">Gerencie a consolidação de lançamentos recentes e o recálculo histórico de posições, custos médios e lucros.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-brand-line">
              {/* Option A: Consolidate Pending */}
              <div className="p-3 bg-white border border-brand-line rounded flex flex-col justify-between">
                <div className="text-[11px] mb-3">
                  <p className="font-bold text-brand-ink uppercase flex items-center gap-1.5 mb-1">
                    <Zap size={12} className="text-amber-500 animate-pulse" />
                    Consolidar Lançamentos
                  </p>
                  <p className="text-slate-500">Processa as transações marcadas como pendentes de consolidação e calcula os lucros correspondentes.</p>
                </div>
                <button
                  onClick={handleConsolidate}
                  disabled={isConsolidating || isRecalculating}
                  className="btn btn-primary font-bold text-[10px] w-full py-2"
                >
                  {isConsolidating ? 'PROCESSANDO...' : 'EXECUTAR CONSOLIDAÇÃO'}
                </button>
              </div>

              {/* Option B: Recalculate / Re-run */}
              <div className="p-3 bg-white border border-brand-line rounded flex flex-col justify-between">
                <div className="text-[11px] mb-3">
                  <p className="font-bold text-slate-700 uppercase flex items-center gap-1.5 mb-1">
                    <RefreshCw size={12} className="text-blue-500" />
                    Recalcular Histórico
                  </p>
                  <p className="text-slate-500">Limpa as tabelas calculadas de posições/vendas e reprocessa as transações do zero.</p>
                </div>

                <div className="space-y-2 mt-2">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="TICKERS (OPCIONAL, EX: PETR4)"
                      className="flex-1 px-2.5 py-1.5 bg-white border border-brand-line rounded text-[10px] outline-none focus:border-brand-accent uppercase font-mono"
                      value={recalcTickers}
                      disabled={isRecalculating || isConsolidating}
                      onChange={(e) => setRecalcTickers(e.target.value)}
                    />
                    <button
                      disabled={isRecalculating || isConsolidating}
                      onClick={handleRecalculate}
                      className="btn font-bold text-[10px]"
                    >
                      {isRecalculating ? '...' : 'RECALCULAR'}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 italic">Deixe o campo vazio para recalcular toda a carteira.</p>
                </div>
              </div>
            </div>
          </div>

          {/* BACKUP E RESET ACTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-brand-line rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download size={16} className="text-slate-400" />
                <div className="text-[11px]">
                  <p className="font-bold text-brand-ink uppercase">Exportar Backup</p>
                  <p className="text-slate-500">Gera um arquivo JSON de backup.</p>
                </div>
              </div>
              <button
                onClick={handleExport}
                className="btn font-bold text-[10px]"
              >
                EXPORTAR
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-brand-line rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Upload size={16} className="text-slate-400" />
                <div className="text-[11px]">
                  <p className="font-bold text-brand-ink uppercase">Restaurar Backup</p>
                  <p className="text-slate-500">Importa e substitui os dados.</p>
                </div>
              </div>
              <label className="btn font-bold text-[10px] cursor-pointer">
                {isImporting ? 'PROCESSANDO...' : 'CARREGAR'}
                <input type="file" className="hidden" accept=".json" onChange={handleImport} disabled={isImporting} />
              </label>
            </div>
          </div>

          <div className="p-3 bg-red-50/50 border border-red-100 rounded flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 size={16} />
              <div className="text-[11px]">
                <p className="font-bold uppercase">Resetar Banco</p>
                <p className="text-slate-500">Apaga permanentemente todos os dados localmente.</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="btn text-red-600 border-red-200 hover:bg-red-50 bg-white font-bold text-[10px]"
            >
              RESETAR
            </button>
          </div>
        </div>

        {success && (
          <div className="mt-6 flex items-center gap-2 p-2.5 bg-green-50 text-green-700 border border-green-100 rounded text-[11px] font-bold animate-in fade-in zoom-in-95">
            <ShieldCheck size={14} />
            {success.toUpperCase()}
          </div>
        )}
      </div>

      <div className="p-6 border border-dashed border-brand-line rounded-lg text-[11px] text-slate-400 font-mono">
        <h4 className="font-bold text-slate-500 mb-1 uppercase tracking-tighter">Protocolo de Segurança</h4>
        <p>Armazenamento Local: Todas as operações e persistência de dados ocorrem exclusivamente no navegador (IndexedDB). Não persistimos seus dados em nuvem ou servidores externos.</p>
      </div>
    </div>
  );
}
