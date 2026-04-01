import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { seatMatrixApi } from '../../api/seat-matrix.api';

function QuotaCard({ quotaType, totalSeats, filled = 0, supernumerary }: { quotaType: string; totalSeats: number; filled?: number; supernumerary: number }) {
  const remaining = totalSeats - filled;
  const pct = totalSeats === 0 ? 0 : Math.min(100, Math.round((filled / totalSeats) * 100));
  const color = remaining === 0 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-blue-500';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{quotaType}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${remaining === 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {remaining === 0 ? 'FULL' : `${remaining} left`}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
        <div className={`h-3 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div><p className="text-xs text-gray-400">Total</p><p className="font-bold text-gray-900">{totalSeats}</p></div>
        <div><p className="text-xs text-gray-400">Filled</p><p className="font-bold text-blue-600">{filled}</p></div>
        <div><p className="text-xs text-gray-400">Remaining</p><p className="font-bold text-green-600">{remaining}</p></div>
      </div>
      {supernumerary > 0 && (
        <p className="text-xs text-gray-400 mt-2 text-center">+{supernumerary} supernumerary</p>
      )}
    </div>
  );
}

export function SeatMatrixDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: matrix, isLoading } = useQuery({
    queryKey: ['seatMatrix', id],
    queryFn: () => seatMatrixApi.get(id!),
    refetchInterval: 10000,
  });

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!matrix) return <div className="text-center py-12 text-gray-400">Not found</div>;

  const totalFilled = matrix.quotas.reduce((s, q) => s + (q.filled ?? 0), 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/seat-matrix" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{matrix.program?.name}</h1>
          <p className="text-sm text-gray-500">{matrix.program?.courseType?.code} · {matrix.academicYear?.label}</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-6">
        <div><p className="text-xs text-blue-500">Total Intake</p><p className="text-2xl font-bold text-blue-900">{matrix.totalIntake}</p></div>
        <div><p className="text-xs text-blue-500">Total Allocated</p><p className="text-2xl font-bold text-blue-700">{totalFilled}</p></div>
        <div><p className="text-xs text-blue-500">Remaining</p><p className="text-2xl font-bold text-green-700">{matrix.totalIntake - totalFilled}</p></div>
        {matrix.isLocked && <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">LOCKED</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matrix.quotas.map((q) => (
          <QuotaCard key={q.id} quotaType={q.quotaType} totalSeats={q.totalSeats} filled={q.filled} supernumerary={q.supernumerary} />
        ))}
      </div>
    </div>
  );
}
