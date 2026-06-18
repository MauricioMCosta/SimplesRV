import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, FileText, TrendingUp, ArrowDownRight, RefreshCw } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SRVFieldset } from '@components/SRVFieldset';
import { SRVInput } from '@components/SRVInput';
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
  const [transOriginAvgPrice, setTransOriginAvgPrice] = useState<string>('0');
  const [transOriginPayout, setTransOriginPayout] = useState<string>('0');

  const [transDestTicker, setTransDestTicker] = useState<string>('');
  const [transDestPrice, setTransDestPrice] = useState<string>('0');
  const [transDestPayout, setTransDestPayout] = useState<string>('0');

  const [copied, setCopied] = useState(false);

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
      setTransOriginAvgPrice(pos.avgPrice.toFixed(2));
      setTransOriginPayout(getMostRecentPayout(uppercased).toString());
    } else if (uppercased === '') {
      setTransOriginQty('0');
      setTransOriginPrice('0');
      setTransOriginAvgPrice('0');
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
      parseFloat(transDestPayout) || 0,
      parseFloat(transOriginAvgPrice) || 0
    );
  }, [transOriginQty, transOriginPrice, transOriginPayout, transDestPrice, transDestPayout, transOriginAvgPrice]);

  const markdownReport = useMemo(() => {
    if (!transOriginTicker || !transDestTicker) {
      return `### 📊 Aguardando dados...
Preencha as informações do **Ativo de Origem** e do **Ativo de Destino** acima para gerar o relatório de simulação de transferência.`;
    }

    const oQty = parseFloat(transOriginQty) || 0;
    const oPrice = parseFloat(transOriginPrice) || 0;
    const oAvg = parseFloat(transOriginAvgPrice) || 0;
    const oPayout = parseFloat(transOriginPayout) || 0;
    const dPrice = parseFloat(transDestPrice) || 0;
    const dPayout = parseFloat(transDestPayout) || 0;

    const {
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
      costBasis,
      profitLoss,
      pnlPercent,
    } = transferCalcResult;

    const isLoss = oAvg > oPrice;
    const isGain = oPrice > oAvg && oAvg > 0;

    const verdictLabel = isWorth 
      ? '🟢 RECOMENDADA (Vantajosa sob a ótica de proventos periódicos)' 
      : '🔴 NÃO RECOMENDADA (Desvantajosa sob a ótica de proventos periódicos)';

    let pnlDetailsBlock = '';
    if (oAvg > 0) {
      const pnlColor = isLoss ? '🔴 Prejuízo' : '🟢 Lucro';
      const recoveryText = (isLoss && incomeDiff > 0) 
        ? `\n- **Tempo para Recuperação (Payback):** Serão necessários aproximadamente **${Math.ceil(Math.abs(profitLoss) / incomeDiff)} períodos/meses** de proventos incrementais de **${transDestTicker}** para amortizar e recuperar integralmente este prejuízo realizado.` 
        : '';

      pnlDetailsBlock = `
### 💼 Análise Patrimonial e Preço Médio

O ativo de origem **${transOriginTicker}** possui uma posição histórica de custo médio:

- **Preço Médio de Aquisição:** R$ ${oAvg.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- **Custo Total de Aquisição:** R$ ${costBasis.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- **Valor Bruto Estimado de Venda:** R$ ${salesCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- **Resultado da Venda (P&L):** **${pnlColor} de R$ ${profitLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${pnlPercent.toFixed(2)}%)**
${isLoss ? `
> ⚠️ **Alerta Fiscal e Patrimonial (Prejuízo Realizado):** Ao vender abaixo do preço médio, você estará **realizando uma perda definitiva de capital** de R$ ${Math.abs(profitLoss).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} no seu patrimônio ativo.
> 
> No entanto, sob a ótica da Receita Federal do Brasil, esse prejuízo realizado poderá ser catalogado em seus controles fiscais para **compensação tributária futura** com ganhos auferidos sob a mesma modalidade de ativo (ações com ações, FIIs com FIIs).${recoveryText}` 
: isGain ? `
> 🎉 **Ganho Patrimonial:** Esta venda geraria um lucro patrimonial real de **R$ ${profitLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (+${pnlPercent.toFixed(2)}% sobre o custo original de aquisição). Considere a tributação sobre Ganho de Capital aplicável.` 
: ''}`;
    }

    return `## 📊 Relatório de Simulação de Realocação: ${transOriginTicker} ➔ ${transDestTicker}

---

### Resumo Executivo

**Veredito:** **${verdictLabel}**

A operação de transferência de toda a posição atual provocará uma variação projetada de **${incomeDiff >= 0 ? '+' : ''}R$ ${incomeDiff.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** no seu provento recorrente por período, o que representa um impacto de **${incomeDiff >= 0 ? '+' : ''}${incomeDiffPercent.toFixed(2)}%** na fluxo de renda passiva periódico induzido por esta parcela de capital.

---

### 💰 Tabela Comparativa de Fluxo

| Indicador | Situação Atual (${transOriginTicker}) | Nova Situação (${transDestTicker}) | Variação Estimada |
| :--- | :---: | :---: | :---: |
| **Quantidade** | ${oQty.toLocaleString('pt-BR')} un | ${qB.toLocaleString('pt-BR')} un | - |
| **Preço Unitário (Venda / Compra)** | R$ ${oPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | R$ ${dPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | - |
| **Último Provento Unitário** | R$ ${oPayout.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} | R$ ${dPayout.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} | - |
| **Dividend Yield Periódico** | ${yieldA.toFixed(2)}% | ${yieldB.toFixed(2)}% | ${((yieldB - yieldA) >= 0 ? '+' : '')}${(yieldB - yieldA).toFixed(2)}% |
| **Renda Passiva Periódica** | **R$ ${incomeA.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** | **R$ ${incomeB.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** | **R$ ${incomeDiff.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${incomeDiff >= 0 ? '+' : ''}${incomeDiffPercent.toFixed(2)}%)** |

---
${pnlDetailsBlock}

### 🔧 Roteiro Operacional de Execução

1. **Liquidação (Origem):** Realizar a venda de **${oQty.toLocaleString('pt-BR')}** unidades de **${transOriginTicker}** a **R$ ${oPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**, auferindo um capital líquido de **R$ ${salesCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**.
2. **Reinvestimento (Destino):** Comprar **${qB.toLocaleString('pt-BR')}** cotas/ações de **${transDestTicker}** a **R$ ${dPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**, totalizando um desembolso de **R$ ${(qB * dPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**.
3. **Sobra de Caixa (Troco):** Sobrará uma margem residual de **R$ ${leftoverCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** retida em conta líquida da corretora.

---

### 📝 Observações e Isenção de Responsabilidade
* Os cálculos de renda futura projetada baseiam-se estritamente na distribuição pretérita reportada e não constituem promessas absolutas de renda.
* Fatores adicionais como vacância física/financeira, flutuação cambial ou cortes inesperados de proventos não são contabilizados no modelo matemático elementar da ferramenta.
`;
  }, [
    transOriginTicker,
    transDestTicker,
    transOriginQty,
    transOriginPrice,
    transOriginAvgPrice,
    transOriginPayout,
    transDestPrice,
    transDestPayout,
    transferCalcResult,
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setTransOriginTicker('');
    setTransOriginQty('0');
    setTransOriginPrice('0');
    setTransOriginAvgPrice('0');
    setTransOriginPayout('0');
    setTransDestTicker('');
    setTransDestPrice('0');
    setTransDestPayout('0');
  };

  return (
    <motion.div
      key="transfer-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* SECTION 1: Capture components form configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="capture-form">
        
        {/* Origin configuration (Venda) */}
        <div className="bg-white border border-brand-line rounded-lg p-5 shadow-sm">
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <SRVInput
                  label="Quantidade (Qtde)"
                  classNameLabel="text-[10px] uppercase font-bold text-slate-500 tracking-tight"
                  type="number"
                  min="0"
                  value={transOriginQty}
                  onChange={(e) => setTransOriginQty(e.target.value)}
                />
              </div>
              <div>
                <SRVInput
                  label="Preço Médio (R$)"
                  classNameLabel="text-[10px] uppercase font-bold text-indigo-600 tracking-tight"
                  type="number"
                  min="0"
                  step="any"
                  value={transOriginAvgPrice}
                  onChange={(e) => setTransOriginAvgPrice(e.target.value)}
                  title="Seu preço médio histórico deste ativo."
                />
              </div>
              <div>
                <SRVInput
                  label="Preço Venda (R$)"
                  classNameLabel="text-[10px] uppercase font-bold text-red-500 tracking-tight"
                  type="number"
                  min="0"
                  step="any"
                  value={transOriginPrice}
                  onChange={(e) => setTransOriginPrice(e.target.value)}
                  title="Preço proposto para a venda desse ativo."
                />
              </div>
              <div>
                <SRVInput
                  label="Últ. Dividendo (R$)"
                  classNameLabel="text-[10px] uppercase font-bold text-slate-500 tracking-tight"
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

        {/* Destination configuration (Compra) */}
        <div className="bg-white border border-brand-line rounded-lg p-5 shadow-sm">
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <SRVInput
                  label="Preço Estimado Compra (R$)"
                  classNameLabel="text-[10px] uppercase font-bold text-green-600 tracking-tight"
                  type="number"
                  min="0"
                  step="any"
                  className="placeholder-slate-300"
                  value={transDestPrice}
                  onChange={(e) => setTransDestPrice(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div>
                <SRVInput
                  label="Últ. Dividendo (R$)"
                  classNameLabel="text-[10px] uppercase font-bold text-slate-500 tracking-tight"
                  type="number"
                  min="0"
                  step="any"
                  className="placeholder-slate-300"
                  value={transDestPayout}
                  onChange={(e) => setTransDestPayout(e.target.value)}
                  placeholder="0,00"
                  title="Provento pago por cota/ação mais recente do destino de investimento detectado."
                />
              </div>
            </div>
          </SRVFieldset>
        </div>
      </div>

      {/* SECTION 2: Dynamic Live Report in Markdown Format */}
      <div className="bg-white border border-brand-line rounded-lg shadow-sm overflow-hidden" id="report-md-box">
        {/* Header Action Bar */}
        <header className="px-6 py-4 border-b border-brand-line bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-600">Relatório Consolidado de Análise</span>
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
              disabled={!transOriginTicker || !transDestTicker}
              className={cn(
                "px-3 py-1.5 text-[11px] font-bold rounded-md transition-all flex items-center gap-1.5 focus:outline-none",
                !transOriginTicker || !transDestTicker
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
