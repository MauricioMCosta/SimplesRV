import React, { useState, useMemo } from 'react';
import { useDatabase } from '@/src/context/DatabaseContext';
import { useDialog } from '@/src/context/DialogContext';
import { Plus, ShieldCheck, ShieldAlert } from 'lucide-react';
import { DashboardTable } from '@/src/components/DashboardTable';
import { Modal } from '@/src/components/Modal';
import { DataTableWrapper } from '@/src/components/DataTableWrapper';

export default function Custodians() {
  const { custodians, db } = useDatabase();
  const { addCustodian, updateCustodian, deleteCustodian } = db;
  const { showAlertDialog, showConfirmDialog } = useDialog();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    cnpj: '',
    name: '',
    status: 'PENDING' as 'PENDING' | 'CONFIRMED'
  });

  const resetForm = () => {
    setFormData({ cnpj: '', name: '', status: 'PENDING' });
    setEditingId(null);
  };

  const handleOpenForm = (custodian?: any) => {
    if (custodian) {
      setFormData({
        cnpj: custodian.cnpj || '',
        name: custodian.name || '',
        status: custodian.status || 'PENDING'
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
        cnpj: normalizedCnpj
      });
    } else {
      await addCustodian({
        ...formData,
        cnpj: normalizedCnpj
      });
    }

    setShowForm(false);
    resetForm();
  };

  const handleDelete = async (row: any) => {
    const { id } = row;
    if (!id) return;
    showConfirmDialog('Deseja excluir este custodiante?', async () => {
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
      statusDisplay: c.status === 'CONFIRMED' ? 'CONFIRMADO' : 'PENDENTE'
    },
    flags: { canEdit: true, canDelete: true }
  })), [custodians]);

  const tableColumns = useMemo(() => ({
    cnpj: "CNPJ",
    name: "Nome",
    statusDisplay: "Status"
  }), []);

  const tableHeading = (
    <div className="flex justify-between items-center w-full">
      <div>
        <h3 className="text-sm font-bold text-brand-ink uppercase tracking-wider">Custodiantes</h3>
        <p className="text-[10px] text-slate-400 font-mono">REGISTROS: {custodians.length}</p>
      </div>
      <button
        onClick={() => handleOpenForm()}
        className="btn btn-primary"
      >
        <Plus size={14} />
        Novo Custodiante
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <Modal 
        isOpen={showForm} 
        onClose={() => { setShowForm(false); resetForm(); }} 
        title={editingId ? "Editar Custodiante" : "Novo Custodiante"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">CNPJ</label>
            <input
              type="text"
              placeholder="Ex: 00.000.000/0000-00"
              className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none focus:border-brand-accent transition-colors"
              value={formData.cnpj}
              onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
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

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Status</label>
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm outline-none focus:border-brand-accent transition-colors"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="PENDING">Pendente</option>
              <option value="CONFIRMED">Confirmado</option>
            </select>
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
              SALVAR CUSTODIANTE
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
        />
      </DataTableWrapper>
    </div>
  );
}
