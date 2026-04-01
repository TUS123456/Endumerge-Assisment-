import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { Users, CheckCircle, Clock, FileX, AlertCircle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function QuotaBar({ label, filled, total }: { label: string; filled: number; total: number }) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((filled / total) * 100));
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span>{filled}/{total} ({pct}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => dashboardApi.get(), refetchInterval: 30000 });

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading dashboard...</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Applicants" value={data.stats.totalApplicants} color="bg-blue-500" />
        <StatCard icon={Clock} label="Allocated" value={data.stats.allocated} color="bg-indigo-500" />
        <StatCard icon={CheckCircle} label="Confirmed" value={data.stats.confirmed} color="bg-green-500" />
        <StatCard icon={AlertCircle} label="Fee Pending" value={data.stats.pendingFee} color="bg-orange-500" />
        <StatCard icon={FileX} label="Docs Pending" value={data.stats.pendingDocuments} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seat Fill Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Seat Fill Status</h2>
          {data.seatSummary.length === 0 ? (
            <p className="text-sm text-gray-400">No seat matrix configured</p>
          ) : (
            data.seatSummary.map((item) => (
              <div key={item.id} className="mb-5 pb-5 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">{item.program}</p>
                  <span className="text-xs text-gray-400">{item.academicYear}</span>
                </div>
                <QuotaBar label="Total" filled={item.totalAllocated} total={item.totalIntake} />
                {item.quotas.map((q) => (
                  <QuotaBar key={q.quotaType} label={q.quotaType} filled={q.filled} total={q.totalSeats} />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Fee Pending */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fee Pending</h2>
          {data.feePendingList.length === 0 ? (
            <p className="text-sm text-gray-400">No pending fees</p>
          ) : (
            <div className="space-y-3">
              {data.feePendingList.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.applicant.firstName} {item.applicant.lastName}</p>
                    <p className="text-xs text-gray-500">{item.admissionNumber} · {item.applicant.program.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{item.applicant.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
