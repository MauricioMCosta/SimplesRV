import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileBarChart, Play, Loader2, Download, ChevronRight } from 'lucide-react';
import { reports, ReportDefinition } from '../reports';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);
  const [reportOutput, setReportOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runReport = async (report: ReportDefinition) => {
    setLoading(true);
    setSelectedReport(report);
    try {
      const output = await report.execute();
      setReportOutput(output);
    } catch (error) {
      console.error('Falha ao gerar relatório:', error);
      setReportOutput('### Erro ao gerar relatório\nOcorreu uma falha durante o processamento dos dados.');
    } finally {
      setLoading(false);
    }
  };

  const clearReport = () => {
    setSelectedReport(null);
    setReportOutput(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header Card */}
      <div className="bg-white border border-brand-line p-10 rounded shadow-sm text-center flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-brand-sidebar text-brand-accent font-bold tracking-tight text-xl flex items-center justify-center rounded-xl mb-4">
          <FileBarChart size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-sidebar mb-2">
          Relatórios personalizados
        </h1>
        <p className="text-slate-500 max-w-lg mb-0 leading-relaxed">
          Consulte posições, lucros e movimentações formatadas em relatórios simples e diretos.
        </p>
      </div>

      {!reportOutput ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => runReport(report)}
              disabled={loading}
              className="group bg-white border border-brand-line p-6 rounded-lg shadow-sm hover:border-brand-accent transition-all text-left flex items-start gap-4 disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors shrink-0">
                <Play size={18} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 group-hover:text-brand-sidebar transition-colors">{report.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{report.description}</p>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-accent transition-colors self-center" />
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-brand-line shadow-sm">
            <div className="flex items-center gap-3">
              <button 
                onClick={clearReport}
                className="text-xs font-medium text-slate-500 hover:text-brand-sidebar flex items-center gap-1"
              >
                ← Voltar aos relatórios
              </button>
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-sm font-bold text-brand-sidebar">{selectedReport?.name}</span>
            </div>
            <button
              onClick={() => {
                   const blob = new Blob([reportOutput], { type: 'text/markdown' });
                   const url = URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.href = url;
                   a.download = `${selectedReport?.id}-${new Date().toISOString().split('T')[0]}.md`;
                   a.click();
              }}
              className="px-3 py-1.5 bg-slate-900 text-white text-xs rounded hover:bg-slate-800 flex items-center gap-2 transition-colors"
            >
              <Download size={14} />
              Baixar .md
            </button>
          </div>

          <div className="bg-white border border-brand-line p-10 rounded shadow-sm prose prose-slate prose-sm sm:prose-base max-w-none text-slate-700 report-content">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-brand-accent" size={32} />
                <p className="text-sm text-slate-400 font-mono">Gerando relatório...</p>
              </div>
            ) : (
              <Markdown remarkPlugins={[remarkGfm]}>
                {reportOutput}
              </Markdown>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
