import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Eye, Search } from 'lucide-react';
import { applicantsApi } from '../../api/applicants.api';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useRoleAccess } from '../../hooks/useRoleAccess';

export function ApplicantListPage() {
  const { canWrite } = useRoleAccess();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params: Record<string, string> = {};
  if (statusFilter) params['status'] = statusFilter;

  const { data = [], isLoading } = useQuery({
    queryKey: ['applicants', params],
    queryFn: () => applicantsApi.list(params),
  });

  const filtered = search
    ? data.filter((a) => `${a.firstName} ${a.lastName} ${a.applicationNo} ${a.email}`.toLowerCase().includes(search.toLowerCase()))
    : data;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
        {canWrite && (
          <Link to="/applicants/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Plus size={16} />
            New Applicant
          </Link>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search by name, application no, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option>PENDING</option>
          <option>ALLOCATED</option>
          <option>CONFIRMED</option>
          <option>REJECTED</option>
          <option>CANCELLED</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">App No</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Program</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Mode</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Quota</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No applicants found</td></tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{a.applicationNo}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{a.firstName} {a.lastName}</p>
                      <p className="text-xs text-gray-400">{a.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.program?.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{a.admissionMode?.code}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {a.allocation?.quotaConfig?.quotaType ?? '-'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/applicants/${a.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded hover:bg-blue-50">
                        <Eye size={13} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
