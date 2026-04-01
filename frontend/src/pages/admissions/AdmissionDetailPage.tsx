import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import { admissionsApi } from '../../api/admissions.api';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useRoleAccess } from '../../hooks/useRoleAccess';

export function AdmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { canWrite } = useRoleAccess();
  const qc = useQueryClient();

  const { data: adm, isLoading } = useQuery({
    queryKey: ['admission', id],
    queryFn: () => admissionsApi.get(id!),
  });

  const feeMut = useMutation({
    mutationFn: () => admissionsApi.markFeePaid(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admission', id] }),
  });

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!adm) return <div className="text-center py-12 text-gray-400">Not found</div>;

  const admission = adm as unknown as Record<string, unknown>;
  const applicant = admission['applicant'] as Record<string, unknown>;
  const program = applicant?.['program'] as Record<string, string> | undefined;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admissions" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Admission Detail</h1>
      </div>

      {/* Admission Number Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 mb-6 text-white">
        <p className="text-sm text-blue-200 mb-1">Admission Number</p>
        <p className="text-2xl font-bold font-mono">{String(admission['admissionNumber'])}</p>
        <div className="flex items-center gap-2 mt-3">
          <StatusBadge status={String(admission['feeStatus'])} />
          {Boolean(admission['confirmedAt']) && (
            <span className="flex items-center gap-1 text-xs text-green-300">
              <CheckCircle size={12} /> Confirmed {new Date(String(admission['confirmedAt'])).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <dl className="space-y-3 text-sm">
          {[
            ['Name', `${String(applicant?.['firstName'] ?? '')} ${String(applicant?.['lastName'] ?? '')}`],
            ['Application No', String(applicant?.['applicationNo'] ?? '')],
            ['Program', program?.['name']],
            ['Category', String(applicant?.['category'] ?? '')],
            ['Quota', String(((admission['allocation'] as Record<string, unknown>)?.['quotaConfig'] as Record<string, string>)?.['quotaType'] ?? '')],
          ].map(([label, value]) => value ? (
            <div key={label} className="flex gap-3">
              <dt className="text-gray-400 w-32 shrink-0">{label}</dt>
              <dd className="text-gray-900 font-medium">{value}</dd>
            </div>
          ) : null)}
        </dl>

        {canWrite && String(admission['feeStatus']) === 'PENDING' && (
          <div className="pt-4 border-t">
            <button
              onClick={() => feeMut.mutate()}
              disabled={feeMut.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <CreditCard size={16} />
              {feeMut.isPending ? 'Processing...' : 'Mark Fee Paid & Confirm Admission'}
            </button>
            <p className="text-xs text-gray-400 mt-2">Seat is confirmed only after fee is paid.</p>
          </div>
        )}

        {String(admission['feeStatus']) === 'PAID' && (
          <div className="pt-4 border-t flex items-center gap-2 text-green-600">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">Admission confirmed. Fee paid on {new Date(String(admission['feePaidAt'])).toLocaleDateString()}.</span>
          </div>
        )}
      </div>
    </div>
  );
}
