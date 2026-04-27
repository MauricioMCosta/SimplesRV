import React, { useState } from 'react';
import { useDatabase } from '@/src/context/DatabaseContext';
import { useDialog } from '@/src/context/DialogContext';
import { Download, Upload, ShieldCheck, Database, RefreshCw, Zap, Trash2 } from 'lucide-react';

export default function Settings() {
  const { db } = useDatabase();
  const { exportDB, importDB, forceRecalculate, consolidateTrades, resetDB } = db;
  const { showAlertDialog, showConfirmDialog } = useDialog();
  const [isImporting, setIsImporting] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [showRecalcForm, setShowRecalcForm] = useState(false);
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
      setShowRecalcForm(false);
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

        <div className="space-y-3">
          <div className="p-3 bg-slate-50 border border-brand-line rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap size={16} className={isConsolidating ? "text-amber-500 animate-pulse" : "text-amber-400"} />
              <div className="text-[11px]">
                <p className="font-bold text-brand-ink uppercase">Consolidar Trades</p>
                <p className="text-slate-500">Processa transações pendentes e calcula lucros diários.</p>
              </div>
            </div>
            <button
              onClick={handleConsolidate}
              disabled={isConsolidating}
              className="btn btn-primary font-bold text-[10px]"
            >
              {isConsolidating ? 'PROCESSANDO...' : 'EXECUTAR AGORA'}
            </button>
          </div>

          <div className="p-3 bg-slate-50 border border-brand-line rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download size={16} className="text-slate-400" />
              <div className="text-[11px]">
                <p className="font-bold text-brand-ink uppercase">Exportar Backup</p>
                <p className="text-slate-500">Gera um arquivo JSON com todos os dados.</p>
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
            <div className="flex items-center gap-3 text-red-500">
              <Trash2 size={16} />
              <div className="text-[11px] text-slate-800">
                <p className="font-bold uppercase">Resetar Banco</p>
                <p className="text-slate-500">Apaga todos os dados localmente.</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="btn text-red-600 border-red-200 hover:bg-red-50 font-bold text-[10px]"
            >
              RESETAR
            </button>
          </div>

          <div className="p-3 bg-slate-50 border border-brand-line rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload size={16} className="text-slate-400" />
              <div className="text-[11px]">
                <p className="font-bold text-brand-ink uppercase">Restaurar Backup</p>
                <p className="text-slate-500">Substitui o banco atual pelos dados do arquivo.</p>
              </div>
            </div>
            <label className="btn font-bold text-[10px] cursor-pointer">
              {isImporting ? 'PROCESSANDO...' : 'CARREGAR ARQUIVO'}
              <input type="file" className="hidden" accept=".json" onChange={handleImport} disabled={isImporting} />
            </label>
          </div>

          <div className="p-3 bg-slate-50 border border-brand-line rounded">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <RefreshCw size={16} className={isRecalculating ? "text-blue-500 animate-spin" : "text-slate-400"} />
                <div className="text-[11px]">
                  <p className="font-bold text-brand-ink uppercase">Recalcular Tudo</p>
                  <p className="text-slate-500">Reseta posições e lucros, e reprocessa todas as transações.</p>
                </div>
              </div>
              <button
                onClick={() => setShowRecalcForm(!showRecalcForm)}
                className="btn font-bold text-[10px]"
              >
                {showRecalcForm ? 'FECHAR' : 'ABRIR FORM'}
              </button>
            </div>

            {showRecalcForm && (
              <div className="mt-4 pt-4 border-t border-brand-line space-y-3">
                <div className="text-[10px] text-slate-500">
                  Informe os tickers separados por vírgula ou deixe em branco para reset total.
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="TICKERS (opcional)"
                    className="flex-1 px-3 py-1.5 bg-white border border-brand-line rounded text-xs outline-none focus:border-brand-accent uppercase"
                    value={recalcTickers}
                    onChange={(e) => setRecalcTickers(e.target.value)}
                  />
                  <button
                    disabled={isRecalculating}
                    onClick={handleRecalculate}
                    className="btn btn-primary font-bold text-[10px]"
                  >
                    {isRecalculating ? 'PROCESSANDO...' : 'EXECUTAR'}
                  </button>
                </div>
              </div>
            )}
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
