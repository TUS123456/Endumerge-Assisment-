import { useQuery } from '@tanstack/react-query';
import { MasterCrudPage } from '../../components/masters/MasterCrudPage';
import { departmentsApi, campusesApi } from '../../api/masters.api';
import type { Department } from '../../types';

export function DepartmentPage() {
  const { data: campuses = [] } = useQuery({ queryKey: ['campuses'], queryFn: () => campusesApi.list() });

  return (
    <MasterCrudPage<Department>
      title="Departments"
      queryKey="departments"
      fetchAll={departmentsApi.list}
      createOne={departmentsApi.create}
      updateOne={departmentsApi.update}
      deleteOne={departmentsApi.remove}
      fields={[
        {
          key: 'campusId',
          label: 'Campus',
          type: 'select',
          required: true,
          options: campuses.map((c) => ({ value: c.id, label: c.name })),
        },
        { key: 'code', label: 'Code', required: true },
        { key: 'name', label: 'Name', required: true },
      ]}
      columns={[
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
        { key: 'campus', label: 'Campus', render: (item) => item.campus?.name ?? '' },
      ]}
    />
  );
}
