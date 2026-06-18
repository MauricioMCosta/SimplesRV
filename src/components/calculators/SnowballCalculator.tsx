import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, FileText, RefreshCw, Snowflake } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SRVFieldset } from '@components/SRVFieldset';
import { SRVInput } from '@components/SRVInput';
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

  const [copied, setCopied] = useState(false);

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

  const markdownReport = useMemo(() => {
    if (!snowTickerInput) {
      return `### 📊 Aguardando dados...
Insira o **Código do Ativo (Ticker)** acima para carregar o preço, rendimento unitário e simular o efeito **Bola de Neve** financeiro.`;
    }

    const {
      magicNumber,
      totalCost,
      monthlyPayout,
      yieldPercent,
      sharesNeeded,
      currentIncome,
      totalSharesAfter,
      newIncome,
    } = snowballCalcResult;

    const price = parseFloat(snowPriceInput) || 0;
    const payout = parseFloat(snowPayoutInput) || 0;
    const currentQty = parseFloat(snowCurrentQty) || 0;

    const progressPercent = magicNumber > 0 ? Math.min((currentQty / magicNumber) * 100, 100) : 0;
    const nextMilestoneCost = sharesNeeded * price;

    const progressDescription = sharesNeeded === 0
      ? `🎉 **Meta Máxima Atingida (Efeito Bola de Neve Ativo):** Seus proventos acumulados originados por sua posição atual de **${currentQty.toLocaleString('pt-BR')} cotas** somam **R$ ${currentIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**. Este ganho supera o preço unitário de mercado do ativo (**R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**), possibilitando que seus dividendos adquiram **pelo menos 1 nova cota extra mensalmente** de maneira autosustentável, retroalimentando o processo infinito de juros compostos.`
      : `🔄 **Fase de Acumulação Ativa:** Atualmente, sua carteira cumula **${currentQty.toLocaleString('pt-BR')} cotas** (gerando provento recorrente de **R$ ${currentIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**). Você completou **${progressPercent.toFixed(1)}%** do caminho rumo ao número mágico. Restam ainda **${sharesNeeded.toLocaleString('pt-BR')} cotas** para dar início à compra orgânica automática sem acréscimo de capital adicional.`;

    return `## ❄️ Relatório de Simulação: Estratégia Bola de Neve para ${snowTickerInput}

---

### Resumo Técnico Instrumental

* **Número Mágico de Cotas:** **${magicNumber.toLocaleString('pt-BR')} un**
* **Custo da Meta (Aporte Total Estimado):** R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
* **Progresso do Objetivo:** **${progressPercent.toFixed(1)}% concluído**

---

### 💰 Matriz de Planejamento de Proventos

| Métrica Patrimonial | Sua Situação Atual | Meta (Número Mágico) | Futura Posição Estimada |
| :--- | :---: | :---: | :---: |
| **Quantidade de Cotas** | ${currentQty.toLocaleString('pt-BR')} un | ${magicNumber.toLocaleString('pt-BR')} un | **${totalSharesAfter.toLocaleString('pt-BR')} un** |
| **Custo de Mercado do Ativo** | R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | **R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** |
| **Último Provento Distribuído** | R$ ${payout.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} | R$ ${payout.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} | **R$ ${payout.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}** |
| **Dividend Yield Periódico** | ${yieldPercent.toFixed(2)}% | ${yieldPercent.toFixed(2)}% | **${yieldPercent.toFixed(2)}%** |
| **Renda Passiva Periódica** | **R$ ${currentIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** | **R$ ${monthlyPayout.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** | **R$ ${newIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** |

---

### 🧐 Diagnóstico e Dinâmica Patrimonial

${progressDescription}

${sharesNeeded > 0 ? `
> 🎯 **Plano de Ação:** Para romper a barreira técnica da bola de neve, é requerido um aporte adicional de **R$ ${nextMilestoneCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** para subscrever as **${sharesNeeded.toLocaleString('pt-BR')}** cotas complementares faltantes.` : ''}

---

### 🔧 Direcionamento Operacional

1. **Número Mágico (Magic Number):** É o ponto de inflexão matemática onde a renda gerada pelo ativo é igual ou superior ao seu preço por cota (\`Preço / Rendimento Unitário\`).
2. **Reinvestimento Sistemático:** Ao obter seus dividendos em conta líquida, execute ordens de compra fracionadas do próprio ativo para iniciar seu acúmulo em bola de neve.
3. **Persistência de Longo Prazo:** Uma vez ultrapassado o Número Mágico, a velocidade de multiplicação de suas cotas acelera exponencialmente, pois cada provento recebido se transmuta em novos ativos geradores de mais renda futura.
`;
  }, [snowTickerInput, snowPriceInput, snowPayoutInput, snowCurrentQty, snowballCalcResult]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSnowTickerInput('');
    setSnowPriceInput('0');
    setSnowPayoutInput('0');
    setSnowCurrentQty('0');
  };

  return (
    <motion.div
      key="snowball-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* SECTION 1: Capture components form configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="capture-form-snow">
        {/* Market Pricing details */}
        <div className="bg-white border border-brand-line rounded-lg p-5 shadow-sm">
          <SRVFieldset
            title="Ativo & Proventos de Mercado"
            titleClassName="text-xs font-bold text-blue-500 uppercase tracking-tight mb-2 flex items-center gap-1.5"
            bulletClassName="bg-blue-400"
          >
            <div className="mb-4">
              <SRVAutoComplete
                label="Ativo / Código (Ticker)"
                placeholder="Ex: MXRF11, VGIR11..."
                options={tickerOptions}
                value={snowTickerInput}
                onChange={handleSnowTickerInput}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <SRVInput
                  label="Preço do Ativo (R$)"
                  classNameLabel="text-[10px] uppercase font-bold text-slate-500 tracking-tight"
                  type="number"
                  min="0"
                  step="any"
                  value={snowPriceInput}
                  onChange={(e) => setSnowPriceInput(e.target.value)}
                />
              </div>
              <div>
                <SRVInput
                  label="Rendimento Unitário (R$)"
                  classNameLabel="text-[10px] uppercase font-bold text-slate-500 tracking-tight"
                  type="number"
                  min="0"
                  step="any"
                  value={snowPayoutInput}
                  onChange={(e) => setSnowPayoutInput(e.target.value)}
                />
              </div>
            </div>
          </SRVFieldset>
        </div>

        {/* Current User position */}
        <div className="bg-white border border-brand-line rounded-lg p-5 shadow-sm">
          <SRVFieldset
            title="Posição Patrimonial Atual"
            titleClassName="text-xs font-bold text-indigo-600 uppercase tracking-tight mb-2 flex items-center gap-1.5"
            bulletClassName="bg-indigo-500"
          >
            <div className="pt-1">
              <SRVInput
                label="Quantidade Atual em Carteira (Opcional)"
                classNameLabel="text-[10px] uppercase font-bold text-indigo-600 tracking-tight"
                type="number"
                min="0"
                value={snowCurrentQty}
                onChange={(e) => setSnowCurrentQty(e.target.value)}
              />
              <p className="text-[10px] text-slate-400 mt-2 leading-snug">
                Insira a quantidade de cotas que você já possui para que o relatório avalie precisamente o progresso atual, a carência em capital e o efeito multiplicativo da renda.
              </p>
            </div>
          </SRVFieldset>
        </div>
      </div>

      {/* SECTION 2: Dynamic Live Report in Markdown Format */}
      <div className="bg-white border border-brand-line rounded-lg shadow-sm overflow-hidden" id="report-md-box-snow">
        {/* Header Action Bar */}
        <header className="px-6 py-4 border-b border-brand-line bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-600">Relatório Bola de Neve</span>
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
              disabled={!snowTickerInput}
              className={cn(
                "px-3 py-1.5 text-[11px] font-bold rounded-md transition-all flex items-center gap-1.5 focus:outline-none",
                !snowTickerInput
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
