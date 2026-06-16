import React, { useState, useMemo } from 'react';
import { useDatabase } from '@/src/context/DatabaseContext';
import { AssetFormData } from './Assets.types';
import { useSRVGlobalDialog } from '@/src/context/SRVGlobalDialogContext';
import { Plus } from 'lucide-react';
import { DashboardTable } from '@/src/components/DashboardTable';
import { Modal } from '@/src/components/Modal';
import { DataTableWrapper } from '@/src/components/DataTableWrapper';
import { cn } from '@/src/lib/utils';
import { SRVAutoComplete } from '@/src/components/SRVAutoComplete';
import * as CNPJ from '@/src/lib/cnpj';

export default function Assets() {
  const { assets, custodians, db } = useDatabase();
  const { addAsset, updateAsset, deleteAsset } = db;
  const { showAlertDialog, showConfirmDialog } = useSRVGlobalDialog();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<AssetFormData>({
    ticker: '',
    description: '',
    type: 'AÇÕES',
    custodianCnpj: '',
    cnpj: '',
    inactive: false
  });

  const resetForm = () => {
    setFormData({ 
      ticker: '', 
      description: '', 
      type: 'AÇÕES', 
      custodianCnpj: '', 
      cnpj: '',
      inactive: false
    });
    setEditingId(null);
  };

  const handleOpenForm = (asset?: any) => {
    if (asset) {
      setFormData({
        ticker: asset.ticker || '',
        description: asset.description || '',
        type: asset.type || 'AÇÕES',
        custodianCnpj: asset.custodianCnpj || '',
        cnpj: asset.cnpj || '',
        inactive: !!asset.inactive
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
    const fund = custodians.find(c => c.cnpj === asset.cnpj);
    return {
      id: asset.id,
      data: { 
        ...asset,
        custodianName: custodian ? custodian.name : (asset.custodianCnpj || '-'),
        fundName: fund ? fund.name : (asset.cnpj || '-'),
        inactiveDisplay: asset.inactive ? 'INATIVO' : 'ATIVO',
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
    fundName: "CNPJ Fundo",
    inactiveDisplay: "Situação",
    status: "Status"
  }), []);

  const handleColumnRender = (row: any, key: string, val: any) => {
    if (key === 'ticker') {
      return { cellStyle: "font-bold text-brand-ink font-mono" };
    }
    if (key === 'inactiveDisplay') {
      return {
        cellValue: (
          <span className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
            val === 'ATIVO' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {val}
          </span>
        )
      };
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
    return custodian ? `${CNPJ.toText(custodian.cnpj)} | ${custodian.name}` : CNPJ.toText(cnpj);
  };

  const handleCnpjChange = (field: 'custodianCnpj' | 'cnpj', val: string) => {
    // If it's a selection from the list, extract CNPJ
    if (val.includes(' | ')) {
      const cnpjVal = val.split(' | ')[0].replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [field]: cnpjVal }));
    } else {
      // For typed values, also strip everything except digits
      const onlyNumbers = val.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [field]: onlyNumbers }));
    }
  };

  const isCnpjInvalid = (val: string) => {
    if (!val) return false;
    return !CNPJ.isValidCNPJ(val);
  };

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    // Prevent form submission on Enter as requested by user
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-6">
      <Modal 
        isOpen={showForm} 
        onClose={() => { setShowForm(false); resetForm(); }} 
        title={editingId ? "Editar Ativo" : "Novo Ativo"}
      >
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Tipo</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm outline-none focus:border-brand-accent transition-colors font-bold"
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
              <SRVAutoComplete
                label="Custodiante"
                placeholder="CNPJ ou Nome..."
                options={custodianOptions}
                value={getDisplayCnpj(formData.custodianCnpj)}
                onChange={val => handleCnpjChange('custodianCnpj', val)}
                className={cn(isCnpjInvalid(formData.custodianCnpj) && "ring-1 ring-red-500")}
              />
              {isCnpjInvalid(formData.custodianCnpj) && (
                <p className="text-[9px] text-red-500 font-bold mt-0.5 uppercase tracking-tighter italic">CNPJ Inválido</p>
              )}
            </div>

            <div>
              <SRVAutoComplete
                label="CNPJ do Fundo"
                placeholder="CNPJ ou Nome..."
                options={custodianOptions}
                value={getDisplayCnpj(formData.cnpj)}
                onChange={val => handleCnpjChange('cnpj', val)}
                className={cn(isCnpjInvalid(formData.cnpj) && "ring-1 ring-red-500")}
              />
              {isCnpjInvalid(formData.cnpj) && (
                <p className="text-[9px] text-red-500 font-bold mt-0.5 uppercase tracking-tighter italic">CNPJ Inválido</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-brand-line/50">
              <input
                id="asset-inactive-checkbox"
                type="checkbox"
                className="w-4 h-4 rounded border-brand-line text-brand-accent focus:ring-brand-accent cursor-pointer"
                checked={formData.inactive}
                onChange={e => setFormData({ ...formData, inactive: e.target.checked })}
              />
              <label htmlFor="asset-inactive-checkbox" className="text-xs font-bold text-slate-600 uppercase tracking-tighter cursor-pointer select-none">
                Marcar ativo como Inativo
              </label>
            </div>
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

