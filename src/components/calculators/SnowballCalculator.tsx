import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Snowflake } from 'lucide-react';
import { SRVFieldset } from '@components/SRVFieldset';
import { SRVInput } from '@components/SRVInput';
import { SRVCard } from '@components/SRVCard';
import { SRVAutoComplete } from '@components/SRVAutoComplete';
import { calculateSnowball } from '@utils/calculatorMath';
import { Position, Asset, Transaction } from '@/src/db/database.types';

interface SnowballCalculatorProps {
  positions: Position[];
  assets: Asset[];
  transactions: Transaction[];
  tickerOptions: string[];
}

export function SnowballCalculator({
  positions,
  assets,
  transactions,
  tickerOptions,
}: SnowballCalculatorProps) {
  const [snowTickerInput, setSnowTickerInput] = useState<string>('');
  const [snowPriceInput, setSnowPriceInput] = useState<string>('0');
  const [snowPayoutInput, setSnowPayoutInput] = useState<string>('0');
  const [snowCurrentQty, setSnowCurrentQty] = useState<string>('0');

  // Helper: Find the most recent DIV/JCP/REND payout for a ticker in transaction history
  const getMostRecentPayout = (ticker: string): number => {
    if (!transactions) return 0;
    const sorted = [...transactions]
      .filter(t => t.ticker.toUpperCase() === ticker.toUpperCase() && (t.type === 'DIV' || t.type === 'JCP' || t.type === 'REND'))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted.length > 0 ? sorted[0].price : 0;
  };

  const handleSnowTickerInput = (value: string) => {
    const uppercased = value.toUpperCase();
    setSnowTickerInput(uppercased);

    const pos = positions.find(p => p.ticker === uppercased);
    const asset = assets.find(a => a.ticker === uppercased);

    if (pos) {
      setSnowPriceInput(pos.avgPrice.toFixed(2));
      setSnowCurrentQty(pos.qty.toString());
      setSnowPayoutInput(getMostRecentPayout(uppercased).toString());
    } else if (asset) {
      setSnowPriceInput('0');
      setSnowCurrentQty('0');
      setSnowPayoutInput(getMostRecentPayout(uppercased).toString());
    } else if (uppercased === '') {
      setSnowPriceInput('0');
      setSnowCurrentQty('0');
      setSnowPayoutInput('0');
    }
  };

  const snowballCalcResult = useMemo(() => {
    return calculateSnowball(
      parseFloat(snowPriceInput) || 0,
      parseFloat(snowPayoutInput) || 0,
      parseFloat(snowCurrentQty) || 0
    );
  }, [snowPriceInput, snowPayoutInput, snowCurrentQty]);

  return (
    <motion.div
      key="snowball-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* Input Section (5 Columns) */}
      <div className="lg:col-span-5 bg-white border border-brand-line rounded-lg p-6 space-y-6">
        <SRVFieldset title="Ativo & Dividendos">
          <div className="space-y-4">
            <div>
              <SRVAutoComplete
                label="Ativo / Código (Ticker)"
                placeholder="Ex: MXRF11, VGIR11..."
                options={tickerOptions}
                value={snowTickerInput}
                onChange={handleSnowTickerInput}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SRVInput
                label="Preço do Ativo (R$)"
                type="number"
                min="0"
                step="any"
                placeholder="0,00"
                value={snowPriceInput}
                onChange={(e) => setSnowPriceInput(e.target.value)}
              />
              <SRVInput
                label="Rendimento Unitário (R$)"
                type="number"
                min="0"
                step="any"
                placeholder="0,00"
                value={snowPayoutInput}
                onChange={(e) => setSnowPayoutInput(e.target.value)}
                title="Provento periódico pago por cada única ação/cota."
              />
            </div>
          </div>
        </SRVFieldset>

        <SRVFieldset title="Sua Posição Atual (Opcional)" hasBorderTop>
          <div>
            <SRVInput
              label="Quantidade que Já Possui"
              type="number"
              min="0"
              placeholder="Ex: 10"
              value={snowCurrentQty}
              onChange={(e) => setSnowCurrentQty(e.target.value)}
            />
            <p className="text-[10px] text-slate-400 mt-1 italic leading-tight">
              Ajuda a calcular as cotas faltantes para o efeito de juros compostos automáticos e compara sua renda.
            </p>
          </div>
        </SRVFieldset>
      </div>

      {/* Metrics Section (7 Columns) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Snowball Focal Card */}
        <div className="bg-slate-900 text-white rounded-lg p-6 border border-slate-800 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none">
            <Snowflake size={130} />
          </div>

          <div className="relative z-10">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black">
              {snowTickerInput ? `BOLA DE NEVE PARA ${snowTickerInput}` : 'ESTRATÉGIA BOLA DE NEVE'}
            </span>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-400">Número Mágico de Cotas</p>
                <h3 className="text-4xl font-extrabold text-blue-400 font-mono mt-1 tracking-tighter">
                  {snowballCalcResult.magicNumber.toLocaleString('pt-BR')} <span className="text-lg font-sans text-slate-300 font-medium">un</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Quantidade mínima do ativo para que o rendimento receba o valor de 1 nova cota.
                </p>
              </div>

              <div className="flex flex-col justify-end">
                <p className="text-xs text-slate-400">Rendimento Recebido</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-2xl font-extrabold text-green-400 font-mono">
                    R$ {snowballCalcResult.monthlyPayout.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                  Rendimento estimado {parseFloat(snowPriceInput) > 0 ? `(${snowballCalcResult.yieldPercent.toFixed(2)}% dy)` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2 justify-between">
            <span className="font-mono">Fórmula: Teto(Preço / Rendimento Unitário)</span>
            <div className="font-mono text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-bold uppercase">
              Efeito Bola de Neve
            </div>
          </div>
        </div>

        {/* Detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SRVCard
            title="Custo da Meta"
            titleClassName="text-[10px] text-slate-400 font-bold uppercase tracking-wider block"
          >
            <div className="mt-1 flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Cotas da Meta:</span>
                <span className="font-mono font-bold text-slate-800">{snowballCalcResult.magicNumber.toLocaleString('pt-BR')} un</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Preço Unitário:</span>
                <span className="font-mono font-bold text-slate-800">R$ {parseFloat(snowPriceInput).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-brand-line">
                <span className="font-bold text-slate-600">Aporte Estimado Total:</span>
                <span className="font-mono font-black text-slate-900">R$ {snowballCalcResult.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </SRVCard>

          <SRVCard
            title="Progresso Técnico"
            titleClassName="text-[10px] text-brand-accent font-bold uppercase tracking-wider block"
          >
            <div className="mt-1 flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Já possui:</span>
                <span className="font-mono font-bold text-slate-800">{parseFloat(snowCurrentQty).toLocaleString('pt-BR')} un</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Cotas faltantes:</span>
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1 rounded">{snowballCalcResult.sharesNeeded.toLocaleString('pt-BR')} un</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-brand-line">
                <span className="font-bold text-brand-sidebar">Custo para atingir:</span>
                <span className="font-mono font-black text-brand-accent">
                  R$ {(snowballCalcResult.sharesNeeded * (parseFloat(snowPriceInput) || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </SRVCard>
        </div>

        {/* Rendimento Futuro Consolidado */}
        <SRVCard
          title="Rendimento Futuro Consolidado"
          titleClassName="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1"
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            <div>
              <p className="text-xs text-slate-500">Renda Atual</p>
              <p className="text-lg font-bold font-mono text-slate-700 mt-1">
                R$ {snowballCalcResult.currentIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Quantidade Nova Total</p>
              <p className="text-lg font-bold font-mono text-slate-800 mt-1">
                {snowballCalcResult.totalSharesAfter.toLocaleString('pt-BR')} <span className="text-xs font-sans text-slate-400">un</span>
              </p>
            </div>
            <div className="col-span-2 lg:col-span-1">
              <p className="text-xs text-slate-500 font-medium text-green-700">Renda Nova Estimada</p>
              <p className="text-lg font-extrabold font-mono text-green-600 mt-1">
                R$ {snowballCalcResult.newIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {parseFloat(snowPayoutInput) > 0 && parseFloat(snowPriceInput) > 0 && (
            <div className="mt-4 pt-4 border-t border-brand-line text-xs">
              {snowballCalcResult.sharesNeeded === 0 ? (
                <p className="text-emerald-700 bg-emerald-50 p-2.5 rounded border border-emerald-100 font-bold flex items-center gap-2">
                  <span>🎉</span> Benefício bola de neve de comprar 1 ação extra automaticamente está ativo! Seus dividendos já cobrem o custo de uma cota extra.
                </p>
              ) : (
                <p className="text-slate-600">
                  Faltam <strong className="font-bold text-indigo-600">{snowballCalcResult.sharesNeeded.toLocaleString('pt-BR')} cotas</strong> para que seus rendimentos comprem uma nova ação.
                </p>
              )}
            </div>
          )}
        </SRVCard>
      </div>
    </motion.div>
  );
}
