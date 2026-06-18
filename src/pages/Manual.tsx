import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getFullManualContent } from '@/src/data/manualContent';

export default function Manual() {
  const markdownContent = getFullManualContent();

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
