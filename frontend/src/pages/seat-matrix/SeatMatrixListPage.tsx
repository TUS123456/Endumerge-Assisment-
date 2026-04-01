import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import { seatMatrixApi } from '../../api/seat-matrix.api';
import { useRoleAccess } from '../../hooks/useRoleAccess';

function QuotaBadge({ quotaType, filled, total }: { quotaType: string; filled: number; total: number }) {
  const remaining = total - filled;
  const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
  const color = remaining === 0 ? 'bg-red-100 text-red-700' : pct >= 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {quotaType}: {filled}/{total}
    </span>
  );
}

export function SeatMatrixListPage() {
  const { isAdmin } = useRoleAccess();
  const { data = [], isLoading } = useQuery({ queryKey: ['seatMatrix'], queryFn: seatMatrixApi.list });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Seat Matrix</h1>
        {isAdmin && (
          <Link to="/seat-matrix/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Plus size={16} />
            New Matrix
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Program</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Academic Year</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Total Intake</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Quota Fill</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No seat matrices configured</td></tr>
              ) : (
                data.map((m) => {
                  const totalFilled = m.quotas.reduce((s, q) => s + (q.filled ?? 0), 0);
                  return (
                    <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{m.program?.name ?? ''}</p>
                        <p className="text-xs text-gray-400">{m.program?.courseType?.code} · {m.program?.department?.code}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{m.academicYear?.label}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{totalFilled}</span>
                        <span className="text-gray-400">/{m.totalIntake}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {m.quotas.map((q) => (
                            <QuotaBadge key={q.id} quotaType={q.quotaType} filled={q.filled ?? 0} total={q.totalSeats} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/seat-matrix/${m.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded hover:bg-blue-50">
                          <Eye size={13} />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
