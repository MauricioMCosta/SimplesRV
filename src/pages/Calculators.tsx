import React, { useState, useMemo, useEffect } from 'react';
import { useDatabase } from '@context/DatabaseContext';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ArrowRightLeft, TrendingUp, ArrowUpRight, ArrowDownRight, Layers, Snowflake, Coins } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SRVInput } from '@components/SRVInput';
import { SRVFieldset } from '@components/SRVFieldset';
import { SRVCard } from '@components/SRVCard';
import { calculateFutureAveragePrice, calculateStockTransfer, calculateSnowball } from '@utils/calculatorMath';

export default function Calculators() {
  const { positions, assets, transactions } = useDatabase();
  const [activeTab, setActiveTab] = useState<'avg-price' | 'transfer' | 'snowball'>('avg-price');

  // --- CALC 1: PREÇO MÉDIO STATE ---
  const [avgSelectedTicker, setAvgSelectedTicker] = useState<string>('custom');
  const [avgTickerInput, setAvgTickerInput] = useState<string>('');
  const [avgCurrentQty, setAvgCurrentQty] = useState<string>('0');
  const [avgCurrentPrice, setAvgCurrentPrice] = useState<string>('0');
  const [avgPurchaseQty, setAvgPurchaseQty] = useState<string>('0');
  const [avgPurchasePrice, setAvgPurchasePrice] = useState<string>('0');

  // Sync Calc 1 when a position is selected
  useEffect(() => {
    if (avgSelectedTicker === 'custom') {
      setAvgTickerInput('');
      setAvgCurrentQty('0');
      setAvgCurrentPrice('0');
    } else {
      const pos = positions.find(p => p.ticker === avgSelectedTicker);
      if (pos) {
        setAvgTickerInput(pos.ticker);
        setAvgCurrentQty(pos.qty.toString());
        setAvgCurrentPrice(pos.avgPrice.toFixed(2));
      }
    }
  }, [avgSelectedTicker, positions]);

  // --- CALC 2: TRANSFER STATE ---
  const [transSelectedOrigin, setTransSelectedOrigin] = useState<string>('');
  const [transOriginTicker, setTransOriginTicker] = useState<string>('');
  const [transOriginQty, setTransOriginQty] = useState<string>('0');
  const [transOriginPrice, setTransOriginPrice] = useState<string>('0');
  const [transOriginPayout, setTransOriginPayout] = useState<string>('0');

  const [transSelectedDest, setTransSelectedDest] = useState<string>('');
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

  // Sync Calc 2 Origin stock
  useEffect(() => {
    if (transSelectedOrigin) {
      setTransOriginTicker(transSelectedOrigin);
      const pos = positions.find(p => p.ticker === transSelectedOrigin);
      if (pos) {
        setTransOriginQty(pos.qty.toString());
        setTransOriginPrice(pos.avgPrice.toFixed(2));
        const estimatedPayout = getMostRecentPayout(pos.ticker);
        setTransOriginPayout(estimatedPayout.toString());
      }
    }
  }, [transSelectedOrigin, positions]);

  // Sync Calc 2 Destination stock
  useEffect(() => {
    if (transSelectedDest) {
      setTransDestTicker(transSelectedDest);
      const pos = positions.find(p => p.ticker === transSelectedDest);
      const estPayout = getMostRecentPayout(transSelectedDest);
      setTransDestPayout(estPayout.toString());
      if (pos) {
        setTransDestPrice(pos.avgPrice.toFixed(2));
      } else {
        setTransDestPrice('0');
      }
    }
  }, [transSelectedDest, positions]);

  const handleOriginTickerInput = (ticker: string) => {
    const uppercased = ticker.toUpperCase();
    setTransOriginTicker(uppercased);
    
    // Check if the typed ticker matches one of the user's positions
    const pos = positions.find(p => p.ticker === uppercased);
    if (pos) {
      setTransSelectedOrigin(uppercased);
      setTransOriginQty(pos.qty.toString());
      setTransOriginPrice(pos.avgPrice.toFixed(2));
      setTransOriginPayout(getMostRecentPayout(uppercased).toString());
    } else {
      setTransSelectedOrigin('');
    }
  };

  const handleDestTickerInput = (ticker: string) => {
    const uppercased = ticker.toUpperCase();
    setTransDestTicker(uppercased);

    // Check if it matches an asset
    const asset = assets.find(a => a.ticker === uppercased);
    if (asset) {
      setTransSelectedDest(uppercased);
      const pos = positions.find(p => p.ticker === uppercased);
      if (pos) {
        setTransDestPrice(pos.avgPrice.toFixed(2));
      } else {
        setTransDestPrice('0');
      }
      setTransDestPayout(getMostRecentPayout(uppercased).toString());
    } else {
      setTransSelectedDest('');
    }
  };

  // --- CALC 3: BOLA DE NEVE STATE ---
  const [snowSelectedTicker, setSnowSelectedTicker] = useState<string>('custom');
  const [snowTickerInput, setSnowTickerInput] = useState<string>('');
  const [snowPriceInput, setSnowPriceInput] = useState<string>('0');
  const [snowPayoutInput, setSnowPayoutInput] = useState<string>('0');
  const [snowCurrentQty, setSnowCurrentQty] = useState<string>('0');

  useEffect(() => {
    if (snowSelectedTicker === 'custom') {
      setSnowTickerInput('');
      setSnowPriceInput('0');
      setSnowPayoutInput('0');
      setSnowCurrentQty('0');
    } else {
      const pos = positions.find(p => p.ticker === snowSelectedTicker);
      const estimatedPayout = getMostRecentPayout(snowSelectedTicker);
      setSnowTickerInput(snowSelectedTicker);
      setSnowPayoutInput(estimatedPayout.toString());
      if (pos) {
        setSnowPriceInput(pos.avgPrice.toFixed(2));
        setSnowCurrentQty(pos.qty.toString());
      } else {
        setSnowPriceInput('0');
        setSnowCurrentQty('0');
      }
    }
  }, [snowSelectedTicker, positions]);

  const handleSnowTickerInput = (ticker: string) => {
    const uppercased = ticker.toUpperCase();
    setSnowTickerInput(uppercased);

    const pos = positions.find(p => p.ticker === uppercased);
    const asset = assets.find(a => a.ticker === uppercased);

    if (pos) {
      setSnowSelectedTicker(uppercased);
      setSnowPriceInput(pos.avgPrice.toFixed(2));
      setSnowCurrentQty(pos.qty.toString());
      setSnowPayoutInput(getMostRecentPayout(uppercased).toString());
    } else if (asset) {
      setSnowSelectedTicker(uppercased);
      setSnowPriceInput('0');
      setSnowCurrentQty('0');
      setSnowPayoutInput(getMostRecentPayout(uppercased).toString());
    } else {
      setSnowSelectedTicker('custom');
    }
  };


  // --- MATHEMATICAL EVALUATIONS: CALC 1 ---
  const avgCalcResult = useMemo(() => {
    return calculateFutureAveragePrice(
      parseFloat(avgCurrentQty) || 0,
      parseFloat(avgCurrentPrice) || 0,
      parseFloat(avgPurchaseQty) || 0,
      parseFloat(avgPurchasePrice) || 0
    );
  }, [avgCurrentQty, avgCurrentPrice, avgPurchaseQty, avgPurchasePrice]);

  // --- MATHEMATICAL EVALUATIONS: CALC 2 ---
  const transferCalcResult = useMemo(() => {
    return calculateStockTransfer(
      parseFloat(transOriginQty) || 0,
      parseFloat(transOriginPrice) || 0,
      parseFloat(transOriginPayout) || 0,
      parseFloat(transDestPrice) || 0,
      parseFloat(transDestPayout) || 0
    );
  }, [transOriginQty, transOriginPrice, transOriginPayout, transDestPrice, transDestPayout]);

  // --- MATHEMATICAL EVALUATIONS: CALC 3 ---
  const snowballCalcResult = useMemo(() => {
    return calculateSnowball(
      parseFloat(snowPriceInput) || 0,
      parseFloat(snowPayoutInput) || 0,
      parseFloat(snowCurrentQty) || 0
    );
  }, [snowPriceInput, snowPayoutInput, snowCurrentQty]);

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
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
          <motion.div
            key="avg-price-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Input Section (7 Columns) */}
            <div className="lg:col-span-5 bg-white border border-brand-line rounded-lg p-6 space-y-6">
              <SRVFieldset title="Ativo & Posição Atual">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">
                      Selecionar Ativo da Carteira
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-bold outline-none focus:border-brand-accent transition-colors"
                      value={avgSelectedTicker}
                      onChange={(e) => setAvgSelectedTicker(e.target.value)}
                    >
                      <option value="custom">-- Digitar manualmente --</option>
                      {positions.map((pos) => {
                        const assetDetails = assets.find(a => a.ticker === pos.ticker);
                        return (
                          <option key={pos.ticker} value={pos.ticker}>
                            {pos.ticker} {assetDetails ? `- ${assetDetails.description}` : ''} ({pos.qty} un)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {avgSelectedTicker === 'custom' && (
                    <SRVInput
                      label="Ticker / Símbolo"
                      placeholder="Ex: PETR4"
                      className="uppercase"
                      value={avgTickerInput}
                      onChange={(e) => setAvgTickerInput(e.target.value.toUpperCase())}
                    />
                  )}

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
        )}

        {activeTab === 'transfer' && (
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">
                        Selecionar da Carteira
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-xs font-bold outline-none focus:border-red-400 transition-colors"
                        value={transSelectedOrigin}
                        onChange={(e) => setTransSelectedOrigin(e.target.value)}
                      >
                        <option value="">-- Escolher posição ativa --</option>
                        {positions.map((pos) => {
                          const details = assets.find(a => a.ticker === pos.ticker);
                          return (
                            <option key={pos.ticker} value={pos.ticker}>
                              {pos.ticker} ({pos.qty} un)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <SRVInput
                        label="Ativo/Ticker"
                        classNameLabel="text-[10px] uppercase tracking-tighter"
                        className="uppercase"
                        placeholder="Ex: PETR4"
                        value={transOriginTicker}
                        onChange={(e) => handleOriginTickerInput(e.target.value)}
                      />
                    </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">
                        Selecionar Ativo
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-xs font-bold outline-none focus:border-green-400 transition-colors"
                        value={transSelectedDest}
                        onChange={(e) => setTransSelectedDest(e.target.value)}
                      >
                        <option value="">-- Escolher ativo cadastrado --</option>
                        {assets.map((asset) => (
                          <option key={asset.ticker} value={asset.ticker}>
                            {asset.ticker} - {asset.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <SRVInput
                        label="Ativo/Ticker"
                        classNameLabel="text-[10px] uppercase tracking-tighter"
                        className="uppercase"
                        placeholder="Ex: VALE3"
                        value={transDestTicker}
                        onChange={(e) => handleDestTickerInput(e.target.value)}
                      />
                    </div>
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
        )}

        {activeTab === 'snowball' && (
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
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">
                      Selecionar Ativo da Carteira
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-bold outline-none focus:border-brand-accent transition-colors"
                      value={snowSelectedTicker}
                      onChange={(e) => setSnowSelectedTicker(e.target.value)}
                    >
                      <option value="custom">-- Digitar manualmente --</option>
                      {positions.map((pos) => {
                        const assetDetails = assets.find(a => a.ticker === pos.ticker);
                        return (
                          <option key={pos.ticker} value={pos.ticker}>
                            {pos.ticker} {assetDetails ? `- ${assetDetails.description}` : ''} ({pos.qty} un)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {snowSelectedTicker === 'custom' && (
                    <SRVInput
                      label="Ticker / Símbolo"
                      placeholder="Ex: MXRF11"
                      className="uppercase"
                      value={snowTickerInput}
                      onChange={(e) => handleSnowTickerInput(e.target.value)}
                    />
                  )}

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
        )}
      </AnimatePresence>
    </div>
  );
}
