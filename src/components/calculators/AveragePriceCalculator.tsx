import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calculator, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { SRVFieldset } from '@components/SRVFieldset';
import { SRVInput } from '@components/SRVInput';
import { SRVCard } from '@components/SRVCard';
import { SRVAutoComplete } from '@components/SRVAutoComplete';
import { calculateFutureAveragePrice } from '@utils/calculatorMath';
import { Position, Asset } from '@/src/db/database.types';

interface AveragePriceCalculatorProps {
  positions: Position[];
  assets: Asset[];
  tickerOptions: string[];
}

export function AveragePriceCalculator({
  positions,
  assets,
  tickerOptions,
}: AveragePriceCalculatorProps) {
  const [avgTickerInput, setAvgTickerInput] = useState<string>('');
  const [avgCurrentQty, setAvgCurrentQty] = useState<string>('0');
  const [avgCurrentPrice, setAvgCurrentPrice] = useState<string>('0');
  const [avgPurchaseQty, setAvgPurchaseQty] = useState<string>('0');
  const [avgPurchasePrice, setAvgPurchasePrice] = useState<string>('0');

  const handleAvgTickerChange = (value: string) => {
    const uppercased = value.toUpperCase();
    setAvgTickerInput(uppercased);
    
    const pos = positions.find(p => p.ticker === uppercased);
    if (pos) {
      setAvgCurrentQty(pos.qty.toString());
      setAvgCurrentPrice(pos.avgPrice.toFixed(2));
    } else if (uppercased === '') {
      setAvgCurrentQty('0');
      setAvgCurrentPrice('0');
    }
  };

  const avgCalcResult = useMemo(() => {
    return calculateFutureAveragePrice(
      parseFloat(avgCurrentQty) || 0,
      parseFloat(avgCurrentPrice) || 0,
      parseFloat(avgPurchaseQty) || 0,
      parseFloat(avgPurchasePrice) || 0
    );
  }, [avgCurrentQty, avgCurrentPrice, avgPurchaseQty, avgPurchasePrice]);

  return (
    <motion.div
      key="avg-price-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* Input Section (5 Columns) */}
      <div className="lg:col-span-5 bg-white border border-brand-line rounded-lg p-6 space-y-6">
        <SRVFieldset title="Ativo & Posição Atual">
          <div className="space-y-4">
            <div>
              <SRVAutoComplete
                label="Ativo / Código (Ticker)"
                placeholder="Ex: PETR4, MXRF11..."
                options={tickerOptions}
                value={avgTickerInput}
                onChange={handleAvgTickerChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SRVInput
                label="Quantidade Atual"
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={avgCurrentQty}
                onChange={(e) => setAvgCurrentQty(e.target.value)}
              />
              <SRVInput
                label="Preço Médio Atual (R$)"
                type="number"
                min="0"
                step="any"
                placeholder="0,00"
                value={avgCurrentPrice}
                onChange={(e) => setAvgCurrentPrice(e.target.value)}
              />
            </div>
          </div>
        </SRVFieldset>

        <SRVFieldset title="Simulação de Compra" hasBorderTop>
          <div className="grid grid-cols-2 gap-4">
            <SRVInput
              label="Quantidade à Comprar"
              type="number"
              min="0"
              step="any"
              placeholder="Ex: 50"
              value={avgPurchaseQty}
              onChange={(e) => setAvgPurchaseQty(e.target.value)}
            />
            <SRVInput
              label="Preço Unitário de Compra (R$)"
              type="number"
              min="0"
              step="any"
              placeholder="Ex: 25,10"
              value={avgPurchasePrice}
              onChange={(e) => setAvgPurchasePrice(e.target.value)}
            />
          </div>
        </SRVFieldset>
      </div>

      {/* Metrics Section (7 Columns) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Main Simulated Price Card */}
        <div className="bg-slate-900 text-white rounded-lg p-6 border border-slate-800 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none">
            <Calculator size={130} />
          </div>

          <div className="relative z-10">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black">
              {avgTickerInput ? `SIMULAÇÃO PARA ${avgTickerInput}` : 'SIMULAÇÃO DE PREÇO MÉDIO'}
            </span>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-400">Novo Preço Médio Estimado</p>
                <h3 className="text-4xl font-extrabold text-white font-mono mt-1 tracking-tighter">
                  R$ {avgCalcResult.newAvgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </h3>
              </div>

              <div className="flex flex-col justify-end">
                <p className="text-xs text-slate-400">Variação do Preço Médio</p>
                <div className="flex items-center gap-2 mt-1">
                  {avgCalcResult.priceDiff === 0 ? (
                    <span className="text-sm font-bold text-slate-300 font-mono">Sem alteração</span>
                  ) : avgCalcResult.priceDiff < 0 ? (
                    <div className="flex items-center gap-1 text-green-400 font-mono font-bold text-base">
                      <ArrowDownRight size={18} />
                      <span>-{Math.abs(avgCalcResult.priceDiffPercent).toFixed(2)}% (-R$ {Math.abs(avgCalcResult.priceDiff).toFixed(2)})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-500 font-mono font-bold text-base">
                      <ArrowUpRight size={18} />
                      <span>+{Math.abs(avgCalcResult.priceDiffPercent).toFixed(2)}% (+R$ {Math.abs(avgCalcResult.priceDiff).toFixed(2)})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2 justify-between">
            <span className="font-mono">Fórmula: (Valor Atual + Valor Compra) / Nova Quantidade</span>
            <div className="font-mono text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-bold uppercase">
              Novo Preço
            </div>
          </div>
        </div>

        {/* Grid of details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SRVCard
            title="Posição Original"
            titleClassName="text-[10px] text-slate-400 font-bold uppercase tracking-wider block"
          >
            <div className="mt-1 flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Quantidade:</span>
                <span className="font-mono font-bold text-slate-800">{parseFloat(avgCurrentQty).toLocaleString('pt-BR')} un</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Média:</span>
                <span className="font-mono font-bold text-slate-800">R$ {parseFloat(avgCurrentPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-brand-line">
                <span className="font-bold text-slate-600">Total Alocado:</span>
                <span className="font-mono font-bold text-slate-900">R$ {avgCalcResult.currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </SRVCard>

          <SRVCard
            title="Valor do Novo Aporte"
            titleClassName="text-[10px] text-brand-accent font-bold uppercase tracking-wider block"
          >
            <div className="mt-1 flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Qtde à Comprar:</span>
                <span className="font-mono font-bold text-slate-800">{parseFloat(avgPurchaseQty).toLocaleString('pt-BR')} un</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Preço Compra:</span>
                <span className="font-mono font-bold text-slate-800">R$ {parseFloat(avgPurchasePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-brand-line">
                <span className="font-bold text-brand-sidebar">Aporte Adicional:</span>
                <span className="font-mono font-black text-brand-accent">R$ {avgCalcResult.purchaseTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </SRVCard>
        </div>

        {/* End simulation output card */}
        <SRVCard
          title="Futura Posição Consolidada"
          titleClassName="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1"
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            <div>
              <p className="text-xs text-slate-500">Quantidade Total</p>
              <p className="text-xl font-bold font-mono text-slate-800 mt-1">
                {avgCalcResult.totalQty.toLocaleString('pt-BR')} <span className="text-xs font-sans text-slate-400">un</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Alocado</p>
              <p className="text-xl font-bold font-mono text-slate-800 mt-1">
                R$ {avgCalcResult.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="col-span-2 lg:col-span-1">
              <p className="text-xs text-slate-500">Preço Médio Consolidado</p>
              <p className="text-xl font-extrabold font-mono text-brand-accent mt-1">
                R$ {avgCalcResult.newAvgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </p>
            </div>
          </div>
        </SRVCard>
      </div>
    </motion.div>
  );
}
