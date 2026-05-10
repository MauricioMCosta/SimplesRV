import React, { useState, useMemo } from 'react';
import { useDatabase } from '@/src/context/DatabaseContext';
import { CustodianFormData } from './Custodians.types';
import { useDialog } from '@/src/context/DialogContext';
import { Plus, ShieldCheck, ShieldAlert } from 'lucide-react';
import { DashboardTable } from '@/src/components/DashboardTable';
import { Modal } from '@/src/components/Modal';
import { DataTableWrapper } from '@/src/components/DataTableWrapper';
import { cn } from '@/src/lib/utils';

export default function Custodians() {
  const { custodians, assets, db } = useDatabase();
  const { addCustodian, updateCustodian, deleteCustodian } = db;
  const { showAlertDialog, showConfirmDialog } = useDialog();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CustodianFormData>({
    cnpj: '',
    name: ''
  });

  const resetForm = () => {
    setFormData({ cnpj: '', name: '' });
    setEditingId(null);
  };

  const handleOpenForm = (custodian?: any) => {
    if (custodian) {
      setFormData({
        cnpj: custodian.cnpj || '',
        name: custodian.name || ''
      });
      setEditingId(custodian.id);
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cnpj.trim()) {
      showAlertDialog('Favor informar o CNPJ.');
      return;
    }
    if (!formData.name.trim()) {
      showAlertDialog('Favor informar o Nome.');
      return;
    }

    const normalizedCnpj = formData.cnpj.replace(/\D/g, '');

    if (editingId) {
      await updateCustodian(editingId, {
        ...formData,
        cnpj: normalizedCnpj,
        is_pending: false
      });
    } else {
      await addCustodian({
        ...formData,
        cnpj: normalizedCnpj,
        is_pending: false
      });
    }

    setShowForm(false);
    resetForm();
  };

  const handleDelete = async (row: any) => {
    const { id } = row;
    if (!id) return;
    showConfirmDialog('Deseja excluir este registro?', async () => {
      await deleteCustodian(id);
    });
  };

  const handleEdit = (row: any) => {
    handleOpenForm(row);
  };

  const tableData = useMemo(() => custodians.map(c => ({
    id: c.id,
    data: {
      ...c,
      statusDisplay: c.is_pending ? 'PENDENTE' : 'OK'
    },
    flags: { canEdit: true, canDelete: true }
  })), [custodians]);

  const tableColumns = useMemo(() => ({
    cnpj: "CNPJ",
    name: "Nome",
    statusDisplay: "Status"
  }), []);

  const handleColumnRender = (row: any, key: string, val: any) => {
    if (key === 'statusDisplay') {
      const isPending = row.is_pending;
      return {
        cellValue: (
          <div className={cn(
            "flex items-center gap-1.5 text-[10px] font-bold uppercase py-0.5 px-1.5 rounded-full w-fit",
            isPending ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-green-50 text-green-600 border border-green-100"
          )}>
            {val}
          </div>
        )
      };
    }
    if (key === 'cnpj') {
      return { cellStyle: "font-mono text-slate-500" };
    }
    return null;
  };

  const tableHeading = (
    <div className="flex justify-between items-center w-full">
      <div>
        <h3 className="text-sm font-bold text-brand-ink uppercase tracking-wider">Custodiantes e Fontes pagadoras</h3>
        <p className="text-[10px] text-slate-400 font-mono">REGISTROS: {custodians.length}</p>
      </div>
      <button
        onClick={() => handleOpenForm()}
        className="btn btn-primary"
      >
        <Plus size={14} />
        Novo registro
      </button>
    </div>
  );

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
        title={editingId ? "Editar" : "Novo"}
      >
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">CNPJ</label>
              <input
                type="text"
                placeholder="Ex: 00.000.000/0000-00"
                className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none focus:border-brand-accent transition-colors"
                value={formData.cnpj}
                onChange={e => setFormData({ ...formData, cnpj: e.target.value.replace(/\D/g, '') })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Nome</label>
              <input
                type="text"
                placeholder="Ex: Banco Itaú"
                className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm outline-none focus:border-brand-accent transition-colors"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
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
              SALVAR
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
