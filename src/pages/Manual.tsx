import React from 'react';
import Markdown from 'react-markdown';

const markdownContent = `
# Manual de Uso - $implesRV

## Sumário
1. [Visão Geral (Dashboard)](#1-visão-geral-dashboard)
2. [Ativos (Assets)](#2-ativos-assets)
3. [Custodiantes e Fontes Pagadoras](#3-custodiantes-e-fontes-pagadoras)
4. [Transações](#4-transações)
5. [Relatórios (Imposto de Renda)](#5-relatórios-imposto-de-renda)
6. [Lucros Realizados](#6-lucros-realizados)
7. [Configurações e Backup](#7-configurações-e-backup)

Bem-vindo ao **$implesRV**, sua ferramenta local para consolidação de ativos e apuração de lucros em Renda Variável.

Este manual guiará você pelas principais funcionalidades da aplicação.

## 1. Visão Geral (Dashboard)
Ao abrir a aplicação, o **Dashboard** oferece um resumo gerencial da sua base de dados atual.
- **Cards de Métricas:** Exibem o total de lucros, volume de transações e ativos.
- **Pendências:** O sistema alerta sobre registros pendentes que precisam de atenção (Ativos, Transações e Custodiantes).
- **Posição das Ações:** Uma tabela detalhada com sua custódia atual, custo médio e saldo (total investido).

## 2. Ativos (Assets)
A aba **Ativos** é o seu cadastro de controle mestre das empresas, fundos (FII, FIA), ETFs, BDRs e afins que você opera.
- **Pendentes:** Novos ativos são adicionados automaticamente como "PENDENTE" ao cadastrar uma transação de um ticker não conhecido.
- **Manutenção:** Você deve editar os ativos pendentes para preencher a Descrição, Tipo, Custodiante e Fonte Pagadora.
- **Vínculos:** Ao editar um ativo, utilize as caixas de **Auto-complete** para pesquisar e selecionar o Custodiante e a Fonte Pagadora previamente cadastrados.

## 3. Custodiantes e Fontes Pagadoras
Esta página centraliza o cadastro das instituições financeiras e empresas responsáveis pelo pagamento de proventos.
- **CNPJ e Nome:** Informe os dados oficiais para que os relatórios de Imposto de Renda sejam gerados corretamente.
- **Registros Pendentes:** O sistema cria registros automáticos quando um CNPJ desconhecido é importado de notas ou digitado em outras telas. Sempre revise esses registros para garantir que o nome da instituição esteja correto.

## 4. Transações
O coração do $implesRV é a aba **Transações**. Nela você registra todas as suas movimentações.
- **Tipos de Operação:** Suporta COMPRA (Mercado à vista), VENDA, DAY TRADE e SWING TRADE.
- **Organização:** Utilize os filtros de busca para localizar transações por ticker ou data.
- **Consistência:** A ordem cronológica das transações é fundamental para o cálculo correto do Preço Médio.

### 4.1 Eventos Corporativos (Desdobramento e Agrupamento)
O sistema suporta o registro de ajustes de custódia:
- **Desdobramento (SPLIT):** Informe o fator multiplicador. A quantidade de ações aumenta e o preço médio diminui proporcionalmente.
- **Agrupamento (INPLIT):** Informe o fator de agrupamento. A quantidade diminui e o preço médio aumenta.
- **Tratamento de Frações:** No agrupamento, frações resultantes são liquidadas automaticamente como ajustes de lucros realizados.

## 5. Relatórios (Imposto de Renda)
A seção de **Relatórios** permite gerar documentos auxiliares para sua declaração anual.
- **Relatório de Transmutações (IR):** Gera um documento em Markdown detalhando a posição em 31/12 de cada ativo, lucros/prejuízos mensais e dados dos custodiantes.
- **Importante:** Os valores de rendimentos são brutos. O relatório não substitui os informes oficiais das fontes pagadoras.

## 6. Lucros Realizados
Visualização automática dos resultados de suas vendas.
- O sistema confronta cada VENDA com as COMPRAS anteriores (sistema Preço Médio/FIFO).
- Permite entender a performance por ativo e monitorar o limite de isenção mensal se aplicável.

## 7. Configurações e Backup
Os dados são armazenados **exclusivamente no seu navegador**.
- **Backup:** Exporte regularmente seus dados em formato \`.json\` via tela de Configurações.
- **Privacidade:** Nenhum dado é enviado para servidores externos. Tudo fica sob seu controle total.
- **Importação:** Permite restaurar backups ou migrar seus dados para outro dispositivo.

---

> **DICA DE OURO:** Mantenha disciplina em registrar seus aportes com o ticker correto e revise sempre os registros pendentes de Ativos e Custodiantes para garantir relatórios precisos.
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
        <p className="text-sm font-mono text-slate-400 mb-6">Versão: 1.2.0-stable</p>


        <div className="text-xs text-slate-400 space-y-1">
          <p>Mauricio M Costa (mauricio_martins@hotmail.com)</p>
          <p>&copy; {new Date().getFullYear()} Todos os direitos de copyright reservados em formato Open-to-use.</p>
        </div>
      </div>
      <div className="bg-white border flex flex-col border-brand-line p-10 rounded shadow-sm prose prose-slate prose-sm sm:prose-base max-w-none text-slate-700">
        <Markdown>
          {markdownContent}
        </Markdown>
      </div>
    </div>
  );
}
