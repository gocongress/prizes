import {
  ArrayInput,
  AutocompleteInput,
  Create,
  NumberInput,
  ReferenceInput,
  SimpleForm,
  SimpleFormIterator,
  TextInput,
  minValue,
  required,
} from 'react-admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transform = (data: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { kind, createdAt, updatedAt, deletedAt, ...rest } = data;
  return rest;
};

const ResultCreate = () => {
  return (
    <Create transform={transform} redirect="edit">
      <SimpleForm>
        <ReferenceInput source="eventId" reference="events">
          <AutocompleteInput label="Event" validate={[required()]} />
        </ReferenceInput>
        <ArrayInput source="winners" label="Winners">
          <SimpleFormIterator inline>
            <NumberInput
              source="place"
              label="Place"
              validate={[required(), minValue(1)]}
              step={1}
              min={1}
            />
            <ReferenceInput source="agaId" reference="players">
              <AutocompleteInput
                label="Player"
                optionText={(record) => `${record.name} (${record.agaId})`}
                optionValue="agaId"
                validate={[required()]}
              />
            </ReferenceInput>
            <TextInput source="division" label="Division" validate={[required()]} />
          </SimpleFormIterator>
        </ArrayInput>
      </SimpleForm>
    </Create>
  );
};

export default ResultCreate;
