import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { seatMatrixApi } from '../api/seat-matrix.api';
import { admissionsApi } from '../api/admissions.api';

export function ReportsPage() {
  const { data: matrices = [] } = useQuery({ queryKey: ['seatMatrix'], queryFn: () => seatMatrixApi.list() });
  const { data: admissions = [] } = useQuery({ queryKey: ['admissions'], queryFn: () => admissionsApi.list() });

  const allAdmissions = admissions as unknown as Record<string, unknown>[];
  const feePending = allAdmissions.filter((a) => a['feeStatus'] === 'PENDING');
  const feePaid = allAdmissions.filter((a) => a['feeStatus'] === 'PAID');

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">
          <Printer size={16} />
          Print
        </button>
      </div>

      {/* Seat Fill Report */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Seat Fill Status by Program</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-3 py-2 font-semibold text-gray-600">Program</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-600">Year</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">Intake</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">KCET</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">COMEDK</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">Mgmt</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">NRI</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">Total Filled</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {matrices.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-4 text-gray-400">No data</td></tr>
            ) : (
              matrices.map((m) => {
                const totalFilled = m.quotas.reduce((s, q) => s + (q.filled ?? 0), 0);
                const getQ = (type: string) => {
                  const q = m.quotas.find((x) => x.quotaType === type);
                  return q ? `${q.filled ?? 0}/${q.totalSeats}` : '-';
                };
                return (
                  <tr key={m.id} className="border-b border-gray-100">
                    <td className="px-3 py-2 font-medium text-gray-900">{m.program?.name}</td>
                    <td className="px-3 py-2 text-gray-600">{m.academicYear?.label}</td>
                    <td className="px-3 py-2 text-center text-gray-900">{m.totalIntake}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{getQ('KCET')}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{getQ('COMEDK')}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{getQ('MANAGEMENT')}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{getQ('NRI')}</td>
                    <td className="px-3 py-2 text-center font-semibold text-blue-700">{totalFilled}</td>
                    <td className="px-3 py-2 text-center font-semibold text-green-700">{m.totalIntake - totalFilled}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-2">Fee Status Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Fee Paid (Confirmed)</span><span className="font-bold text-green-700">{feePaid.length}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Fee Pending</span><span className="font-bold text-orange-700">{feePending.length}</span></div>
            <div className="flex justify-between border-t pt-2 mt-2"><span className="text-gray-700 font-medium">Total Admissions</span><span className="font-bold text-gray-900">{admissions.length}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-2">Seat Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total Intake</span><span className="font-bold text-gray-900">{matrices.reduce((s, m) => s + m.totalIntake, 0)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total Filled</span><span className="font-bold text-blue-700">{matrices.reduce((s, m) => s + m.quotas.reduce((q, x) => q + (x.filled ?? 0), 0), 0)}</span></div>
            <div className="flex justify-between border-t pt-2 mt-2"><span className="text-gray-700 font-medium">Total Remaining</span><span className="font-bold text-green-700">{matrices.reduce((s, m) => s + m.totalIntake - m.quotas.reduce((q, x) => q + (x.filled ?? 0), 0), 0)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
