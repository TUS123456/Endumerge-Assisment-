import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { applicantsApi } from '../../api/applicants.api';
import { seatMatrixApi } from '../../api/seat-matrix.api';

export function ApplicantAllocatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [quotaConfigId, setQuotaConfigId] = useState('');
  const [allotmentNumber, setAllotmentNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  const { data: applicant } = useQuery({ queryKey: ['applicant', id], queryFn: () => applicantsApi.get(id!) });
  const { data: seats } = useQuery({
    queryKey: ['seats', applicant?.seatMatrixId],
    queryFn: () => seatMatrixApi.seats(applicant!.seatMatrixId),
    enabled: !!applicant?.seatMatrixId,
    refetchInterval: 5000,
  });

  const allocateMut = useMutation({
    mutationFn: () => applicantsApi.allocate(id!, { quotaConfigId, allotmentNumber: allotmentNumber || undefined, remarks: remarks || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applicant', id] });
      navigate(`/applicants/${id}`);
    },
    onError: (e: unknown) => {
      setError((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Allocation failed');
    },
  });

  const isGovMode = applicant?.admissionMode?.code === 'GOVERNMENT';
  const selectedSeat = seats?.find((s) => s.id === quotaConfigId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    allocateMut.mutate();
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/applicants/${id}`} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Allocate Seat</h1>
          <p className="text-sm text-gray-500">{applicant?.firstName} {applicant?.lastName} · {applicant?.applicationNo}</p>
        </div>
      </div>

      {/* Seat Availability */}
      {seats && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {seats.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setQuotaConfigId(s.id)}
              disabled={(s.remaining ?? 0) <= 0}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                quotaConfigId === s.id
                  ? 'border-blue-500 bg-blue-50'
                  : (s.remaining ?? 0) <= 0
                  ? 'border-red-200 bg-red-50 opacity-60 cursor-not-allowed'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <p className="font-semibold text-gray-900 text-sm">{s.quotaType}</p>
              <div className="flex items-center gap-1 mt-1">
                {(s.remaining ?? 0) > 0 ? (
                  <CheckCircle size={13} className="text-green-500" />
                ) : (
                  <AlertCircle size={13} className="text-red-500" />
                )}
                <span className="text-xs text-gray-500">{s.filled ?? 0}/{s.totalSeats} filled · {s.remaining ?? 0} left</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selected Quota *</label>
          <select value={quotaConfigId} onChange={(e) => setQuotaConfigId(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select quota...</option>
            {seats?.map((s) => (
              <option key={s.id} value={s.id} disabled={(s.remaining ?? 0) <= 0}>
                {s.quotaType} — {s.remaining ?? 0} seats remaining
              </option>
            ))}
          </select>
          {selectedSeat && (selectedSeat.remaining ?? 0) <= 0 && (
            <p className="mt-1 text-xs text-red-600">This quota is full — cannot allocate</p>
          )}
        </div>

        {isGovMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Government Allotment Number</label>
            <input value={allotmentNumber} onChange={(e) => setAllotmentNumber(e.target.value)} placeholder="e.g. KCET-2026-00123" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <Link to={`/applicants/${id}`} className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 text-center">Cancel</Link>
          <button
            type="submit"
            disabled={allocateMut.isPending || !quotaConfigId || (selectedSeat?.remaining ?? 1) <= 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {allocateMut.isPending ? 'Allocating...' : 'Confirm Allocation'}
          </button>
        </div>
      </form>
    </div>
  );
}
