import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, FileText, RefreshCw, Calculator } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SRVFieldset } from '@components/SRVFieldset';
import { SRVInput } from '@components/SRVInput';
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

  const [copied, setCopied] = useState(false);

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

  const markdownReport = useMemo(() => {
    if (!avgTickerInput) {
      return `### 📊 Aguardando dados...
Selecione ou insira o **Ativo** acima para carregar sua posição atual e simular as novas aquisições de cotas.`;
    }

    const {
      currentTotal,
      purchaseTotal,
      totalQty,
      totalCost,
      newAvgPrice,
      priceDiff,
      priceDiffPercent,
    } = avgCalcResult;

    const oQty = parseFloat(avgCurrentQty) || 0;
    const oPrice = parseFloat(avgCurrentPrice) || 0;
    const aQty = parseFloat(avgPurchaseQty) || 0;
    const aPrice = parseFloat(avgPurchasePrice) || 0;

    const priceDirection = priceDiff < 0 
      ? '🟢 REDUÇÃO' 
      : priceDiff > 0 
        ? '🟡 ELEVAÇÃO' 
        : '⚪ INDIFERENTE';

    const pnlExplanation = priceDiff < 0
      ? `> 📉 **Estratégia de Redução de Preço Médio (Média para Baixo):** O novo lote a **R$ ${aPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** é inferior ao seu preço médio atual de **R$ ${oPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**. Isso reduzirá o seu custo ponderado por cota em **R$ ${Math.abs(priceDiff).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}** (-${Math.abs(priceDiffPercent).toFixed(2)}%), tornando o ponto de equilíbrio (*break-even*) da sua posição mais baixo e acessível.`
      : priceDiff > 0
        ? `> 📈 **Estratégia de Acumulação Premium (Média para Cima):** O custo adicional unitário de **R$ ${aPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** é superior ao seu custo histórico original de **R$ ${oPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**. Isso elevará seu preço médio unitário em **R$ ${priceDiff.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}** (+${priceDiffPercent.toFixed(2)}%). Esta abordagem normalmente é adotada ao reforçar posições vencedoras em tendências fortes de alta patrimonial.`
        : `> ⚪ **Preço Médio Inalterado:** O preço unitário do aporte sugerido coincide com o preço médio atual, preservando a média histórica.`;

    return `## 📊 Relatório de Simulação de Preço Médio: ${avgTickerInput}

---

### Resumo do Consolidado

**Impacto da Operação:** **${priceDirection} DO PREÇO MÉDIO**

A compra de **${aQty.toLocaleString('pt-BR')}** cotas/ações adicionais de **${avgTickerInput}** representará um aporte de capital no valor de **R$ ${purchaseTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**. Isso causará uma flutuação relativa de **${priceDiff >= 0 ? '+' : ''}${priceDiffPercent.toFixed(2)}%** no preço médio unitário ponderado.

---

### 💵 Matriz de Comparações

| Dimensão | Posição Original | Novo Aporte Simulado | Nova Posição Estimada |
| :--- | :---: | :---: | :---: |
| **Quantidade de Cotas** | ${oQty.toLocaleString('pt-BR')} un | ${aQty.toLocaleString('pt-BR')} un | **${totalQty.toLocaleString('pt-BR')} un** |
| **Preço Médio / Unitário** | R$ ${oPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} | R$ ${aPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} | **R$ ${newAvgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}** |
| **Custos Totais Acumulados** | R$ ${currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | R$ ${purchaseTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | **R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** |

---

### 🧐 Análise de Alocação de Capital

${pnlExplanation}

A nova composição patrimonial deste ativo passará a representar um total geral consolidado de **R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** de capital histórico injetado em carteira sob a tutela de **${totalQty.toLocaleString('pt-BR')}** unidades.

---

### 🔧 Roteiro Operacional

1. **Aporte:** Efetuar a ordem eletrônica de compra de **${aQty.toLocaleString('pt-BR')}** unidades do ativo **${avgTickerInput}** na sua corretora de preferência.
2. **Custo Estimado:** Certifique-se de possuir em saldo na corretora o montante líquido de **R$ ${purchaseTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** para acatar a liquidação física da ordem.
3. **Escrituração Fiduciária:** Após a confirmação dos termos de liquidação da operação (habitualmente em D+2), atualize sua ficha cadastral fiduciária retificando a quantidade acumulada para **${totalQty.toLocaleString('pt-BR')}** unidades e o custo médio para **R$ ${newAvgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}**.
`;
  }, [avgTickerInput, avgCurrentQty, avgCurrentPrice, avgPurchaseQty, avgPurchasePrice, avgCalcResult]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setAvgTickerInput('');
    setAvgCurrentQty('0');
    setAvgCurrentPrice('0');
    setAvgPurchaseQty('0');
    setAvgPurchasePrice('0');
  };

  return (
    <motion.div
      key="avg-price-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* SECTION 1: Inputs side form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="capture-form-avg">
        {/* Current Position Form Block */}
        <div className="bg-white border border-brand-line rounded-lg p-5 shadow-sm">
          <SRVFieldset
            title="Ativo & Posição Atual"
            titleClassName="text-xs font-bold text-slate-600 uppercase tracking-tight mb-2 flex items-center gap-1.5"
            bulletClassName="bg-slate-400"
          >
            <div className="mb-4">
              <SRVAutoComplete
                label="Ativo / Código (Ticker)"
                placeholder="Ex: PETR4, MXRF11..."
                options={tickerOptions}
                value={avgTickerInput}
                onChange={handleAvgTickerChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <SRVInput
                  label="Quantidade Atual"
                  classNameLabel="text-[10px] uppercase font-bold text-slate-500 tracking-tight"
                  type="number"
                  min="0"
                  step="any"
                  value={avgCurrentQty}
                  onChange={(e) => setAvgCurrentQty(e.target.value)}
                />
              </div>
              <div>
                <SRVInput
                  label="Preço Médio Atual (R$)"
                  classNameLabel="text-[10px] uppercase font-bold text-slate-500 tracking-tight"
                  type="number"
                  min="0"
                  step="any"
                  value={avgCurrentPrice}
                  onChange={(e) => setAvgCurrentPrice(e.target.value)}
                />
              </div>
            </div>
          </SRVFieldset>
        </div>

        {/* Purchase simulation Block */}
        <div className="bg-white border border-brand-line rounded-lg p-5 shadow-sm">
          <SRVFieldset
            title="Simulação de Novo Aporte"
            titleClassName="text-xs font-bold text-brand-accent uppercase tracking-tight mb-2 flex items-center gap-1.5"
            bulletClassName="bg-brand-accent"
          >
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <SRVInput
                  label="Quantidade a Comprar"
                  classNameLabel="text-[10px] uppercase font-bold text-brand-accent tracking-tight"
                  type="number"
                  min="0"
                  step="any"
                  value={avgPurchaseQty}
                  onChange={(e) => setAvgPurchaseQty(e.target.value)}
                />
              </div>
              <div>
                <SRVInput
                  label="Preço Unitário Compra (R$)"
                  classNameLabel="text-[10px] uppercase font-bold text-brand-accent tracking-tight"
                  type="number"
                  min="0"
                  step="any"
                  value={avgPurchasePrice}
                  onChange={(e) => setAvgPurchasePrice(e.target.value)}
                />
              </div>
            </div>
          </SRVFieldset>
        </div>
      </div>

      {/* SECTION 2: Dynamic Live Report in Markdown Format */}
      <div className="bg-white border border-brand-line rounded-lg shadow-sm overflow-hidden" id="report-md-box-avg">
        {/* Header Action Bar */}
        <header className="px-6 py-4 border-b border-brand-line bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-600">Relatório de Preço Médio</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-md text-[11px] font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5 focus:outline-none"
              title="Limpar todos os campos"
            >
              <RefreshCw size={12} />
              Limpar
            </button>
            <button
              onClick={handleCopy}
              disabled={!avgTickerInput}
              className={cn(
                "px-3 py-1.5 text-[11px] font-bold rounded-md transition-all flex items-center gap-1.5 focus:outline-none",
                !avgTickerInput
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  : copied
                    ? "bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700"
                    : "bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700"
              )}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copiado!' : 'Copiar Relatório'}
            </button>
          </div>
        </header>

        {/* Markdown Render Body */}
        <div className="p-8 select-text prose prose-indigo prose-sm sm:prose-base max-w-none text-slate-700 overflow-x-auto">
          <Markdown remarkPlugins={[remarkGfm]}>
            {markdownReport}
          </Markdown>
        </div>
      </div>
    </motion.div>
  );
}
