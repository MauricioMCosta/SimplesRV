/**
 * Manual content organized by sections
 * Each section is a standalone markdown string that can be easily maintained
 */

export const manualSections = {
    header: `# Manual de Uso - $implesRV (v1.4.0)

Bem-vindo ao **$implesRV**, sua estação local para consolidação, controle fiduciário e simulação matemática de investimentos em Renda Variável (Ações, FIIs, FIAGROs, ETFs e BDRs).

Esta aplicação é totalmente independente, executada de forma nativa e sem necessidade de servidores externos.`,

    dashboard: `## 1. Visão Geral (Dashboard)

O **Dashboard** é a central executiva da sua carteira, sintetizando dados cadastrais e financeiros:

- **Cards de Indicadores Médios:** Exibição ágil do lucro acumulado realizado, volume de transações consolidadas e total de ativos cadastrados.
- **Detecção de Pendências:** Indica ao investidor se existem ativos sem custodiante vinculado, CNPJs faltantes ou dados em aberto que necessitam de retificação de dados.
- **Posição de Custódia Ativa:** Tabela intuitiva com a soma de quantidade de ativos, preço médio computado atualizado e saldo consolidado por ticker de mercado baseado no custo histórico.`,

    assets: `## 2. Ativos (Assets)

O cadastro de **Ativos** atua como o registro cadastral mestre de todas as suas posições:

- **Pendências Automáticas:** Se você registrar uma transação ou importar uma nota contendo um ticker inédito, o sistema criará o ativo automaticamente sob a classificação de "PENDENTE".
- **Manutenção e Detalhamento:** Edite os parâmetros básicos do Ativo, incluindo a Razão Social (Descrição), Tipo (Ação, FII, BDR, etc.), Custodiante e Fonte Pagadora de proventos.
- **Pesquisa Inteligente (Autocomplete):** Ao editar, utilize campos de busca rápida para associar o Custodiante e Fonte Pagadora sem digitação repetitiva.`,

    custodians: `## 3. Custodiantes e Fontes Pagadoras

Página dedicada à gestão de instituições financeiras (corretoras, custodiantes oficiais) e empresas emissoras:

- **CNPJ e Razão Social:** Dados oficiais necessários para garantir a emissão íntegra dos Relatórios de Declaração Anual de Ajuste de Imposto de Renda.
- **Alinhamento Local:** O sistema cria rascunhos de custodiantes automaticamente ao detectar CNPJs não catalogados em importações, bastando que o investidor edite e normalize o nome oficial depois.`,

    transactions: `## 4. Transações

O livro-caixa mestre do **$implesRV**:

- **Tipos de Eventos Operacionais:** Suporta o registro individualizado de **Compra**, **Venda**, **Dividendo (DIV)**, **Juros sobre Capital Próprio (JCP)** e **Rendimentos (REND)**.
- **Ordem Cronológica:** Registre transações na data correta do pregão. O preço médio histórico utiliza uma trilha de auditoria sequencial para computar as saídas corretamente.`,

    corporateEvents: `## 5. Eventos Corporativos (Desdobramento e Agrupamento)

Ferramentas essenciais para manter a harmonia matemática de suas ações frente a alterações societárias:

- **Desdobramento (Split):** Caso a empresa multiplique o volume de controle. Você insere o fator multiplicador (Ex: 1:10); a quantidade aumenta e o custo unitário diminui na fração exata, mantendo o custo global inalterado.
- **Agrupamento (Insplit):** Aglutinação de cotas (Ex: 10:1). Reduz o montante em estoque e eleva o custo unitário de equilíbrio proporcionalmente.
- **Liquidação Fiduciária de Frações:** Sobras fracionárias resultantes dos grupamentos societários liquidadas na conta são computadas como ajustes de lucros realizados correspondentes.`,

    calculators: `## 6. Calculadoras Financeiras Dinâmicas

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

- **Detecção de Custódia de Destino:** Busca e exibe de forma reativa a quantidade de cotas e o preço médio histórico caso o ativo de destino selecionado já exista em seu portfólio de investimentos.
- **Resumo Executivo e Veredito:** Fornece um veredito fiduciário e um sumário executivo detalhando o impacto imediato da realocação no rendimento periódico absoluto e na eficiência percentual de dividendos.
- **Composição de Custódia Final (Tabela Comparativa):** Projeta matematicamente como a posição de destino ficará consolidada pós-operação, apresentando a quantidade final resultante de cotas, o novo preço médio recalculado e o montante financeiro residual integralizado.
- **Análise Patrimonial Ampliada:** Contrasta detidamente a transição patrimonial de preço médio de ambos os ativos (origem e destino). Explica a dinâmica de perda ou ganho de capital na liquidação de origem, informativos para fins fiscais de compensação de prejuízos regulada pela Receita Federal, bem como a diluição por redução de preço médio (*pullback average*) ou acúmulo ascendente de preço de custo médio (*upside premium*) no ativo de destino.
- **Payback de Prejuízo:** Se a venda for feita com prejuízo financeiro definitivo, a calculadora estima o **tempo em meses/períodos** para que os dividendos extras recorrentes do novo ativo amorteçam e cubram de forma orgânica a perda de patrimônio realizada.
- **Passo a Passo de Vendas:** Roteiro completo delimitando quantidades operacionais de liquidação da origem, reinvestimento no destino e sobra de caixa ("troco") no caixa da corretora.`,

    reports: `## 7. Relatórios (Imposto de Renda)

Gera os demonstrativos exigidos pelo Fisco para a Declaração de Ajuste Anual:

- **Bens e Direitos:** Consolidação da custódia do ativo em 31/12 de cada ano-fiscal ativo com o cálculo correto do preço médio patrimonial e indicação do respectivo Custodiante cadastrado (Nome oficial e CNPJ).
- **Rendimentos Isentos e Não Tributáveis:** Organiza por Fonte Pagadora os valores consolidados recebidos na forma de Lucros de Dividendos e Rendimentos Imobiliários.
- **Rendimentos Sujeitos à Tributação Exclusiva:** Agrupa proventos tributáveis retidos como Juros sobre Capital Próprio (JCP).`,

    realizedProfits: `## 8. Lucros Realizados e Custos FIFO

O $implesRV implementa o método contábil regulamentar de saída do estoque para fins tributários:

- **Algoritmo FIFO:** As vendas de ativos dão saída priorizando as primeiras compras realizadas na linha do tempo operada.
- **Monitoramento Fiscal:** Permite que você visualize o histórico e faça o cruzamento de suas operações para acompanhar se excedeu os limites de isenção de faturamento mensal tributável (como o limite regulamentar de R$ 20.000 em ações ordinárias de varejo no mercado à vista brasileiro).`,

    security: `## 9. Segurança, Infraestrutura Local & CNPJ Alfanumérico

- **Offline & Serverless:** Nenhum registro é enviado para nuvem. Seus dados cadastrais, financeiros e notas fiscais residem única e exclusivamente no banco de dados local **IndexedDB** do navegador de internet de seu computador, isolado via sandbox.
- **Novo CNPJ Alfanumérico:** O algoritmo interno de identificação fiduciária foi atualizado para suportar o novo padrão alfanumérico da Receita Federal Brasileira (Ex: \`12.ABC.345/0001-99\`), prevenindo problemas de preenchimento ou travamento cadastral de fontes pagadoras ou brokers internacionais.
- **Prática de Segurança de Dados:** Faça sempre a exportação regular das informações em arquivos JSON integrados (na aba Configurações) para proteção em caso de exclusão de caches ou uso de dispositivos adicionais simultâneos.`,

    advancedFiltering: `## 10. Filtro Inteligente e Unificado por Expressões (AST Engine)

O sistema conta com uma barra de pesquisa inteligente e unificada que combina buscas textuais simples (Busca Rápida) e consultas expressivas em Árvore de Sintaxe Abstrata (AST) de forma nativa e instantânea:

- **Seleção Dinâmica Automatizada:**
  - Se você digitar termos normais (Ex: \`VIS\`), o sistema executa automaticamente uma **Busca Rápida (Fuzzy)** em todas as propriedades visíveis.
  - Se você digitar uma expressão lógica/comparativa estruturada, o sistema ativa automaticamente o **Filtro AST** (sendo acompanhado por uma etiqueta indicativa na barra).
- **Operadores de Comparação em Expressões:**
  - \`=\` para igualdade de valores (Ex: \`ticker = 'KLBN11'\`).
  - \`!=\` para diferença de valores (Ex: \`type != 'SELL'\`).
  - \`>\`, \`<\`, \`>=\`, \`<=\` para filtros numéricos ou cronológicos (Ex: \`qty >= 100\`).
  - \`~\` para buscas baseadas em padrões LIKE com suporte ao caractere curinga \`*\` (Ex: \`ticker ~ 'KLBN*'\` para encontrar todos os tickers que começam com KLBN).
- **Operador de Mapeamento de Coluna (\`:\`):**
  - Permite filtrar diretamente pelo nome exibido/legível da coluna na tabela ao utilizar a sintaxe \`:Nome da Coluna:\` (Ex: \`:tipo: = 'BUY' OR :tipo: = 'SELL'\`, ou \`:Preço Médio: > 10.50\`). Isso facilita pesquisas sem precisar conhecer a chave exata da propriedade de dados subjacente.
- **Operadores Lógicos Complexos:**
  - \`AND\` para conjunção de regras obrigatórias.
  - \`OR\` para disjunção de condições alternativas.
  - Parênteses \`(\` e \`)\` para precedência explícita e agrupamento lógico (Ex: \`ticker = 'KLBN11' AND (:tipo: = 'BUY' OR :tipo: = 'SELL')\`).
- **Resolução Automática:** Os campos de dados como \`ticker\`, \`type\`, \`price\` e \`qty\` são automaticamente mapeados e resolvidos pelo compilador para simplificar a digitação do investidor, oferecendo respostas imediatas em todas as tabelas paginadas do sistema.`
};

/**
 * Compose full manual content from sections
 * Each section is separated by a Markdown horizontal rule for visual clarity
 */
export const getFullManualContent = (): string => {
    return Object.values(manualSections).join('\n\n---\n\n');
};
