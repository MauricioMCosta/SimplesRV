import React, { useState, useMemo } from 'react';
import { useDatabase } from '@/src/context/DatabaseContext';
import { AssetFormData } from './Assets.types';
import { useDialog } from '@/src/context/DialogContext';
import { Plus } from 'lucide-react';
import { DashboardTable } from '@/src/components/DashboardTable';
import { Modal } from '@/src/components/Modal';
import { DataTableWrapper } from '@/src/components/DataTableWrapper';
import { cn } from '@/src/lib/utils';
import { SRVAutoComplete } from '@/src/components/SRVAutoComplete';

export default function Assets() {
  const { assets, custodians, db } = useDatabase();
  const { addAsset, updateAsset, deleteAsset } = db;
  const { showAlertDialog, showConfirmDialog } = useDialog();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<AssetFormData>({
    ticker: '',
    description: '',
    type: 'AÇÕES',
    custodianCnpj: '',
    payingSourceCnpj: ''
  });

  const resetForm = () => {
    setFormData({ ticker: '', description: '', type: 'AÇÕES', custodianCnpj: '', payingSourceCnpj: '' });
    setEditingId(null);
  };

  const handleOpenForm = (asset?: any) => {
    if (asset) {
      setFormData({
        ticker: asset.ticker || '',
        description: asset.description || '',
        type: asset.type || 'AÇÕES',
        custodianCnpj: asset.custodianCnpj || '',
        payingSourceCnpj: asset.payingSourceCnpj || ''
      });
      setEditingId(asset.id);
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ticker.trim()) {
      showAlertDialog('Favor informar o Ticker.');
      return;
    }

    if (editingId) {
      await updateAsset(editingId, { 
        ...formData, 
        is_pending: false 
      });
    } else {
      await addAsset({
        ...formData,
        is_pending: false
      });
    }

    setShowForm(false);
    resetForm();
  };

  const handleDelete = async (row: any) => {
    const { id } = row;
    if (!id) return;
    showConfirmDialog('Deseja excluir este ativo?', async () => {
      await deleteAsset(id);
    });
  };

  const handleEdit = (row: any) => {
    handleOpenForm(row);
  };

  const tableData = useMemo(() => assets.map(asset => {
    const custodian = custodians.find(c => c.cnpj === asset.custodianCnpj);
    const payingSource = custodians.find(c => c.cnpj === asset.payingSourceCnpj);
    return {
      id: asset.id,
      data: { 
        ...asset,
        custodianName: custodian ? custodian.name : (asset.custodianCnpj || '-'),
        payingSourceName: payingSource ? payingSource.name : (asset.payingSourceCnpj || '-'),
        status: asset.is_pending ? 'PENDENTE' : 'OK'
      },
      flags: { canEdit: true, canDelete: true }
    };
  }), [assets, custodians]);

  const tableColumns = useMemo(() => ({
    ticker: "Ticker",
    description: "Descrição",
    type: "Tipo",
    custodianName: "Custodiante",
    payingSourceName: "Fonte Pagadora",
    status: "Status"
  }), []);

  const handleColumnRender = (row: any, key: string, val: any) => {
    if (key === 'ticker') {
      return { cellStyle: "font-bold text-brand-ink font-mono" };
    }
    if (key === 'status') {
      return {
        cellValue: (
          <span className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
            val === 'OK' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          )}>
            {val}
          </span>
        )
      };
    }
    return null;
  };

  const tableHeading = (
    <div className="flex justify-between items-center w-full">
      <div>
        <h3 className="text-sm font-bold text-brand-ink uppercase tracking-wider">Ativos (Assets)</h3>
        <p className="text-[10px] text-slate-400 font-mono">CONTADOR: {assets.length}</p>
      </div>
      <button
        onClick={() => handleOpenForm()}
        className="btn btn-primary"
      >
        <Plus size={14} />
        Novo Ativo
      </button>
    </div>
  );

  const custodianOptions = useMemo(() => custodians.map(c => `${c.cnpj} | ${c.name}`), [custodians]);

  const getDisplayCnpj = (cnpj: string) => {
    const custodian = custodians.find(c => c.cnpj === cnpj);
    return custodian ? `${custodian.cnpj} | ${custodian.name}` : cnpj;
  };

  const handleCnpjChange = (field: 'custodianCnpj' | 'payingSourceCnpj', val: string) => {
    // If it's a selection from the list, extract CNPJ
    if (val.includes(' | ')) {
      const cnpj = val.split(' | ')[0];
      setFormData(prev => ({ ...prev, [field]: cnpj }));
    } else {
      setFormData(prev => ({ ...prev, [field]: val }));
    }
  };

  return (
    <div className="space-y-6">
      <Modal 
        isOpen={showForm} 
        onClose={() => { setShowForm(false); resetForm(); }} 
        title={editingId ? "Editar Ativo" : "Novo Ativo"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Ticker</label>
              <input
                type="text"
                placeholder="Ex: AAPL"
                className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none uppercase focus:border-brand-accent transition-colors"
                value={formData.ticker}
                onChange={e => setFormData({ ...formData, ticker: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Descrição</label>
              <input
                type="text"
                placeholder="Ex: Apple Inc."
                className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm outline-none focus:border-brand-accent transition-colors"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Tipo</label>
              <select
                className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm outline-none focus:border-brand-accent transition-colors"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="AÇÕES">Ações</option>
                <option value="FII">FII</option>
                <option value="FIA">FIA</option>
                <option value="ETF">ETF</option>
                <option value="BDR">BDR</option>
                <option value="RENDA FIXA">Renda Fixa</option>
                <option value="CRYPTO">Criptomoeda</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>

            <SRVAutoComplete
              label="Custodiante"
              placeholder="CNPJ ou Nome..."
              options={custodianOptions}
              value={getDisplayCnpj(formData.custodianCnpj)}
              onChange={val => handleCnpjChange('custodianCnpj', val)}
            />

            <SRVAutoComplete
              label="Fonte Pagadora"
              placeholder="CNPJ ou Nome..."
              options={custodianOptions}
              value={getDisplayCnpj(formData.payingSourceCnpj)}
              onChange={val => handleCnpjChange('payingSourceCnpj', val)}
            />
          </div>

          <div className="pt-4 border-t border-brand-line flex justify-end gap-3">
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm(); }}
              className="btn bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              SALVAR ATIVO
            </button>
          </div>
        </form>
      </Modal>

      <DataTableWrapper initialData={tableData} initialLimit={12}>
        <DashboardTable 
          heading={tableHeading}
          columns={tableColumns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onColumnRender={handleColumnRender}
        />
      </DataTableWrapper>
    </div>
  );
}

