import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const markdownContent = `
# Manual de Uso - $implesRV (v1.3.0)

## Sumário
1. [Visão Geral (Dashboard)](#1-visão-geral-dashboard)
2. [Ativos (Assets)](#2-ativos-assets)
3. [Custodiantes e Fontes Pagadoras](#3-custodiantes-e-fontes-pagadoras)
4. [Transações](#4-transações)
5. [Eventos Corporativos](#5-eventos-corporativos-desdobramento-e-agrupamento)
6. [Calculadoras Financeiras Dinâmicas](#6-calculadoras-financeiras-dinâmicas)
   - 6.1 [Simulação de Preço Médio (Aportes)](#61-simulação-de-preço-médio-aportes)
   - 6.2 [Projeção de Bola de Neve (Número Mágico)](#62-projeção-de-bola-de-neve-número-mágico)
   - 6.3 [Simulação de Realocação e Arbitragem (Payback & Caixa Residual)](#63-simulação-de-realocação-e-arbitragem-payback-caixa-residual)
7. [Relatórios (Imposto de Renda)](#7-relatórios-imposto-de-renda)
8. [Lucros Realizados e Custos FIFO](#8-lucros-realizados-e-custos-fifo)
9. [Segurança, Infraestrutura Local & Novo CNPJ Alfanumérico](#9-segurança-infraestrutura-local-novo-cnpj-alfanumérico)

---

Bem-vindo ao **$implesRV**, sua estação local para consolidação, controle fiduciário e simulação matemática de investimentos em Renda Variável (Ações, FIIs, FIAGROs, ETFs e BDRs).

Esta aplicação é totalmente independente, executada de forma nativa e sem necessidade de servidores externos.

---

## 1. Visão Geral (Dashboard)
O **Dashboard** é a central executiva da sua carteira, sintetizando dados cadastrais e financeiros:
- **Cards de Indicadores Médios:** Exibição ágil do lucro acumulado realizado, volume de transações consolidadas e total de ativos cadastrados.
- **Detecção de Pendências:** Indica ao investidor se existem ativos sem custodiante vinculado, CNPJs faltantes ou dados em aberto que necessitam de retificação de dados.
- **Posição de Custódia Ativa:** Tabela intuitiva com a soma de quantidade de ativos, preço médio computado atualizado e saldo consolidado por ticker de mercado baseado no custo histórico.

---

## 2. Ativos (Assets)
O cadastro de **Ativos** atua como o registro cadastral mestre de todas as suas posições:
- **Pendências Automáticas:** Se você registrar uma transação ou importar uma nota contendo um ticker inédito, o sistema criará o ativo automaticamente sob a classificação de "PENDENTE".
- **Manutenção e Detalhamento:** Edite os parâmetros básicos do Ativo, incluindo a Razão Social (Descrição), Tipo (Ação, FII, BDR, etc.), Custodiante e Fonte Pagadora de proventos.
- **Pesquisa Inteligente (Autocomplete):** Ao editar, utilize campos de busca rápida para associar o Custodiante e Fonte Pagadora sem digitação repetitiva.

---

## 3. Custodiantes e Fontes Pagadoras
Página dedicada à gestão de instituições financeiras (corretoras, custodiantes oficiais) e empresas emissoras:
- **CNPJ e Razão Social:** Dados oficiais necessários para garantir a emissão íntegra dos Relatórios de Declaração Anual de Ajuste de Imposto de Renda.
- **Alinhamento Local:** O sistema cria rascunhos de custodiantes automaticamente ao detectar CNPJs não catalogados em importações, bastando que o investidor edite e normalize o nome oficial depois.

---

## 4. Transações
O livro-caixa mestre do **$implesRV**:
- **Tipos de Eventos Operacionais:** Suporta o registro individualizado de **Compra**, **Venda**, **Dividendo (DIV)**, **Juros sobre Capital Próprio (JCP)** e **Rendimentos (REND)**.
- **Ordem Cronológica:** Registre transações na data correta do pregão. O preço médio histórico utiliza uma trilha de auditoria sequencial para computar as saídas corretamente.

---

## 5. Eventos Corporativos (Desdobramento e Agrupamento)
Ferramentas essenciais para manter a harmonia matemática de suas ações frente a alterações societárias:
- **Desdobramento (Split):** Caso a empresa multiplique o volume de controle. Você insere o fator multiplicador (Ex: 1:10); a quantidade aumenta e o custo unitário diminui na fração exata, mantendo o custo global inalterado.
- **Agrupamento (Insplit):** Aglutinação de cotas (Ex: 10:1). Reduz o montante em estoque e eleva o custo unitário de equilíbrio proporcionalmente.
- **Liquidação Fiduciária de Frações:** Sobras fracionárias resultantes dos grupamentos societários liquidadas na conta são computadas como ajustes de lucros realizados correspondentes.

---

## 6. Calculadoras Financeiras Dinâmicas
No módulo **Calculadoras**, o sistema oferece três simuladores integrados a relatórios produzidos dinamicamente sob formato Markdown rico, permitindo copiar e arquivar as recomendações:

### 6.1 Simulação de Preço Médio (Aportes)
Calcula com exatidão o impacto financeiro de novos aportes de capital antes de enviar a ordem para a bolsa:
- **Integração Real-Time:** Selecione o ticker do ativo e a calculadora buscará instantaneamente na base de dados sua quantidade cadastrada e o preço médio atual.
- **Alocação de Baixo vs. Alto Risco:** 
  - **Média para Baixo (Pullback):** Alerta fiduciário explicando a redução do ponto de equilíbrio (*break-even*) no gráfico do ativo.
  - **Média para Cima (Upside Premium):** Alertas sobre a elevação do custo unitário médio histórico ao acumular frentes vencedoras do mercado.

### 6.2 Projeção de Bola de Neve (Número Mágico)
Avalia em que estágio o ativo atinge o ponto de autoinvestimento infinito:
- **Número Mágico:** Computa quantas cotas mínimas são desejáveis para que o último rendimento mensal unitário pague uma nova cota adicional sem que você gaste um único centavo do próprio bolso.
- **Indicador de Progresso:** Confronta a quantidade atual que você detém contra a meta técnica e indica o percentual vencido da barreira matemática.
- **Carência Financeira:** Aponta com precisão o montante exato em dinheiro para aporte remanescente necessário para atingir o objetivo societário.

### 6.3 Simulação de Realocação e Arbitragem (Payback & Caixa Residual)
Projeta a troca/troca financeira integral de um ativo em carteira (Origem) para outro ativo-fim (Destino):
- **Veredito Inteligente:** Dá parecer fiduciário indicando se a realocação é favorável sob a perspectiva do fluxo de proventos e dividas anuais de médio prazo.
- **Análise de P&L de Preço Médio:** Confronta o preço médio original com o preço atual de venda da corretora, emitindo alertas estruturados em caso de prejuízos ou lucros patrimoniais.
- **Payback de Prejuízo:** Se a venda for feita com prejuízo financeiro definitivo, a calculadora estima o **tempo em meses/períodos** para que os dividendos extras recorrentes do novo ativo amorteçam e cubram de forma orgânica a perda de patrimônio realizada.
- **Tratamento Fiscal de Prejuízo:** Alerta formal sobre a declaração legal de compensação tributária futura conforme regras vigentes da Receita Federal.
- **Passo a Passo de Vendas:** Roteiro completo delimitando quantidades operacionais de liquidação da origem, reinvestimento no destino e sobra de caixa ("troco") no caixa da corretora.

---

## 7. Relatórios (Imposto de Renda)
Gera os demonstrativos exigidos pelo Fisco para a Declaração de Ajuste Anual:
- **Bens e Direitos:** Consolidação da custódia do ativo em 31/12 de cada ano-fiscal ativo com o cálculo correto do preço médio patrimonial e indicação do respectivo Custodiante cadastrado (Nome oficial e CNPJ).
- **Rendimentos Isentos e Não Tributáveis:** Organiza por Fonte Pagadora os valores consolidados recebidos na forma de Lucros de Dividendos e Rendimentos Imobiliários.
- **Rendimentos Sujeitos à Tributação Exclusiva:** Agrupa proventos tributáveis retidos como Juros sobre Capital Próprio (JCP).

---

## 8. Lucros Realizados e Custos FIFO
O $implesRV implementa o método contábil regulamentar de saída do estoque para fins tributários:
- **Algoritmo FIFO:** As vendas de ativos dão saída priorizando as primeiras compras realizadas na linha do tempo operada.
- **Monitoramento Fiscal:** Permite que você visualize o histórico e faça o cruzamento de suas operações para acompanhar se excedeu os limites de isenção de faturamento mensal tributável (como o limite regulamentar de R$ 20.000 em ações ordinárias de varejo no mercado à vista brasileiro).

---

## 9. Segurança, Infraestrutura Local & Novo CNPJ Alfanumérico
- **Offline & Serverless:** Nenhum registro é enviado para nuvem. Seus dados cadastrais, financeiros e notas fiscais residem única e exclusivamente no banco de dados local **IndexedDB** do navegador de internet de seu computador, isolado via sandbox.
- **Novo CNPJ Alfanumérico:** O algoritmo interno de identificação fiduciária foi atualizado para suportar o novo padrão alfanumérico da Receita Federal Brasileira (Ex: \`12.ABC.345/0001-99\`), prevenindo problemas de preenchimento ou travamento cadastral de fontes pagadoras ou brokers internacionais.
- **Prática de Segurança de Dados:** Faça sempre a exportação regular das informações em arquivos JSON integrados (na aba Configurações) para proteção em caso de exclusão de caches ou uso de dispositivos adicionais simultâneos.
`;

export default function Manual() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white border border-brand-line p-10 rounded shadow-sm text-center flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-brand-sidebar text-brand-accent font-bold tracking-tight text-xl flex items-center justify-center rounded-xl mb-4">
          $RV
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">
          $imples<span className="text-brand-accent">RV</span>
        </h1>
        <p className="text-sm font-mono text-slate-400 mb-6">Versão: 1.3.0-stable</p>

        <div className="text-xs text-slate-400 space-y-1">
          <p>Mauricio M Costa (mauricio_martins@hotmail.com)</p>
          <p>&copy; {new Date().getFullYear()} Todos os direitos de copyright reservados em formato Open-to-use.</p>
        </div>
      </div>
      <div className="bg-white border flex flex-col border-brand-line p-10 rounded shadow-sm prose prose-slate prose-sm sm:prose-base max-w-none text-slate-700">
        <Markdown remarkPlugins={[remarkGfm]}>
          {markdownContent}
        </Markdown>
      </div>
    </div>
  );
}
