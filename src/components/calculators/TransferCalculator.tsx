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

  // Memoized current position in destination asset
  const destPosition = useMemo(() => {
    if (!transDestTicker) return null;
    return positions.find(p => p.ticker === transDestTicker.toUpperCase());
  }, [transDestTicker, positions]);

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

    const destQty = destPosition ? destPosition.qty : 0;
    const destAvgPrice = destPosition ? destPosition.avgPrice : 0;
    const destFinalQty = destQty + qB;
    const destCurrentTotal = destQty * destAvgPrice;
    const destAddedTotal = qB * dPrice;
    const destFinalTotal = destCurrentTotal + destAddedTotal;
    const destNewAvgPrice = destFinalQty > 0 ? destFinalTotal / destFinalQty : 0;
    const destPriceDiff = destNewAvgPrice - destAvgPrice;
    const destPriceDiffPercent = destAvgPrice > 0 ? (destPriceDiff / destAvgPrice) * 100 : 0;

    const destPrevIncome = destQty * dPayout;
    const destAddedIncome = qB * dPayout;
    const destFinalIncome = destFinalQty * dPayout;

    let pnlDetailsBlock = '';
    if (oAvg > 0 || destPosition) {
      pnlDetailsBlock = `### 💼 Análise Patrimonial e Transição de Preço Médio

Para garantir a higienização fiduciária da sua carteira, analisamos a transição do custo médio e do patrimônio nos dois polos da transação:

`;

      if (oAvg > 0) {
        const pnlColor = isLoss ? '🔴 Prejuízo' : '🟢 Lucro';
        const recoveryText = (isLoss && incomeDiff > 0) 
          ? `\n- **Tempo para Recuperação (Payback):** Serão necessários aproximadamente **${Math.ceil(Math.abs(profitLoss) / incomeDiff)} períodos/meses** de proventos incrementais de **${transDestTicker}** para amortizar e recuperar integralmente este prejuízo realizado.` 
          : '';

        pnlDetailsBlock += `#### 🔴 Ativo de Origem: ${transOriginTicker}

O desinvestimento integral da sua posição atual de **${oQty.toLocaleString('pt-BR')} un** de **${transOriginTicker}** consolida o seguinte cenário patrimonial:
- **Preço Médio de Aquisição Histórico:** R$ ${oAvg.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- **Custo Total de Aquisição:** R$ ${costBasis.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- **Valor Desinvestido Líquido (Base Venda):** R$ ${salesCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- **Resultado Contábil da Venda (P&L):** **${pnlColor} de R$ ${profitLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${pnlPercent.toFixed(2)}%)**

${isLoss ? `> ⚠️ **Informativo de Compensação Fiscal (Prejuízo Realizado):**
> Vender ativos com preço de mercado inferior ao seu preço médio gera uma perda líquida definitiva de capital de **R$ ${Math.abs(profitLoss).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** no seu patrimônio ativo.
> No entanto, conforme a regulamentação tributária da Receita Federal do Brasil, este prejuízo poderá ser escriturado para **compensação tributária futura** contra ganhos líquidos auferidos sob a mesma categoria de ativos de renda variável.${recoveryText}` 
: isGain ? `> 🎉 **Informativo de Tributação (Lucro Realizado):**
> Esta operação gera um lucro apurado de **R$ ${profitLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (+${pnlPercent.toFixed(2)}%).
> Atente-se às regras de isenção mensais aplicáveis ou à necessidade de recolhimento tributário via emissão de canais autorizados (DARF).` 
: ''}

`;
      }

      pnlDetailsBlock += `#### 🟢 Ativo de Destino: ${transDestTicker}

O reinvestimento do capital líquido de **R$ ${salesCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** no ativo de destino causará a seguinte transição na sua custudo-geral:
- **Quantidade Adquirida Deduzida:** +${qB.toLocaleString('pt-BR')} un a **R$ ${dPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** cada.
- **Estruturação de Custo de Equilíbrio (Preço Médio):**
  ${destPosition ? `
  - **Quantidade Inicial:** ${destQty.toLocaleString('pt-BR')} un
  - **Volume Inicial do Capital de Aquisição:** R$ ${destCurrentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Preço Médio Anterior: *R$ ${destAvgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*)
  - **Novo Preço Médio Consolidado:** **R$ ${destNewAvgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**
  - **Variação Estimada do Preço Médio:** **${destPriceDiff >= 0 ? '+' : ''}R$ ${destPriceDiff.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${destPriceDiff >= 0 ? '+' : ''}${destPriceDiffPercent.toFixed(2)}%)**
  
  > ${destPriceDiff < 0 
    ? `📉 **Redução de Preço Médio (*Pullback Average*):** A operação é altamente benéfica para o seu ponto de equilíbrio de mercado! O seu preço médio anterior foi reduzido de forma orgânica, aproximando a posição geral dos preços atuais praticados.` 
    : `📈 **Elevação de Preço Médio (*Upside Premium*):** Você estará elevando seu preço de custo médio anterior no ativo de destino. Isso é perfeitamente normal e saudável ao realizar aportes recorrentes de lucros ou fazer novos preços médios ascendentes em ativos sólidos.`
  }` 
  : `
  - **Posição Prévia:** Nenhuma detectada (Primeira compra deste papel).
  - **Preço Médio Inicial Estabelecido:** **R$ ${destNewAvgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (equivalente ao preço de aquisição proposto).
  `
}
- **Montante Alocado Resultante Final:** **R$ ${destFinalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (composto por R$ ${destCurrentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} prévios + R$ ${destAddedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} adicionados via simulação).`;
    }

    return `## 📊 Relatório Multidimensional de Realocação: ${transOriginTicker} ➔ ${transDestTicker}

---

### Resumo Executivo e Veredito

**Veredito:** **${verdictLabel}**

A simulação de migração patrimonial integral de **${transOriginTicker}** para **${transDestTicker}** resultará na seguinte modelagem fiduciária:

- **Impacto no Fluxo de Proventos:** Uma variação de **${incomeDiff >= 0 ? 'elevação benéfica de' : 'redução de'} R$ ${Math.abs(incomeDiff).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** no seu fluxo recorrente projetado por período. Isto representa uma alteração de **${incomeDiff >= 0 ? '+' : ''}${incomeDiffPercent.toFixed(2)}%** na sua renda passiva periódica gerada por esta parcela alocada do seu portfólio.
- **Eficiência de Taxa (Dividend Yield):** Seu yield unitário periódico migrará de **${yieldA.toFixed(2)}%** para **${yieldB.toFixed(2)}%** (${((yieldB - yieldA) >= 0 ? '+' : '')}${(yieldB - yieldA).toFixed(2)}% de diferença de rendimento bruto).
- **Consolidação na Destinação:** ${destPosition 
  ? `Como você já possui custódia de **${transDestTicker}** (${destQty.toLocaleString('pt-BR')} un), esta operação aumentará sua participação em **+${qB.toLocaleString('pt-BR')} un** (totalizando **${destFinalQty.toLocaleString('pt-BR')} un** na carteira) e recalculará seu custo médio histórico.`
  : `Esta operação marcará o início de uma nova posição para você em **${transDestTicker}**, adicionando **${qB.toLocaleString('pt-BR')} un** ao seu inventário ativo.`
}

---

### 💰 Tabela Comparativa de Fluxo

| Indicador | Situação Atual (${transOriginTicker}) | Nova Situação (${transDestTicker}) | Variação Estimada |
| :--- | :---: | :---: | :---: |
| **Quantidade** | ${oQty.toLocaleString('pt-BR')} un | ${qB.toLocaleString('pt-BR')} un | - |
| **Preço Unitário (Venda / Compra)** | R$ ${oPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | R$ ${dPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | - |
| **Último Provento Unitário** | R$ ${oPayout.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} | R$ ${dPayout.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} | - |
| **Dividend Yield Periódico** | ${yieldA.toFixed(2)}% | ${yieldB.toFixed(2)}% | ${((yieldB - yieldA) >= 0 ? '+' : '')}${(yieldB - yieldA).toFixed(2)}% |
| **Renda Passiva Periódica** | **R$ ${incomeA.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** | **R$ ${incomeB.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** | **R$ ${incomeDiff.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${incomeDiff >= 0 ? '+' : ''}${incomeDiffPercent.toFixed(2)}%)** |

#### 🎯 Composição de Custódia Final do Ativo de Destino (${transDestTicker})

| Parâmetro de Posição | Situação Prévia | Incremento (Troca) | Posição Final Consolidada |
| :--- | :---: | :---: | :---: |
| **Quantidade em Custódia** | ${destPosition ? `${destQty.toLocaleString('pt-BR')} un` : '0 un (Novo Ativo)'} | +${qB.toLocaleString('pt-BR')} un | **${destFinalQty.toLocaleString('pt-BR')} un** |
| **Preço Médio Calculado** | ${destPosition ? `R$ ${destAvgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'} | R$ ${dPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | **R$ ${destNewAvgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** |
| **Montante Financeiro Alocado** | ${destPosition ? `R$ ${destCurrentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'} | R$ ${destAddedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | **R$ ${destFinalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** |
| **Renda Passiva Periódica** | ${destPosition ? `R$ ${destPrevIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'} | R$ ${destAddedIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | **R$ ${destFinalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** |

---

${pnlDetailsBlock}

---

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
    destPosition,
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
                notFoundHint="Ativo não encontrado."
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
                notFoundHint="Ativo não encontrado."
              />
            </div>

            {destPosition && (
              <div className="mb-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Posição Custodiada Detectada (Destino)
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium">
                  <div className="bg-white border border-indigo-50 p-1.5 rounded flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Quantidade Atual (QTDE)</span>
                    <span className="text-slate-900 font-bold text-sm">{destPosition.qty.toLocaleString('pt-BR')} un</span>
                  </div>
                  <div className="bg-white border border-indigo-50 p-1.5 rounded flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Preço Médio Atual (PM)</span>
                    <span className="text-slate-900 font-bold text-sm font-mono text-indigo-600">
                      R$ {destPosition.avgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}

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
