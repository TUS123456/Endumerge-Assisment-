import { useState } from 'react';
import type React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { ConfirmDialog } from '../shared/ConfirmDialog';

interface Field {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'select';
  options?: { value: string; label: string }[];
  required?: boolean;
  readOnly?: boolean;
}

interface Props<T extends { id: string }> {
  title: string;
  queryKey: string;
  fetchAll: (params?: Record<string, string>) => Promise<T[]>;
  createOne: (data: Partial<T>) => Promise<T>;
  updateOne: (id: string, data: Partial<T>) => Promise<T>;
  deleteOne: (id: string) => Promise<unknown>;
  fields: Field[];
  columns: { key: string; label: string; render?: (item: T) => string | React.ReactNode }[];
  filterParams?: Record<string, string>;
}

export function MasterCrudPage<T extends { id: string }>({
  title, queryKey, fetchAll, createOne, updateOne, deleteOne, fields, columns, filterParams,
}: Props<T>) {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data = [], isLoading } = useQuery({ queryKey: [queryKey, filterParams], queryFn: () => fetchAll(filterParams) });

  const createMut = useMutation({
    mutationFn: (d: Partial<T>) => createOne(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); closeModal(); },
    onError: (e: unknown) => setError(String((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Error')),
  });

  const updateMut = useMutation({
    mutationFn: (d: Partial<T>) => updateOne(editing!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); closeModal(); },
    onError: (e: unknown) => setError(String((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Error')),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteOne(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); setDeleteTarget(null); },
  });

  function openCreate() {
    setEditing(null);
    setForm({});
    setError('');
    setModalOpen(true);
  }

  function openEdit(item: T) {
    setEditing(item);
    const f: Record<string, string> = {};
    fields.forEach((field) => {
      const v = (item as Record<string, unknown>)[field.key];
      f[field.key] = v !== undefined && v !== null ? String(v) : '';
    });
    setForm(f);
    setError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm({});
    setError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const data: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (!f.readOnly) {
        data[f.key] = f.type === 'number' ? Number(form[f.key]) : form[f.key] || undefined;
      }
    });
    if (editing) {
      updateMut.mutate(data as Partial<T>);
    } else {
      createMut.mutate(data as Partial<T>);
    }
  }

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Add New
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-4 py-3 font-semibold text-gray-600">{col.label}</th>
                ))}
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="text-center py-8 text-gray-400">No records found</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-gray-700">
                        {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit' : 'Add'} {title}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {error && <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.filter((f) => !f.readOnly).map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}{field.required && ' *'}</label>
                  {field.type === 'select' ? (
                    <select
                      value={form[field.key] ?? ''}
                      onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      required={field.required}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select...</option>
                      {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type ?? 'text'}
                      value={form[field.key] ?? ''}
                      onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      required={field.required}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Record"
        message="Are you sure? This will soft-delete the record."
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
