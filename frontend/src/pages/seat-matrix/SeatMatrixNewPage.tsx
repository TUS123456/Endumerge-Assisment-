import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { seatMatrixApi } from '../../api/seat-matrix.api';
import { programsApi, academicYearsApi } from '../../api/masters.api';

const QUOTA_TYPES = ['KCET', 'COMEDK', 'MANAGEMENT', 'NRI', 'SNQ'] as const;
type QuotaType = typeof QUOTA_TYPES[number];

interface QuotaRow { quotaType: QuotaType; totalSeats: number; supernumerary: number }

export function SeatMatrixNewPage() {
  const navigate = useNavigate();
  const [programId, setProgramId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [totalIntake, setTotalIntake] = useState(0);
  const [quotas, setQuotas] = useState<QuotaRow[]>([{ quotaType: 'MANAGEMENT', totalSeats: 0, supernumerary: 0 }]);
  const [error, setError] = useState('');

  const { data: programs = [] } = useQuery({ queryKey: ['programs'], queryFn: () => programsApi.list() });
  const { data: years = [] } = useQuery({ queryKey: ['academicYears'], queryFn: () => academicYearsApi.list() });

  const mutation = useMutation({
    mutationFn: seatMatrixApi.create,
    onSuccess: () => navigate('/seat-matrix'),
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Error creating seat matrix';
      setError(msg);
    },
  });

  const quotaSum = quotas.reduce((s, q) => s + q.totalSeats, 0);
  const sumValid = quotaSum === totalIntake;

  function addQuota() {
    const used = quotas.map((q) => q.quotaType);
    const next = QUOTA_TYPES.find((t) => !used.includes(t));
    if (next) setQuotas((p) => [...p, { quotaType: next, totalSeats: 0, supernumerary: 0 }]);
  }

  function removeQuota(i: number) {
    setQuotas((p) => p.filter((_, idx) => idx !== i));
  }

  function updateQuota(i: number, field: keyof QuotaRow, value: string) {
    setQuotas((p) => p.map((q, idx) => idx === i ? { ...q, [field]: field === 'quotaType' ? value : Number(value) } : q));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!sumValid) { setError('Sum of quota seats must equal total intake'); return; }
    mutation.mutate({ programId, academicYearId, totalIntake, quotas });
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Seat Matrix</h1>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
            <select value={programId} onChange={(e) => setProgramId(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select program...</option>
              {programs.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.courseType?.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
            <select value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select year...</option>
              {years.map((y) => <option key={y.id} value={y.id}>{y.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Intake *</label>
          <input type="number" min={1} value={totalIntake || ''} onChange={(e) => setTotalIntake(Number(e.target.value))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Quota Configuration *</label>
            {quotas.length < QUOTA_TYPES.length && (
              <button type="button" onClick={addQuota} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                <Plus size={13} />Add Quota
              </button>
            )}
          </div>

          <div className="space-y-2">
            {quotas.map((q, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <select value={q.quotaType} onChange={(e) => updateQuota(i, 'quotaType', e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm w-36">
                  {QUOTA_TYPES.map((t) => <option key={t} value={t} disabled={quotas.some((x, xi) => x.quotaType === t && xi !== i)}>{t}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Seats</span>
                  <input type="number" min={0} value={q.totalSeats} onChange={(e) => updateQuota(i, 'totalSeats', e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm w-20" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Supernumerary</span>
                  <input type="number" min={0} value={q.supernumerary} onChange={(e) => updateQuota(i, 'supernumerary', e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm w-16" />
                </div>
                {quotas.length > 1 && (
                  <button type="button" onClick={() => removeQuota(i)} className="text-red-400 hover:text-red-600 ml-auto">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className={`mt-2 text-xs font-medium ${sumValid ? 'text-green-600' : 'text-red-500'}`}>
            Quota sum: {quotaSum} / Intake: {totalIntake} {sumValid ? '✓ Valid' : '✗ Must be equal'}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/seat-matrix')} className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={mutation.isPending || !sumValid} className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? 'Creating...' : 'Create Matrix'}
          </button>
        </div>
      </form>
    </div>
  );
}
