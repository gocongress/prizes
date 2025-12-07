import {
  AutocompleteInput,
  Create,
  NumberInput,
  ReferenceInput,
  SimpleForm,
  TextInput,
  required,
} from 'react-admin';

const PlayerCreate = () => (
  <Create redirect="create">
    <SimpleForm>
      <ReferenceInput source="userId" reference="users">
        <AutocompleteInput validate={required()} />
      </ReferenceInput>
      <TextInput source="name" label="Name" validate={[required()]} />
      <TextInput source="agaId" label="AGA Id" validate={[required()]} />
      <NumberInput
        source="rank"
        label="Rank"
        validate={[required()]}
        min={-30}
        max={9}
        step={0.01}
      />
    </SimpleForm>
  </Create>
);

export default PlayerCreate;
