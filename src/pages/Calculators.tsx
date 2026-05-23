import React, { useState, useMemo, useEffect } from 'react';
import { useDatabase } from '@context/DatabaseContext';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ArrowRightLeft, TrendingUp, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function Calculators() {
  const { positions, assets, transactions } = useDatabase();
  const [activeTab, setActiveTab] = useState<'avg-price' | 'transfer'>('avg-price');

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
  const [transOriginQty, setTransOriginQty] = useState<string>('0');
  const [transOriginPrice, setTransOriginPrice] = useState<string>('0');
  const [transOriginPayout, setTransOriginPayout] = useState<string>('0');

  const [transSelectedDest, setTransSelectedDest] = useState<string>('');
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
      const pos = positions.find(p => p.ticker === transSelectedOrigin);
      if (pos) {
        setTransOriginQty(pos.qty.toString());
        setTransOriginPrice(pos.avgPrice.toFixed(2));
        const estimatedPayout = getMostRecentPayout(pos.ticker);
        setTransOriginPayout(estimatedPayout.toString());
      }
    } else {
      setTransOriginQty('0');
      setTransOriginPrice('0');
      setTransOriginPayout('0');
    }
  }, [transSelectedOrigin, positions]);

  // Sync Calc 2 Destination stock
  useEffect(() => {
    if (transSelectedDest) {
      const pos = positions.find(p => p.ticker === transSelectedDest);
      const estPayout = getMostRecentPayout(transSelectedDest);
      setTransDestPayout(estPayout.toString());
      if (pos) {
        setTransDestPrice(pos.avgPrice.toFixed(2));
      } else {
        setTransDestPrice('0');
      }
    } else {
      setTransDestPrice('0');
      setTransDestPayout('0');
    }
  }, [transSelectedDest, positions]);

  // --- MATHEMATICAL EVALUATIONS: CALC 1 ---
  const avgCalcResult = useMemo(() => {
    const origQty = parseFloat(avgCurrentQty) || 0;
    const origPrice = parseFloat(avgCurrentPrice) || 0;
    const newQty = parseFloat(avgPurchaseQty) || 0;
    const newPrice = parseFloat(avgPurchasePrice) || 0;

    const currentTotal = origQty * origPrice;
    const purchaseTotal = newQty * newPrice;

    const totalQty = origQty + newQty;
    const totalCost = currentTotal + purchaseTotal;

    const newAvgPrice = totalQty > 0 ? totalCost / totalQty : 0;
    const priceDiff = newAvgPrice - origPrice;
    const priceDiffPercent = origPrice > 0 ? (priceDiff / origPrice) * 100 : 0;

    return {
      currentTotal,
      purchaseTotal,
      totalQty,
      totalCost,
      newAvgPrice,
      priceDiff,
      priceDiffPercent,
    };
  }, [avgCurrentQty, avgCurrentPrice, avgPurchaseQty, avgPurchasePrice]);

  // --- MATHEMATICAL EVALUATIONS: CALC 2 ---
  const transferCalcResult = useMemo(() => {
    const qA = parseFloat(transOriginQty) || 0;
    const pA = parseFloat(transOriginPrice) || 0;
    const divA = parseFloat(transOriginPayout) || 0;

    const pB = parseFloat(transDestPrice) || 0;
    const divB = parseFloat(transDestPayout) || 0;

    const incomeA = qA * divA;
    const salesCapital = qA * pA;

    const qB = pB > 0 ? Math.ceil(salesCapital / pB) : 0;
    const leftoverCapital = salesCapital - (qB * pB);
    const incomeB = qB * divB;

    const yieldA = pA > 0 ? (divA / pA) * 100 : 0;
    const yieldB = pB > 0 ? (divB / pB) * 100 : 0;

    const incomeDiff = incomeB - incomeA;
    const incomeDiffPercent = incomeA > 0 ? (incomeDiff / incomeA) * 100 : 0;

    const isWorth = incomeDiff > 0;

    return {
      incomeA,
      salesCapital,
      qB,
      leftoverCapital,
      incomeB,
      yieldA,
      yieldB,
      incomeDiff,
      incomeDiffPercent,
      isWorth,
    };
  }, [transOriginQty, transOriginPrice, transOriginPayout, transDestPrice, transDestPayout]);

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
              Simule adições em sua carteira ou estude se a realocação de capital entre dois ativos é financeiramente estratégica para dividendos.
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
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'avg-price' ? (
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
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-brand-accent rounded-full inline-block" />
                  Ativo & Posição Atual
                </h2>
                
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
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">
                        Ticker / Símbolo
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: PETR4"
                        className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono uppercase outline-none focus:border-brand-accent transition-colors"
                        value={avgTickerInput}
                        onChange={(e) => setAvgTickerInput(e.target.value.toUpperCase())}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">
                        Quantidade Atual
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none focus:border-brand-accent transition-colors"
                        value={avgCurrentQty}
                        onChange={(e) => setAvgCurrentQty(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">
                        Preço Médio Atual (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0,00"
                        className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none focus:border-brand-accent transition-colors"
                        value={avgCurrentPrice}
                        onChange={(e) => setAvgCurrentPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-line">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-brand-accent rounded-full inline-block" />
                  Simulação de Compra
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">
                      Quantidade à Comprar
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Ex: 50"
                      className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none focus:border-brand-accent transition-colors"
                      value={avgPurchaseQty}
                      onChange={(e) => setAvgPurchaseQty(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">
                      Preço Unitário de Compra (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Ex: 25,10"
                      className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none focus:border-brand-accent transition-colors"
                      value={avgPurchasePrice}
                      onChange={(e) => setAvgPurchasePrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
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
                {/* original */}
                <div className="bg-white border border-brand-line p-5 rounded-lg flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Posição Original</span>
                    <div className="mt-3 flex flex-col gap-2">
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
                  </div>
                </div>

                {/* Simulated Purchase / Aporte */}
                <div className="bg-white border border-brand-line p-5 rounded-lg flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-brand-accent font-bold uppercase tracking-wider block">Valor do Novo Aporte</span>
                    <div className="mt-3 flex flex-col gap-2">
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
                  </div>
                </div>
              </div>

              {/* End simulation output card */}
              <div className="bg-white border border-brand-line rounded-lg p-6 shadow-sm">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-3">Futura Posição Consolidada</span>
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
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="transfer-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Form Origin/Dest (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Origin configuration */}
              <div className="bg-white border border-brand-line rounded-lg p-6 space-y-4">
                <h2 className="text-xs font-bold text-red-500 uppercase tracking-tight mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-red-400 rounded-full inline-block" />
                  Ativo de Origem (Venda)
                </h2>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">
                    Selecionar Origem (De)
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-bold outline-none focus:border-red-400 transition-colors"
                    value={transSelectedOrigin}
                    onChange={(e) => setTransSelectedOrigin(e.target.value)}
                  >
                    <option value="">-- Escolher posição ativa --</option>
                    {positions.map((pos) => {
                      const details = assets.find(a => a.ticker === pos.ticker);
                      return (
                        <option key={pos.ticker} value={pos.ticker}>
                          {pos.ticker} {details ? `- ${details.description}` : ''} ({pos.qty} un)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 leading-tighter uppercase tracking-tight">
                      Qtde
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none focus:border-brand-accent"
                      value={transOriginQty}
                      onChange={(e) => setTransOriginQty(e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 leading-tighter uppercase tracking-tight">
                      Preço Venda (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none focus:border-brand-accent animate-pulse"
                      value={transOriginPrice}
                      onChange={(e) => setTransOriginPrice(e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 leading-tighter uppercase tracking-tight">
                      Últ. Dividendo (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none focus:border-brand-accent"
                      value={transOriginPayout}
                      onChange={(e) => setTransOriginPayout(e.target.value)}
                      title="Provento pago por cota/ação mais recente detectado."
                    />
                  </div>
                </div>
              </div>

              {/* Destination configuration */}
              <div className="bg-white border border-brand-line rounded-lg p-6 space-y-4">
                <h2 className="text-xs font-bold text-green-600 uppercase tracking-tight mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-green-500 rounded-full inline-block" />
                  Ativo de Destino (Compra)
                </h2>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">
                    Selecionar Destino (Para)
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-bold outline-none focus:border-green-400 transition-colors"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-tight">
                      Preço Estimado Compra (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none focus:border-brand-accent placeholder-slate-300"
                      value={transDestPrice}
                      onChange={(e) => setTransDestPrice(e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-tight">
                      Últ. Dividendo (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none focus:border-brand-accent placeholder-slate-300"
                      value={transDestPayout}
                      onChange={(e) => setTransDestPayout(e.target.value)}
                      placeholder="0,00"
                      title="Provento pago por cota/ação mais recente do destino detectado."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment results (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Verdict Announcement component */}
              <div className={cn(
                "rounded-lg p-6 border transition-all shadow-sm flex flex-col gap-4 justify-between relative overflow-hidden",
                !transSelectedOrigin || !transSelectedDest
                  ? "bg-slate-50 border-slate-200 text-slate-600"
                  : transferCalcResult.isWorth
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-amber-50 border-amber-200 text-amber-950"
              )}>
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase block text-slate-400">
                    Veredito da Análise de Troca
                  </span>

                  {!transSelectedOrigin || !transSelectedDest ? (
                    <div className="mt-4 flex flex-col gap-1">
                      <h3 className="text-lg font-bold text-slate-800">Selecione ambos os ativos</h3>
                      <p className="text-xs text-slate-500">Diga qual ativo deseja vender nos campos à esquerda e para qual ativo irá transferir os rendimentos para avaliar a troca.</p>
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
                        Substituir esses ativos irá diminuir seus rendimentos de proventos periódicos. Você estaria reduzindo sua renda futura em cerca de <strong className="font-extrabold text-amber-950 text-base font-mono">R$ {Math.abs(transferCalcResult.incomeDiff).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> (redução de <strong className="font-bold text-amber-950 font-mono">-{Math.abs(transferCalcResult.incomeDiffPercent).toFixed(2)}%</strong>). Sugere-se continuar alocado em {transSelectedOrigin}.
                      </p>
                    </div>
                  )}
                </div>

                {transSelectedOrigin && transSelectedDest && (
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

              {/* Grid comparing incomes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Income Origin card */}
                <div className="bg-white border border-brand-line rounded-lg p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Provento com {transSelectedOrigin || 'Ativo A'}</span>
                    <p className="text-[10px] text-slate-400 italic">Situação Original</p>
                    <div className="mt-3">
                      <p className="text-3xl font-extrabold text-slate-800 font-mono tracking-tighter">
                        R$ {transferCalcResult.incomeA.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] mt-1 text-slate-400 font-mono">
                        Base: {parseFloat(transOriginQty).toLocaleString('pt-BR')} un × R$ {parseFloat(transOriginPayout).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expected Destiny Card */}
                <div className="bg-white border border-brand-line rounded-lg p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-brand-sidebar font-bold uppercase tracking-widest block">Provento Estimado em {transSelectedDest || 'Ativo B'}</span>
                    <p className="text-[10px] text-brand-accent font-bold uppercase italic">Nova Situação</p>
                    <div className="mt-3">
                      <p className="text-3xl font-extrabold text-brand-accent font-mono tracking-tighter">
                        R$ {transferCalcResult.incomeB.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] mt-1 text-slate-400 font-mono">
                        Base: {transferCalcResult.qB.toLocaleString('pt-BR')} un × R$ {parseFloat(transDestPayout).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer Details / Breakdown */}
              {transSelectedOrigin && transSelectedDest && (
                <div className="bg-white border border-brand-line rounded-lg p-6 shadow-sm space-y-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block pb-1 border-b border-brand-line">Simulação da Execução</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Recurso de Venda Gerado:</span>
                      <span className="font-mono font-bold text-slate-800">R$ {transferCalcResult.salesCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between varitems-center text-xs">
                      <span className="text-slate-500">Novas Cotas/Ações Compradas:</span>
                      <span className="font-mono font-bold text-slate-800">{transferCalcResult.qB.toLocaleString('pt-BR')} un de {transSelectedDest}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Preço Compra de {transSelectedDest}:</span>
                      <span className="font-mono font-bold text-slate-800">R$ {parseFloat(transDestPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Troco ou Margem Residual (R$):</span>
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        R$ {transferCalcResult.leftoverCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
