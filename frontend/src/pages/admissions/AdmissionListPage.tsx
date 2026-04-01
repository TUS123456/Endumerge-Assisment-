import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { admissionsApi } from '../../api/admissions.api';
import { StatusBadge } from '../../components/shared/StatusBadge';

export function AdmissionListPage() {
  const { data: rawData, isLoading } = useQuery({ queryKey: ['admissions'], queryFn: () => admissionsApi.list() });
  const data = (rawData ?? []) as unknown as Record<string, unknown>[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admissions</h1>
        <span className="text-sm text-gray-400">{data.length} records</span>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Admission No</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Applicant</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Program</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Quota</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Fee</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No admissions yet</td></tr>
              ) : (
                data.map((adm: Record<string, unknown>) => (
                  <tr key={String(adm['id'])} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-800 font-medium">{String(adm['admissionNumber'])}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {(adm['applicant'] as Record<string, string>)?.['firstName']} {(adm['applicant'] as Record<string, string>)?.['lastName']}
                      </p>
                      <p className="text-xs text-gray-400">{(adm['applicant'] as Record<string, string>)?.['applicationNo']}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {((adm['applicant'] as Record<string, unknown>)?.['program'] as Record<string, string>)?.['name']}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {((adm['allocation'] as Record<string, unknown>)?.['quotaConfig'] as Record<string, string>)?.['quotaType']}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={String(adm['feeStatus'])} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admissions/${String(adm['id'])}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded hover:bg-blue-50">
                        <Eye size={13} />View
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
