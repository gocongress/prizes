import {
  AutocompleteInput,
  DateInput,
  Edit,
  ReferenceInput,
  SimpleForm,
  TextInput,
  required,
} from 'react-admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transform = (data: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { kind, createdAt, updatedAt, deletedAt, ...rest } = data;
  return rest;
};

const RegistrantEdit = () => (
  <Edit transform={transform} redirect="list" mutationMode="pessimistic">
    <SimpleForm>
      <ReferenceInput source="playerId" reference="players">
        <AutocompleteInput
          label="Player"
          optionText={(record) => `${record.name} (${record.agaId})`}
          validate={[required()]}
          disabled
        />
      </ReferenceInput>
      <ReferenceInput source="eventId" reference="events">
        <AutocompleteInput label="Event" validate={[required()]} disabled />
      </ReferenceInput>
      <DateInput source="registrationDate" label="Registration Date" />
      <TextInput source="status" label="Status" />
      <TextInput source="notes" label="Notes" multiline rows={3} />
    </SimpleForm>
  </Edit>
);

export default RegistrantEdit;
