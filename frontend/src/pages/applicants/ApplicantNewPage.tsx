import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { applicantsApi } from '../../api/applicants.api';
import { programsApi, academicYearsApi, entryTypesApi, admissionModesApi } from '../../api/masters.api';
import { seatMatrixApi as smApi } from '../../api/seat-matrix.api';
import type { Program, AcademicYear, EntryType, AdmissionMode } from '../../types';

export function ApplicantNewPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    academicYearId: '', programId: '', seatMatrixId: '', entryTypeId: '', admissionModeId: '',
    firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE', email: '', phone: '',
    address: '', category: 'GM', religion: '', domicileState: '',
    qualifyingExam: '', marksObtained: '', maxMarks: '', percentile: '', rankNumber: '',
  });

  const { data: programs = [] } = useQuery({ queryKey: ['programs'], queryFn: () => programsApi.list() });
  const { data: years = [] } = useQuery({ queryKey: ['academicYears'], queryFn: () => academicYearsApi.list() });
  const { data: entryTypes = [] } = useQuery({ queryKey: ['entryTypes'], queryFn: () => entryTypesApi.list() });
  const { data: admModes = [] } = useQuery({ queryKey: ['admissionModes'], queryFn: () => admissionModesApi.list() });
  const { data: matrices = [] } = useQuery({ queryKey: ['seatMatrix'], queryFn: () => smApi.list() });

  const filteredMatrices = matrices.filter(
    (m) => (!form.programId || m.programId === form.programId) && (!form.academicYearId || m.academicYearId === form.academicYearId)
  );

  function set(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const mutation = useMutation({
    mutationFn: applicantsApi.create,
    onSuccess: (data) => navigate(`/applicants/${data.id}`),
    onError: (e: unknown) => {
      setError((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Error creating applicant');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    mutation.mutate({
      ...form,
      marksObtained: form.marksObtained ? Number(form.marksObtained) : undefined,
      maxMarks: form.maxMarks ? Number(form.maxMarks) : undefined,
      percentile: form.percentile ? Number(form.percentile) : undefined,
    } as never);
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Applicant</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Admission Details */}
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b">Admission Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Academic Year *</label>
              <select value={form.academicYearId} onChange={(e) => set('academicYearId', e.target.value)} required className={inputClass}>
                <option value="">Select...</option>
                {years.map((y: AcademicYear) => <option key={y.id} value={y.id}>{y.label}</option>)}
              </select></div>
            <div><label className={labelClass}>Program *</label>
              <select value={form.programId} onChange={(e) => set('programId', e.target.value)} required className={inputClass}>
                <option value="">Select...</option>
                {programs.map((p: Program) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select></div>
            <div><label className={labelClass}>Seat Matrix *</label>
              <select value={form.seatMatrixId} onChange={(e) => set('seatMatrixId', e.target.value)} required className={inputClass}>
                <option value="">Select...</option>
                {filteredMatrices.map((m) => <option key={m.id} value={m.id}>{m.program?.name} - {m.academicYear?.label}</option>)}
              </select></div>
            <div><label className={labelClass}>Entry Type *</label>
              <select value={form.entryTypeId} onChange={(e) => set('entryTypeId', e.target.value)} required className={inputClass}>
                <option value="">Select...</option>
                {entryTypes.map((et: EntryType) => <option key={et.id} value={et.id}>{et.name}</option>)}
              </select></div>
            <div><label className={labelClass}>Admission Mode *</label>
              <select value={form.admissionModeId} onChange={(e) => set('admissionModeId', e.target.value)} required className={inputClass}>
                <option value="">Select...</option>
                {admModes.map((am: AdmissionMode) => <option key={am.id} value={am.id}>{am.name}</option>)}
              </select></div>
          </div>
        </div>

        {/* Personal Details */}
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b">Personal Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>First Name *</label><input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required className={inputClass} /></div>
            <div><label className={labelClass}>Last Name *</label><input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required className={inputClass} /></div>
            <div><label className={labelClass}>Date of Birth *</label><input type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} required className={inputClass} /></div>
            <div><label className={labelClass}>Gender *</label>
              <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className={inputClass}>
                <option>MALE</option><option>FEMALE</option><option>OTHER</option>
              </select></div>
            <div><label className={labelClass}>Email *</label><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required className={inputClass} /></div>
            <div><label className={labelClass}>Phone *</label><input value={form.phone} onChange={(e) => set('phone', e.target.value)} required className={inputClass} /></div>
            <div className="col-span-2"><label className={labelClass}>Address</label><input value={form.address} onChange={(e) => set('address', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Category</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass}>
                {['GM','SC','ST','OBC','EWS','CAT1','CAT2A','CAT2B','CAT3A','CAT3B','PH','NRI'].map((c) => <option key={c}>{c}</option>)}
              </select></div>
            <div><label className={labelClass}>Religion</label><input value={form.religion} onChange={(e) => set('religion', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Domicile State</label><input value={form.domicileState} onChange={(e) => set('domicileState', e.target.value)} className={inputClass} /></div>
          </div>
        </div>

        {/* Qualifying Exam */}
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b">Qualifying Exam</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Exam Name</label><input value={form.qualifyingExam} onChange={(e) => set('qualifyingExam', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Rank / Application No</label><input value={form.rankNumber} onChange={(e) => set('rankNumber', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Marks Obtained</label><input type="number" value={form.marksObtained} onChange={(e) => set('marksObtained', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Max Marks</label><input type="number" value={form.maxMarks} onChange={(e) => set('maxMarks', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Percentile</label><input type="number" step="0.01" value={form.percentile} onChange={(e) => set('percentile', e.target.value)} className={inputClass} /></div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/applicants')} className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? 'Creating...' : 'Create Applicant'}
          </button>
        </div>
      </form>
    </div>
  );
}
