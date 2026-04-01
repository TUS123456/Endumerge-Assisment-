// CourseType, EntryType, AdmissionMode pages — all identical structure
import { MasterCrudPage } from '../../components/masters/MasterCrudPage';
import { courseTypesApi, entryTypesApi, admissionModesApi } from '../../api/masters.api';
import type { CourseType, EntryType, AdmissionMode } from '../../types';

const simpleColumns = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Name' },
];

const simpleFields = [
  { key: 'code', label: 'Code', required: true },
  { key: 'name', label: 'Name', required: true },
];

export function CourseTypePage() {
  return (
    <MasterCrudPage<CourseType>
      title="Course Types"
      queryKey="courseTypes"
      fetchAll={courseTypesApi.list}
      createOne={courseTypesApi.create}
      updateOne={courseTypesApi.update}
      deleteOne={courseTypesApi.remove}
      fields={simpleFields}
      columns={simpleColumns}
    />
  );
}

export function EntryTypePage() {
  return (
    <MasterCrudPage<EntryType>
      title="Entry Types"
      queryKey="entryTypes"
      fetchAll={entryTypesApi.list}
      createOne={entryTypesApi.create}
      updateOne={entryTypesApi.update}
      deleteOne={entryTypesApi.remove}
      fields={simpleFields}
      columns={simpleColumns}
    />
  );
}

export function AdmissionModePage() {
  return (
    <MasterCrudPage<AdmissionMode>
      title="Admission Modes"
      queryKey="admissionModes"
      fetchAll={admissionModesApi.list}
      createOne={admissionModesApi.create}
      updateOne={admissionModesApi.update}
      deleteOne={admissionModesApi.remove}
      fields={simpleFields}
      columns={simpleColumns}
    />
  );
}
