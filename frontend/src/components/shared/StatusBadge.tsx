const colors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ALLOCATED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-orange-100 text-orange-700',
  VERIFIED: 'bg-green-100 text-green-700',
  PAID: 'bg-green-100 text-green-700',
  WAIVED: 'bg-purple-100 text-purple-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
