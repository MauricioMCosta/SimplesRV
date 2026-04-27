import React from 'react';
import { ShieldAlert, Database, Info } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      
      <div className="bg-white border border-brand-line p-10 rounded shadow-sm text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-brand-sidebar text-brand-accent font-bold tracking-tight text-xl flex items-center justify-center rounded-xl mb-4">
          $RV
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">
          $imples<span className="text-brand-accent">RV</span>
        </h1>
        <p className="text-sm font-mono text-slate-400 mb-6">Versão: 1.2.0-stable</p>
        <p className="text-slate-600 max-w-lg mb-8 leading-relaxed">
          O <strong>$implesRV</strong> nasceu com a proposta de ser uma ferramenta prática, ágil e livre de complicações para a anotação, apuração e o acompanhamento pessoal de transações no mercado de Renda Variável. Idealizado e programado como um bloco de anotações inteligente de cálculo de posições.
        </p>

        <div className="text-xs text-slate-400 space-y-1">
          <p>Autoria: Desenvolvido e projetado exclusivamente pela comunidade.</p>
          <p>&copy; {new Date().getFullYear()} Todos os direitos de copyright reservados em formato Open-to-use.</p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 p-8 rounded shadow-sm text-red-900">
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert className="text-red-500 shrink-0" size={24} />
          <h2 className="text-lg font-bold">Termos de Uso e Isenção de Responsabilidade</h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-red-800/90 text-justify">
          <p>
            O <strong>$implesRV NÃO é uma aplicação que gerencia ativamente carteiras vinculadas</strong>, não executa ordens 
            e <strong>NÃO SUBSTITUI</strong> em hipótese alguma os meios legais, contábeis e fiscais oficiais, como as notas de 
            corretagem dos brokers bancários, os demonstrativos e canais (exemplo B3), ou as plataformas ligadas ao 
            governo federal e Receita Federal (exemplo: RevAR e carnê-leão/GCAP).
          </p>
          <p>
            Explicitamos nossa total <strong>isenção de todos os problemas ou perdas financeiras (e fiscais) advindas do 
            mau-uso ou inserção equivocada de dados</strong>. Este aplicativo apresenta consolidações financeiras e dados formatados apenas a nível informativo de diário acadêmico/estudo individual, sem nenhuma validade frente ao Governo, não possuindo vínculo ou autenticação cruzada do mercado real.
          </p>
          <p>
            <strong>Privacidade e Dados:</strong> O $implesRV foi construído prezando o princípio da <em>ausência de servidores</em> ("serverless client-side"). Deixamos claro que a gerência de dados é de <strong>única e exclusiva responsabilidade do usuário</strong> e que os dados das transações preenchidos <strong>não são coletados, transmitidos, nem compartilhados de nenhuma maneira pela aplicação</strong>, pelo simples fato deste aplicativo não armazenar nem manipular dados em nuvens ou em infraestrutura remota. Todo o conteúdo é persistido unicamente de formato embutido e isolado localmente pelo seu próprio navegador (browser). Se você formatar seu computador, os dados se perdem.
          </p>
          <p>
            <strong>Práticas de Segurança:</strong> O software possui meios, na aba Configurações, de realizar <span className="font-bold underline">Backup</span> (Exportar JSON) e <span className="font-bold underline">Restore</span> (Importar JSON) locais. É amplamente encorajado que o usuário adote o hábito constante de adotar tais técnicas para manter suas finanças e dados sempre atualizados, respaldados e a salvo. Inclusive, por motivos de higiene digital e segurança, ao utilizar computadores públicos (ou corporativos de uso múltiplo), limpe a base de dados nas configurações logo após efetuar e salvar localmente o seu backup para garantir que ninguém acessará seu arquivo pessoal no browser alheio.
          </p>
        </div>
      </div>

      <div className="text-center p-6 text-sm text-slate-500">
        <Info className="inline-block mr-2" size={16} />
        A utilização continuada deste software indica que o usuário tem familiaridade, lida, e <strong>concorda em absoluto </strong> com todos os termos de uso, ressalvas e as devidas restrições supramencionadas.
      </div>
      
    </div>
  );
}
