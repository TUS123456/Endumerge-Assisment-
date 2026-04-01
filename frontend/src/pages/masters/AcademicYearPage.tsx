import { MasterCrudPage } from '../../components/masters/MasterCrudPage';
import { academicYearsApi } from '../../api/masters.api';
import type { AcademicYear } from '../../types';
import { StatusBadge } from '../../components/shared/StatusBadge';

export function AcademicYearPage() {
  return (
    <MasterCrudPage<AcademicYear>
      title="Academic Years"
      queryKey="academicYears"
      fetchAll={academicYearsApi.list}
      createOne={academicYearsApi.create}
      updateOne={academicYearsApi.update}
      deleteOne={academicYearsApi.remove}
      fields={[
        { key: 'label', label: 'Label (e.g. 2026-27)', required: true },
        { key: 'startYear', label: 'Start Year', type: 'number', required: true },
        { key: 'endYear', label: 'End Year', type: 'number', required: true },
        {
          key: 'isCurrent',
          label: 'Is Current Year?',
          type: 'select',
          options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }],
        },
      ]}
      columns={[
        { key: 'label', label: 'Label' },
        { key: 'startYear', label: 'Start Year' },
        { key: 'endYear', label: 'End Year' },
        { key: 'isCurrent', label: 'Current', render: (item) => item.isCurrent ? <StatusBadge status="ACTIVE" /> : <StatusBadge status="INACTIVE" /> },
      ]}
    />
  );
}
