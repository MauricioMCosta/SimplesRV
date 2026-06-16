import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, ArrowDownRight, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SRVFieldset } from '@components/SRVFieldset';
import { SRVInput } from '@components/SRVInput';
import { SRVCard } from '@components/SRVCard';
import { SRVAutoComplete } from '@components/SRVAutoComplete';
import { calculateStockTransfer } from '@utils/calculatorMath';
import { Position, Asset, Transaction } from '@/src/db/database.types';

interface TransferCalculatorProps {
  positions: Position[];
  assets: Asset[];
  transactions: Transaction[];
  tickerOptions: string[];
  positionsOptions: string[];
}

export function TransferCalculator({
  positions,
  assets,
  transactions,
  tickerOptions,
  positionsOptions,
}: TransferCalculatorProps) {
  const [transOriginTicker, setTransOriginTicker] = useState<string>('');
  const [transOriginQty, setTransOriginQty] = useState<string>('0');
  const [transOriginPrice, setTransOriginPrice] = useState<string>('0');
  const [transOriginPayout, setTransOriginPayout] = useState<string>('0');

  const [transDestTicker, setTransDestTicker] = useState<string>('');
  const [transDestPrice, setTransDestPrice] = useState<string>('0');
  const [transDestPayout, setTransDestPayout] = useState<string>('0');

  // Helper: Find the most recent DIV/JCP/REND payout for a ticker in transaction history
  const getMostRecentPayout = (ticker: string): number => {
    if (!transactions) return 0;
    const sorted = [...transactions]
      .filter(t => t.ticker.toUpperCase() === ticker.toUpperCase() && (t.type === 'DIV' || t.type === 'JCP' || t.type === 'REND'))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted.length > 0 ? sorted[0].price : 0;
  };

  const handleOriginTickerInput = (value: string) => {
    const uppercased = value.toUpperCase();
    setTransOriginTicker(uppercased);
    
    const pos = positions.find(p => p.ticker === uppercased);
    if (pos) {
      setTransOriginQty(pos.qty.toString());
      setTransOriginPrice(pos.avgPrice.toFixed(2));
      setTransOriginPayout(getMostRecentPayout(uppercased).toString());
    } else if (uppercased === '') {
      setTransOriginQty('0');
      setTransOriginPrice('0');
      setTransOriginPayout('0');
    }
  };

  const handleDestTickerInput = (value: string) => {
    const uppercased = value.toUpperCase();
    setTransDestTicker(uppercased);

    const pos = positions.find(p => p.ticker === uppercased);
    const asset = assets.find(a => a.ticker === uppercased);
    
    if (pos) {
      setTransDestPrice(pos.avgPrice.toFixed(2));
      setTransDestPayout(getMostRecentPayout(uppercased).toString());
    } else if (asset) {
      setTransDestPrice('0');
      setTransDestPayout(getMostRecentPayout(uppercased).toString());
    } else if (uppercased === '') {
      setTransDestPrice('0');
      setTransDestPayout('0');
    }
  };

  const transferCalcResult = useMemo(() => {
    return calculateStockTransfer(
      parseFloat(transOriginQty) || 0,
      parseFloat(transOriginPrice) || 0,
      parseFloat(transOriginPayout) || 0,
      parseFloat(transDestPrice) || 0,
      parseFloat(transDestPayout) || 0
    );
  }, [transOriginQty, transOriginPrice, transOriginPayout, transDestPrice, transDestPayout]);

  return (
    <motion.div
      key="transfer-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* ROW 1: (ativo de origem, venda) | ativo de destino (compra) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Origin configuration */}
        <div className="bg-white border border-brand-line rounded-lg p-6">
          <SRVFieldset
            title="Ativo de Origem (Venda)"
            titleClassName="text-xs font-bold text-red-500 uppercase tracking-tight mb-2 flex items-center gap-1.5"
            bulletClassName="bg-red-400"
          >
            <div className="mb-4">
              <SRVAutoComplete
                label="Ativo de Origem / Posição"
                placeholder="Ex: PETR4, MXRF11..."
                options={positionsOptions}
                value={transOriginTicker}
                onChange={handleOriginTickerInput}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <SRVInput
                  label="Qtde"
                  classNameLabel="text-[11px] leading-tighter uppercase tracking-tight"
                  type="number"
                  min="0"
                  value={transOriginQty}
                  onChange={(e) => setTransOriginQty(e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <SRVInput
                  label="Preço Venda (R$)"
                  classNameLabel="text-[11px] leading-tighter uppercase tracking-tight"
                  type="number"
                  min="0"
                  step="any"
                  value={transOriginPrice}
                  onChange={(e) => setTransOriginPrice(e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <SRVInput
                  label="Últ. Dividendo (R$)"
                  classNameLabel="text-[11px] leading-tighter uppercase tracking-tight"
                  type="number"
                  min="0"
                  step="any"
                  value={transOriginPayout}
                  onChange={(e) => setTransOriginPayout(e.target.value)}
                  title="Provento pago por cota/ação mais recente detectado."
                />
              </div>
            </div>
          </SRVFieldset>
        </div>

        {/* Destination configuration */}
        <div className="bg-white border border-brand-line rounded-lg p-6">
          <SRVFieldset
            title="Ativo de Destino (Compra)"
            titleClassName="text-xs font-bold text-green-600 uppercase tracking-tight mb-2 flex items-center gap-1.5"
            bulletClassName="bg-green-500"
          >
            <div className="mb-4">
              <SRVAutoComplete
                label="Ativo de Destino / Código"
                placeholder="Ex: VALE3, AAPL..."
                options={tickerOptions}
                value={transDestTicker}
                onChange={handleDestTickerInput}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SRVInput
                label="Preço Estimado Compra (R$)"
                classNameLabel="text-[11px] uppercase tracking-tight"
                type="number"
                min="0"
                step="any"
                className="placeholder-slate-300"
                value={transDestPrice}
                onChange={(e) => setTransDestPrice(e.target.value)}
                placeholder="0,00"
              />
              <SRVInput
                label="Últ. Dividendo (R$)"
                classNameLabel="text-[11px] uppercase tracking-tight"
                type="number"
                min="0"
                step="any"
                className="placeholder-slate-300"
                value={transDestPayout}
                onChange={(e) => setTransDestPayout(e.target.value)}
                placeholder="0,00"
                title="Provento pago por cota/ação mais recente do destino detectado."
              />
            </div>
          </SRVFieldset>
        </div>
      </div>

      {/* ROW 2: (provento com ativo A) | (provento estimado em ativo b) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Origin card */}
        <SRVCard
          title={`Provento com ${transOriginTicker || 'Ativo O'} (Venda)`}
          titleClassName="text-[10px] text-slate-400 font-bold uppercase tracking-widest block"
        >
          <p className="text-[10px] text-slate-400 italic mb-2">Situação Original</p>
          <div>
            <p className="text-3xl font-extrabold text-slate-800 font-mono tracking-tighter">
              R$ {transferCalcResult.incomeA.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] mt-1 text-slate-400 font-mono">
              Base: {parseFloat(transOriginQty).toLocaleString('pt-BR')} un × R$ {parseFloat(transOriginPayout).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </p>
          </div>
        </SRVCard>

        {/* Expected Destiny Card */}
        <SRVCard
          title={`Provento Estimado em ${transDestTicker || 'Ativo D'} (Compra)`}
          titleClassName="text-[10px] text-brand-sidebar font-bold uppercase tracking-widest block"
        >
          <p className="text-[10px] text-brand-accent font-bold uppercase italic mb-2">Nova Situação</p>
          <div>
            <p className="text-3xl font-extrabold text-brand-accent font-mono tracking-tighter">
              R$ {transferCalcResult.incomeB.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] mt-1 text-slate-400 font-mono">
              Base: {transferCalcResult.qB.toLocaleString('pt-BR')} un × R$ {parseFloat(transDestPayout).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </p>
          </div>
        </SRVCard>
      </div>

      {/* ROW 3: (veredito da analise de troca) */}
      <div className="space-y-6">
        {/* Verdict Announcement component */}
        <div className={cn(
          "rounded-lg p-6 border transition-all shadow-sm flex flex-col gap-4 justify-between relative overflow-hidden",
          !transOriginTicker || !transDestTicker
            ? "bg-slate-50 border-slate-200 text-slate-600"
            : transferCalcResult.isWorth
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-amber-50 border-amber-200 text-amber-950"
        )}>
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase block text-slate-400">
              Veredito da Análise de Troca
            </span>

            {!transOriginTicker || !transDestTicker ? (
              <div className="mt-4 flex flex-col gap-1">
                <h3 className="text-lg font-bold text-slate-800">Defina ou selecione ambos os ativos</h3>
                <p className="text-xs text-slate-500">Selecione uma posição de origem para vender ou digite manualmente nos campos acima para avaliar se vale a pena trocar pelo ativo de destino.</p>
              </div>
            ) : transferCalcResult.isWorth ? (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700">
                  <TrendingUp size={24} />
                  <h3 className="text-xl font-extrabold tracking-tight">Substituição Altamente Recomendada 👍</h3>
                </div>
                <p className="text-sm text-emerald-800 leading-relaxed font-sans">
                  Fazer essa transferência aumentará consideravelmente sua distribuição esperada de proventos! O rendimento estimado gerado aumentará em <strong className="font-extrabold text-emerald-950 text-base font-mono">R$ {transferCalcResult.incomeDiff.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> por período de distribuição (uma variação positiva de <strong className="font-bold text-emerald-950 font-mono">+{transferCalcResult.incomeDiffPercent.toFixed(2)}%</strong>).
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-700">
                  <ArrowDownRight size={24} />
                  <h3 className="text-xl font-extrabold tracking-tight">Substituição Não Vantajosa 👎</h3>
                </div>
                <p className="text-sm text-amber-800 leading-relaxed font-sans">
                  Substituir esses ativos irá diminuir seus rendimentos de proventos periódicos. Você estaria reduzindo sua renda futura em cerca de <strong className="font-extrabold text-amber-950 text-base font-mono">R$ {Math.abs(transferCalcResult.incomeDiff).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> (redução de <strong className="font-bold text-amber-950 font-mono font-black">-{Math.abs(transferCalcResult.incomeDiffPercent).toFixed(2)}%</strong>). Sugere-se continuar alocado em {transOriginTicker}.
                </p>
              </div>
            )}
          </div>

          {transOriginTicker && transDestTicker && (
            <div className="mt-4 pt-4 border-t border-slate-200/50 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="font-bold uppercase text-[9px] text-slate-400">Yield Origem:</span>
                <span className="font-mono font-bold text-slate-700">{transferCalcResult.yieldA.toFixed(2)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold uppercase text-[9px] text-slate-400">Yield Destino:</span>
                <span className="font-mono font-bold text-slate-700">{transferCalcResult.yieldB.toFixed(2)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold uppercase text-[9px] text-slate-400">Recurso Venda:</span>
                <span className="font-mono font-bold text-slate-700 mr-2">R$ {transferCalcResult.salesCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}
        </div>

        {/* Transfer Details / Breakdown */}
        {transOriginTicker && transDestTicker && (
          <SRVCard
            title="Simulação da Execução"
            titleClassName="text-[10px] uppercase font-bold tracking-widest text-slate-400 block pb-1 border-b border-brand-line mb-3"
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Recurso de Venda Gerado:</span>
                <span className="font-mono font-bold text-slate-800">R$ {transferCalcResult.salesCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Novas Cotas/Ações Compradas:</span>
                <span className="font-mono font-bold text-slate-800">{transferCalcResult.qB.toLocaleString('pt-BR')} un de {transDestTicker}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Preço Compra de {transDestTicker}:</span>
                <span className="font-mono font-bold text-slate-800">R$ {parseFloat(transDestPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Troco ou Margem Residual (R$):</span>
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  R$ {transferCalcResult.leftoverCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </SRVCard>
        )}
      </div>
    </motion.div>
  );
}
