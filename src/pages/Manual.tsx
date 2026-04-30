import React from 'react';
import Markdown from 'react-markdown';

const markdownContent = `
# Manual de Uso - $implesRV

Bem-vindo ao **$implesRV**, sua ferramenta local para consolidação de ativos e apuração de lucros em Renda Variável.

Este manual guiará você pelas principais funcionalidades da aplicação.

## 1. Visão Geral (Dashboard)
Ao abrir a aplicação, o **Dashboard** oferece um resumo gerencial da sua base de dados atual e painéis mostrando rapidamente o total de lucros, métricas de volume e uso. 
- *Acesso rápido:* Resumo dos seus resultados fechados de ganhos e perdas.

## 2. Ativos (Assets)
A aba **Ativos** é o seu cadastro de controle mestre das empresas, fundos (FII, FIA), ETFs, BDRs e afins que você opera.
- Os ativos são adicionados automaticamente como "PENDENTE" ao cadastrar uma transação de um ticker não conhecido.
- Você pode editar o tipo do ativo ou criar novos ativos previamente na tabela utilizando o botão **Novo Ativo**.

## 3. Transações
O coração do $implesRV é a aba **Transações**. Nela você registra suas compras (COMPRA) e vendas (VENDA).
- Clique em **Nova Transação** e forneça a Data, Ticker (código do ativo), Tipo (COMPRA ou VENDA), Quantidade e Preço Unitário.
- A consistência temporal é importante: o sistema recalcula de forma cronológica com base nessas entradas para determinar custos médios.
- O campo "Filtro" nas colunas facilita explorar o histórico de um ativo específico em meio a grandes volumes.

### 3.1 Eventos Corporativos (Desdobramento e Agrupamento)
O sistema suporta o registro de ajustes de custódia diretamente na aba de Transações:
- **Desdobramento (SPLIT):** Utilizado quando a empresa aumenta o número de ações (ex: 1 para 10). Informe o **Fator** de multiplicação (ex: 10). Sua quantidade será multiplicada e seu preço médio dividido por este fator.
- **Agrupamento (INPLIT):** Utilizado para consolidar ações (ex: 10 para 1). Informe o **Fator** de agrupamento (ex: 10). Sua quantidade será dividida e seu preço médio multiplicado.
- **Tratamento de Frações (Sobras):** No agrupamento, se a divisão não for exata, o sistema realizará o seguinte ajuste automático:
    - A parte inteira permanece na sua custódia.
    - A porção fracionária (ex: 0,5 cota) é movida para a aba **Lucros Realizados** com o tipo **AJUSTE**.
    - Inicialmente, o preço de venda é igual ao custo médio (lucro zero). Quando você receber o valor do leilão de frações da corretora, você pode identificar essa linha em Lucros Realizados e entender o impacto fiscal daquela liquidação forçada.


## 4. Lucros Realizados
Nesta sessão, você visualiza de forma automática a consolidação dos resultados de suas vendas.
- Toda vez que uma VENDA é incluída na aba Transações, o sistema busca as COMPRAS anteriores do mesmo Ticker e calcula o lucro ou prejuízo do evento.
- **Preço Médio:** O sistema calcula dinamicamente seu custo de aquisição deduzindo saldos.

## 5. Configurações e Backup
É vital lembrar que os dados são **locais** (residem dentro do seu navegador atual).
- Utilize a aba **Configurações** para realizar **Exportações (Backup)**. Um arquivo \`.json\` é baixado no seu computador.
- Caso acesse a ferramenta em um novo browser, ou limpe o cache, os dados sumirão. Para voltar, utilize o botão **Importar**.
- É possível limpar a base completamente, uma ferramenta muito útil caso precise usar o sistema de forma portátil em lugares diferentes após realizar o seu backup.

---

> **DICA DE OURO:** Mantenha disciplina em registrar seus aportes com o ticker correto e a data precisa, garantindo que a calculadora de custo e alocação de venda obedeça a sequência lógica (FIFO / Preço Médio Ponderado).
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
