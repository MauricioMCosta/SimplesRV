import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ShieldAlert } from 'lucide-react';

const markdownContent = `
## O Projeto
O **$implesRV** nasceu com a proposta de ser uma ferramenta prática, ágil e livre de complicações para a anotação, 
apuração e o acompanhamento pessoal de transações no mercado de Renda Variável. 

A ideia surgiu da necessidade de automação de operações que originalmente eram feitas em planilhas eletrônicas
e que acabaram demandando um esforço de programação maior.

---

## 🛡️ Termos de Uso e Isenção de Responsabilidade

### 0. Aceite do Usuário

O usuário, ao acessar esse sistema e fazer o seu uso, automaticamente aceita de boa fé os termos desse
contrato.

O sistema $implesRV é apresentado "as is". Não há garantias e nem obrigações por parte do desenvolvedor em
constantemente implementar requisitos vindos de usuários, pronta-correção de bugs.

Em contrapartida, o usuário fica livre para usar, de forma livre e gratuita, para fins próprios e pessoais.
 
### 1. Não Substituição de Canais Oficiais
O **$implesRV NÃO é uma aplicação que gerencia ativamente carteiras vinculadas**, não executa ordens e 
**NÃO SUBSTITUI**, em hipótese alguma, os meios legais, contábeis e fiscais oficiais.

Cabe ao usuário:
- manter diligência no armazenamento das notas de corretagem fornecidas pelos brokers ou agentes bancários, 
- manter sempre atualizados os registros em canais oficiais de gestão de mercado acionário e seus agentes ou 
permissionários (bancos, brokers, bolsa de valores), e nas plataformas ligadas ao 
governo federal e Receita Federal (exemplo: RevAR e recolhimentos carnê-leão/GCAP, etc).


### 2. Isenção de Perdas e Danos

Explicitamos nossa total **isenção de todos os problemas ou perdas financeiras advindas do 
mau-uso** ou não observância das boas práticas de custódia e decisões no mercado financeiro. 

Este aplicativo apresenta consolidações financeiras e dados  formatados apenas a nível informativo
de uso individual, sem nenhuma validade frente ao Governo e instituições, não possuindo vínculo ou 
autenticação cruzada do mercado real.

As calculadoras somente geram informações para serem consumidas em caráter informativo e nunca imperativo. As análises 
geradas são baseados somente na qualidade dos dados e seu processamento sem levar em conta viés de mercado ou análises precisas 
que as corroborem.

Use por conta e risco.

### 3. Privacidade e Gerência de Dados

O $implesRV foi construído prezando o princípio da *ausência de servidores* ("serverless client-side"). 

Deixamos claro que a gerência de dados é de **única e exclusiva responsabilidade do usuário**. 

- Os dados das transações **não são coletados, transmitidos e nem compartilhados com terceiros**.
- Não há armazenamento em nuvens ou em infraestrutura remota. 
- Todo o conteúdo é persistido unicamente no banco de dados local **no seu navegador** utilizando a tecnologia IndexedDB.

> **Atenção:** Se você limpar os dados do navegador ou trocar de dispositivo sem ter um backup, as 
informações serão perdidas.

Recomendamos fazer o backup (via aplicativo, na aba de Configurações) e guardar o arquivo em local seguro. Você poderá restaurar
o conteudo a qualquer instante usando o arquivo previamente salvado.

### 4. Boas Práticas de Segurança

- É amplamente encorajado que o usuário adote o hábito constante de exportar seus dados.
- Em computadores públicos ou compartilhados, lembre-se de limpar a base de dados após o uso por segurança.

---

> A utilização continuada deste software indica que o usuário tem familiaridade e **concorda em absoluto** com todos os termos, ressalvas e as devidas restrições mencionadas.
`;

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header Card */}
      <div className="bg-white border border-brand-line p-10 rounded shadow-sm text-center flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-brand-sidebar text-brand-accent font-bold tracking-tight text-xl flex items-center justify-center rounded-xl mb-4">
          $RV
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">
          $imples<span className="text-brand-accent">RV</span>
        </h1>
        <p className="text-sm font-mono text-slate-400 mb-6">Versão: 1.2.0-stable</p>

        <div className="text-xs text-slate-400 space-y-1">
          <p>Autoria: Desenvolvido e projetado exclusivamente pela comunidade.</p>
          <p>&copy; {new Date().getFullYear()} Todos os direitos de copyright reservados em formato Open-to-use.</p>
        </div>
      </div>

      {/* Warning Box (Preserved for importance) */}
      <div className="bg-red-50 border border-red-100 p-6 rounded shadow-sm text-red-900 mb-6 flex items-start gap-4">
        <ShieldAlert className="text-red-500 shrink-0 mt-1" size={20} />
        <div className="text-sm">
          <p className="font-bold mb-1 uppercase tracking-tight">Aviso Legal Importante</p>
          <p className="text-red-800/80">Esta aplicação não possui validade fiscal. Utilize as informações aqui geradas apenas para controle pessoal e estudo de carteira.</p>
        </div>
      </div>

      {/* Markdown Content Card */}
      <div className="bg-white border flex flex-col border-brand-line p-10 rounded shadow-sm prose prose-slate prose-sm sm:prose-base max-w-none text-slate-700">
        <Markdown remarkPlugins={[remarkGfm]}>
          {markdownContent}
        </Markdown>
      </div>
    </div>
  );
}
