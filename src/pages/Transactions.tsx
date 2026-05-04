import React, { useEffect, useState, useMemo } from 'react';
import { useDatabase } from '@/src/context/DatabaseContext';
import { Transaction } from '@/src/db/database';
import { useDialog } from '@/src/context/DialogContext';
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { DashboardTable } from '@/src/components/DashboardTable';
import { Modal } from '@/src/components/Modal';
import { SRVAutoComplete } from '@/src/components/SRVAutoComplete';
import { DataTableWrapper } from '@/src/components/DataTableWrapper';

export default function Transactions() {
  const { transactions, assets, db } = useDatabase();
  const { addTransaction, deleteTransaction, getPosition } = db;
  const { showAlertDialog, showConfirmDialog } = useDialog();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    id?: number;
    ticker: string;
    date: string;
    type: 'BUY' | 'SELL' | 'SPLIT' | 'INPLIT' | 'DIV' | 'JCP';
    qty: string;
    price: string;
  }>({
    ticker: '',
    date: new Date().toISOString().split('T')[0],
    type: 'BUY',
    qty: '',
    price: ''
  });
  
  const handleOpenForm = (type: 'BUY' | 'SELL' | 'SPLIT' | 'INPLIT' | 'DIV' | 'JCP' = 'BUY', editData?: Transaction) => {
    if (editData) {
      setFormData({
        id: editData.id,
        ticker: editData.ticker,
        date: editData.date,
        type: editData.type,
        qty: editData.qty.toString(),
        price: editData.price.toString()
      });
    } else {
      setFormData({
        ticker: '',
        date: new Date().toISOString().split('T')[0],
        type,
        qty: '',
        price: ''
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 3. Validação dos campos necessários
    if (!formData.ticker.trim()) {
      showAlertDialog('Favor informar o Ticker.');
      return;
    }
    if (!formData.qty || parseFloat(formData.qty) <= 0) {
      showAlertDialog('Favor informar uma quantidade válida.');
      return;
    }
    if (!formData.date) {
      showAlertDialog('Favor informar a data.');
      return;
    }

    const isCorporateAction = formData.type === 'SPLIT' || formData.type === 'INPLIT';
    
    if (!isCorporateAction && (!formData.price || parseFloat(formData.price) <= 0)) {
      showAlertDialog('Favor informar um preço unitário válido.');
      return;
    }

    const qty = parseFloat(formData.qty);
    const ticker = formData.ticker.toUpperCase().trim();

    // 1. Form de entrada de registro: a quantidade vendida, nao pode ser maior que a quantidade disponivel
    if (formData.type === 'SELL') {
      const currentPos = await getPosition(ticker);
      const available = currentPos ? currentPos.qty : 0;
      if (qty > available) {
        showAlertDialog(`Quantidade para venda (${qty}) maior que a disponível (${available.toLocaleString()}) para o ticker ${ticker}.`);
        return;
      }
    }

    if (formData.id) {
      await db.updateTransaction(formData.id, {
        ticker,
        date: formData.date,
        type: formData.type,
        qty,
        price: isCorporateAction ? 0 : parseFloat(formData.price)
      });
    } else {
      await addTransaction({
        ticker,
        date: formData.date,
        type: formData.type,
        qty,
        price: isCorporateAction ? 0 : parseFloat(formData.price)
      });
    }

    setFormData({
      ticker: '',
      date: new Date().toISOString().split('T')[0],
      type: 'BUY',
      qty: '',
      price: ''
    });
    setShowForm(false);
  };

  const handleEdit = (data: any) => {
    handleOpenForm(data.type, data);
  };

  const handleDelete = async (row: any) => {
    const {id} = row;
    if (!id) return;
    showConfirmDialog('Deseja excluir esta transação?', async () => {
      await deleteTransaction(id);
    });
  };

  console.log(transactions);
  const tableData = useMemo(() => transactions.map(tx => ({
    id: tx.id,
    data: { 
      ...tx, 
      total: tx.qty * tx.price,
      status: tx.is_pending ? 'PENDENTE' : 'CONSOLIDADO'
    },
    flags: { canEdit: true, canDelete: true }
  })), [transactions]);

  const tableColumns = useMemo((): Record<string, string | import('@/src/components/DashboardTable').ColumnSettings> => ({
    ticker: {
      label: "Ticker",
      filterable: true,
      filterOptions: assets.map(a => ({ label: a.ticker, value: a.ticker }))
    },
    date: "Date",
    type: "Type",
    qty: { label: "Qty", type: "number", align: "right" },
    price: { label: "Price", type: "number", align: "right", formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 } },
    total: { label: "Total", type: "number", align: "right", formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 } },
    status: "Status"
  }), [assets]);

  const tableHeading = (
    <div className="flex justify-between items-center w-full">
      <div>
        <h3 className="text-sm font-bold text-brand-ink uppercase tracking-wider">Histórico de Transações</h3>
        <p className="text-[10px] text-slate-400 font-mono">CONTADOR: {transactions.length} | FILTRO: NENHUM</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleOpenForm('BUY')}
          className="btn bg-green-50 text-green-700 border-green-200 hover:bg-green-100 flex items-center gap-1.5"
        >
          <ArrowUpCircle size={14} />
          <span className="hidden sm:inline">Compra</span>
        </button>
        <button
          onClick={() => handleOpenForm('SELL')}
          className="btn bg-red-50 text-red-700 border-red-200 hover:bg-red-100 flex items-center gap-1.5"
        >
          <ArrowDownCircle size={14} />
          <span className="hidden sm:inline">Venda</span>
        </button>
        <div className="w-px h-8 bg-slate-200 mx-1" />
        <button
          onClick={() => handleOpenForm()}
          className="btn btn-primary"
        >
          <Plus size={14} />
          Evento
        </button>
      </div>
    </div>
  );

  const tickerOptions = Array.from(new Set(assets.map(a => a.ticker.toUpperCase()))).sort();

  return (
    <div className="space-y-6">
      <Modal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        title={formData.id ? "Editar Evento" : "Registrar Novo Evento"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SRVAutoComplete
                label="Ticker"
                placeholder="Ex: AAPL"
                options={tickerOptions}
                value={formData.ticker}
                onChange={value => setFormData({ ...formData, ticker: value })}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Data da Transação</label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm outline-none focus:border-brand-accent transition-colors"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Tipo de Evento</label>
              <select
                className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm outline-none focus:border-brand-accent transition-colors"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="BUY">COMPRA (BUY)</option>
                <option value="SELL">VENDA (SELL)</option>
                <option value="DIV">DIVIDENDOS (DIV)</option>
                <option value="JCP">JUROS S/ CAP. PRÓPRIO (JCP)</option>
                <option value="SPLIT">DESDOBRAMENTO (SPLIT)</option>
                <option value="INPLIT">AGRUPAMENTO (INPLIT)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Volume / Fator</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none focus:border-brand-accent transition-colors"
                value={formData.qty}
                onChange={e => setFormData({ ...formData, qty: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {formData.type === 'INPLIT' && 'Fator de agrupamento (ex: 10 para 10:1)'}
                {formData.type === 'SPLIT' && 'Fator de desdobramento (ex: 10 para 1:10)'}
                {(formData.type === 'BUY' || formData.type === 'SELL' || formData.type === 'DIV' || formData.type === 'JCP') && 'Quantidade de cotas/ações'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Preço Unitário</label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              disabled={formData.type === 'SPLIT' || formData.type === 'INPLIT'}
              className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none focus:border-brand-accent transition-colors disabled:opacity-50 disabled:bg-slate-200"
              value={formData.type === 'SPLIT' || formData.type === 'INPLIT' ? '' : formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
            />
            {(formData.type === 'SPLIT' || formData.type === 'INPLIT') && (
              <p className="text-[10px] text-slate-400 mt-1">
                O preço médio será ajustado automaticamente com base no fator informado.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-brand-line flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              CONFIRMAR REGISTRO
            </button>
          </div>
        </form>
      </Modal>

      <DataTableWrapper initialData={tableData} initialLimit={15}>
        <DashboardTable 
          heading={tableHeading}
          data={tableData}
          columns={tableColumns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </DataTableWrapper>
    </div>
  );
}
