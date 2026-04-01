import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText, UserCheck, CreditCard } from 'lucide-react';
import { applicantsApi } from '../../api/applicants.api';
import { admissionsApi } from '../../api/admissions.api';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useRoleAccess } from '../../hooks/useRoleAccess';

export function ApplicantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { canWrite } = useRoleAccess();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: applicant, isLoading } = useQuery({
    queryKey: ['applicant', id],
    queryFn: () => applicantsApi.get(id!),
  });

  const generateAdmissionMut = useMutation({
    mutationFn: () => admissionsApi.generate(applicant!.allocation!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applicant', id] }),
  });

  const feeMut = useMutation({
    mutationFn: () => admissionsApi.markFeePaid(applicant!.admission!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applicant', id] }),
  });

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!applicant) return <div className="text-center py-12 text-gray-400">Not found</div>;

  const a = applicant;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{a.firstName} {a.lastName}</h1>
          <p className="text-sm text-gray-500 font-mono">{a.applicationNo}</p>
        </div>
        <StatusBadge status={a.status} />
      </div>

      {/* Admission Number Card */}
      {a.admission && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-xs text-green-600 font-medium mb-1">Admission Number</p>
          <p className="text-xl font-bold text-green-800 font-mono">{a.admission.admissionNumber}</p>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={a.admission.feeStatus} />
            {canWrite && a.admission.feeStatus === 'PENDING' && (
              <button
                onClick={() => feeMut.mutate()}
                disabled={feeMut.isPending}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CreditCard size={13} />
                {feeMut.isPending ? 'Processing...' : 'Mark Fee Paid'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Email', a.email], ['Phone', a.phone], ['Date of Birth', new Date(a.dateOfBirth).toLocaleDateString()],
              ['Gender', a.gender], ['Category', a.category], ['Religion', a.religion],
              ['Domicile', a.domicileState], ['Address', a.address],
            ].map(([label, value]) => value ? (
              <div key={label} className="flex gap-2">
                <dt className="text-gray-400 w-28 shrink-0">{label}</dt>
                <dd className="text-gray-900">{value}</dd>
              </div>
            ) : null)}
          </dl>
        </div>

        {/* Admission Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Admission Details</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Program', a.program?.name], ['Academic Year', a.academicYear?.label],
              ['Entry Type', a.entryType?.name], ['Mode', a.admissionMode?.name],
              ['Qualifying Exam', a.qualifyingExam],
              ['Marks', a.marksObtained ? `${a.marksObtained}/${a.maxMarks}` : undefined],
              ['Percentile', a.percentile ? String(a.percentile) : undefined],
              ['Rank', a.rankNumber],
            ].map(([label, value]) => value ? (
              <div key={label} className="flex gap-2">
                <dt className="text-gray-400 w-28 shrink-0">{label}</dt>
                <dd className="text-gray-900">{value}</dd>
              </div>
            ) : null)}
          </dl>

          {a.allocation && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">Quota: <span className="font-medium text-gray-900">{a.allocation.quotaConfig?.quotaType}</span></p>
              {a.allocation.allotmentNumber && (
                <p className="text-sm text-gray-500">Allotment No: <span className="font-medium text-gray-900">{a.allocation.allotmentNumber}</span></p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {canWrite && (
        <div className="flex flex-wrap gap-3 mt-6">
          {a.status === 'PENDING' && (
            <Link to={`/applicants/${a.id}/allocate`} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              <UserCheck size={16} />
              Allocate Seat
            </Link>
          )}
          <Link to={`/applicants/${a.id}/documents`} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">
            <FileText size={16} />
            Documents
          </Link>
          {a.status === 'ALLOCATED' && !a.admission && (
            <button
              onClick={() => generateAdmissionMut.mutate()}
              disabled={generateAdmissionMut.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {generateAdmissionMut.isPending ? 'Generating...' : 'Generate Admission Number'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
