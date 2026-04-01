import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { usersApi } from '../api/users.api';
import { StatusBadge } from '../components/shared/StatusBadge';

const ROLES = ['ADMIN', 'ADMISSION_OFFICER', 'MANAGEMENT'] as const;

export function SettingsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ADMISSION_OFFICER' });
  const [error, setError] = useState('');

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list() });

  const createMut = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowForm(false); setForm({ name: '', email: '', password: '', role: 'ADMISSION_OFFICER' }); },
    onError: (e: unknown) => setError((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Error'),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => usersApi.update(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    createMut.mutate(form);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          <Plus size={16} />Add User
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{u.role}</td>
                  <td className="px-4 py-3"><StatusBadge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleMut.mutate({ id: u.id, isActive: !u.isActive })}
                      className="text-xs px-3 py-1 border rounded hover:bg-gray-50"
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add User</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            {error && <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-4">
              {(['name', 'email', 'password'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field} *</label>
                  <input type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'} value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg">Cancel</button>
                <button type="submit" disabled={createMut.isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
                  {createMut.isPending ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
