import { useQuery } from '@tanstack/react-query';
import { MasterCrudPage } from '../../components/masters/MasterCrudPage';
import { campusesApi, institutionsApi } from '../../api/masters.api';
import type { Campus } from '../../types';

export function CampusPage() {
  const { data: institutions = [] } = useQuery({ queryKey: ['institutions'], queryFn: () => institutionsApi.list() });

  return (
    <MasterCrudPage<Campus>
      title="Campuses"
      queryKey="campuses"
      fetchAll={campusesApi.list}
      createOne={campusesApi.create}
      updateOne={campusesApi.update}
      deleteOne={campusesApi.remove}
      fields={[
        {
          key: 'institutionId',
          label: 'Institution',
          type: 'select',
          required: true,
          options: institutions.map((i) => ({ value: i.id, label: i.name })),
        },
        { key: 'code', label: 'Code', required: true },
        { key: 'name', label: 'Name', required: true },
      ]}
      columns={[
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
        { key: 'institution', label: 'Institution', render: (item) => item.institution?.name ?? '' },
      ]}
    />
  );
}
