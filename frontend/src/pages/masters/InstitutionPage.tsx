import { MasterCrudPage } from '../../components/masters/MasterCrudPage';
import { institutionsApi } from '../../api/masters.api';
import type { Institution } from '../../types';

export function InstitutionPage() {
  return (
    <MasterCrudPage<Institution>
      title="Institutions"
      queryKey="institutions"
      fetchAll={institutionsApi.list}
      createOne={institutionsApi.create}
      updateOne={institutionsApi.update}
      deleteOne={institutionsApi.remove}
      fields={[
        { key: 'code', label: 'Code', required: true },
        { key: 'name', label: 'Name', required: true },
        { key: 'address', label: 'Address' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email', type: 'email' },
      ]}
      columns={[
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
      ]}
    />
  );
}
