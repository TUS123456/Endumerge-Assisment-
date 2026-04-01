import { useQuery } from '@tanstack/react-query';
import { MasterCrudPage } from '../../components/masters/MasterCrudPage';
import { programsApi, departmentsApi, courseTypesApi } from '../../api/masters.api';
import type { Program } from '../../types';

export function ProgramPage() {
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: () => departmentsApi.list() });
  const { data: courseTypes = [] } = useQuery({ queryKey: ['courseTypes'], queryFn: () => courseTypesApi.list() });

  return (
    <MasterCrudPage<Program>
      title="Programs"
      queryKey="programs"
      fetchAll={programsApi.list}
      createOne={programsApi.create}
      updateOne={programsApi.update}
      deleteOne={programsApi.remove}
      fields={[
        {
          key: 'departmentId',
          label: 'Department',
          type: 'select',
          required: true,
          options: departments.map((d) => ({ value: d.id, label: d.name })),
        },
        {
          key: 'courseTypeId',
          label: 'Course Type',
          type: 'select',
          required: true,
          options: courseTypes.map((ct) => ({ value: ct.id, label: ct.name })),
        },
        { key: 'code', label: 'Code', required: true },
        { key: 'name', label: 'Name', required: true },
        { key: 'durationYears', label: 'Duration (Years)', type: 'number' },
      ]}
      columns={[
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
        { key: 'courseType', label: 'Type', render: (item) => item.courseType?.code ?? '' },
        { key: 'department', label: 'Department', render: (item) => item.department?.name ?? '' },
        { key: 'durationYears', label: 'Duration' },
      ]}
    />
  );
}
