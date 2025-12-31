import {
  AutocompleteInput,
  Create,
  DateInput,
  ReferenceInput,
  SimpleForm,
  TextInput,
  required
} from 'react-admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transform = (data: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { kind, createdAt, updatedAt, deletedAt, ...rest } = data;
  return rest;
};

const RegistrantCreate = () => (
  <Create transform={transform} redirect="list">
    <SimpleForm>
      <ReferenceInput source="playerId" reference="players">
        <AutocompleteInput
          label="Player"
          optionText={(record) => `${record.name} (${record.agaId})`}
          validate={[required()]}
        />
      </ReferenceInput>
      <ReferenceInput source="eventId" reference="events">
        <AutocompleteInput label="Event" validate={[required()]} />
      </ReferenceInput>
      <DateInput source="registrationDate" label="Registration Date" />
      <TextInput source="status" label="Status" />
      <TextInput source="notes" label="Notes" multiline rows={3} />
    </SimpleForm>
  </Create>
);

export default RegistrantCreate;
