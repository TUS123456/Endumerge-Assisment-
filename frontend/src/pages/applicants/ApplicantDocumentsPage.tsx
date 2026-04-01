import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { applicantsApi } from '../../api/applicants.api';
import type { Document } from '../../types';

const DOC_LABELS: Record<string, string> = {
  SSLC_MARKS_CARD: 'SSLC Marks Card', PUC_MARKS_CARD: 'PUC Marks Card',
  KCET_RANK_CARD: 'KCET Rank Card', COMEDK_RANK_CARD: 'COMEDK Rank Card',
  CATEGORY_CERTIFICATE: 'Category Certificate', INCOME_CERTIFICATE: 'Income Certificate',
  DOMICILE_CERTIFICATE: 'Domicile Certificate', TRANSFER_CERTIFICATE: 'Transfer Certificate',
  CONDUCT_CERTIFICATE: 'Conduct Certificate', PASSPORT_PHOTO: 'Passport Photo', AADHAR_CARD: 'Aadhar Card',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', SUBMITTED: 'bg-blue-100 text-blue-700',
  VERIFIED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-700',
};

export function ApplicantDocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [docs, setDocs] = useState<(Document & { dirty?: boolean })[]>([]);

  const { data: applicant } = useQuery({ queryKey: ['applicant', id], queryFn: () => applicantsApi.get(id!) });
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['applicant-docs', id],
    queryFn: () => applicantsApi.getDocuments(id!),
  });

  useEffect(() => { setDocs(documents); }, [documents]);

  const saveMut = useMutation({
    mutationFn: () => applicantsApi.updateDocuments(id!, docs.filter((d) => d.dirty).map((d) => ({ id: d.id, status: d.status, remarks: d.remarks }))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applicant-docs', id] });
      qc.invalidateQueries({ queryKey: ['applicant', id] });
    },
  });

  function updateDoc(docId: string, field: string, value: string) {
    setDocs((prev) => prev.map((d) => d.id === docId ? { ...d, [field]: value, dirty: true } : d));
  }

  const hasDirty = docs.some((d) => d.dirty);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/applicants/${id}`} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Documents – {applicant?.firstName} {applicant?.lastName}</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Document</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{DOC_LABELS[doc.docType] ?? doc.docType}</td>
                  <td className="px-4 py-3">
                    <select
                      value={doc.status}
                      onChange={(e) => updateDoc(doc.id, 'status', e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_COLORS[doc.status] ?? ''}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="SUBMITTED">SUBMITTED</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={doc.remarks ?? ''}
                      onChange={(e) => updateDoc(doc.id, 'remarks', e.target.value)}
                      placeholder="Add remarks..."
                      className="w-full text-sm border border-transparent rounded px-2 py-1 hover:border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasDirty && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saveMut.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
