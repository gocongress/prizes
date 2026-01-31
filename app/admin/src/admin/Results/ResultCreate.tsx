import { AutocompleteInput, Create, ReferenceInput, SimpleForm, required } from 'react-admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transform = (data: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { kind, createdAt, updatedAt, deletedAt, ...rest } = data;
  return rest;
};

const ResultCreate = () => {
  return (
    <Create transform={transform} redirect="list" mutationMode="pessimistic">
      <SimpleForm>
        <ReferenceInput source="eventId" reference="events">
          <AutocompleteInput label="Event" validate={[required()]} />
        </ReferenceInput>
      </SimpleForm>
    </Create>
  );
};

export default ResultCreate;
