import React, { useState, useMemo } from 'react';
import { useDatabase } from '@context/DatabaseContext';
import { AnimatePresence } from 'motion/react';
import { Calculator, ArrowRightLeft, Snowflake, Layers } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AveragePriceCalculator } from '@components/calculators/AveragePriceCalculator';
import { TransferCalculator } from '@components/calculators/TransferCalculator';
import { SnowballCalculator } from '@components/calculators/SnowballCalculator';

export default function Calculators() {
  const { positions, assets, transactions } = useDatabase();
  const [activeTab, setActiveTab] = useState<'avg-price' | 'transfer' | 'snowball'>('avg-price');

  // Option lists for autocompletes shared by sub-components
  const tickerOptions = useMemo(() => {
    const set = new Set<string>();
    positions.forEach(p => {
      const asset = assets.find(a => a.ticker.toUpperCase() === p.ticker.toUpperCase());
      if (!asset || !asset.inactive) {
        set.add(p.ticker.toUpperCase());
      }
    });
    assets.forEach(a => {
      if (!a.inactive) {
        set.add(a.ticker.toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [positions, assets]);

  const positionsOptions = useMemo(() => {
    return Array.from(new Set(
      positions
        .filter(p => {
          const asset = assets.find(a => a.ticker.toUpperCase() === p.ticker.toUpperCase());
          return !asset || !asset.inactive;
        })
        .map(p => p.ticker.toUpperCase())
    )).sort();
  }, [positions, assets]);

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6" id="calculators-page">
      {/* Page Header */}
      <div className="bg-white border border-brand-line p-8 rounded-lg shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-xl shrink-0">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Calculadoras Financeiras
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Simule adições em sua carteira, calcule o efeito Bola de Neve (magic number) ou estude se a realocação de capital entre dois ativos é financeiramente estratégica.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-brand-line shrink-0">
          <button
            onClick={() => setActiveTab('avg-price')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-1.5",
              activeTab === 'avg-price'
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
            id="tab-avg-price"
          >
            <Layers size={14} />
            Preço Médio
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-1.5",
              activeTab === 'transfer'
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
            id="tab-transfer"
          >
            <ArrowRightLeft size={14} />
            Simulação de Troca
          </button>
          <button
            onClick={() => setActiveTab('snowball')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-1.5",
              activeTab === 'snowball'
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
            id="tab-snowball"
          >
            <Snowflake size={14} />
            Bola de Neve
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'avg-price' && (
          <AveragePriceCalculator
            positions={positions}
            assets={assets}
            tickerOptions={tickerOptions}
            key="avg-price-calculator"
          />
        )}

        {activeTab === 'transfer' && (
          <TransferCalculator
            positions={positions}
            assets={assets}
            transactions={transactions}
            tickerOptions={tickerOptions}
            positionsOptions={positionsOptions}
            key="transfer-calculator"
          />
        )}

        {activeTab === 'snowball' && (
          <SnowballCalculator
            positions={positions}
            assets={assets}
            transactions={transactions}
            tickerOptions={tickerOptions}
            key="snowball-calculator"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
