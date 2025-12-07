import {
  AutocompleteInput,
  DeleteWithConfirmButton,
  Edit,
  Labeled,
  NumberInput,
  ReferenceInput,
  SaveButton,
  SimpleForm,
  TextField,
  TextInput,
  Toolbar,
  required,
} from 'react-admin';

const PlayerEditToolbar = () => {
  return (
    <Toolbar sx={{ justifyContent: 'space-between' }}>
      <SaveButton />
      <DeleteWithConfirmButton />
    </Toolbar>
  );
};

const PlayerEdit = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transform = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { kind, createdAt, updatedAt, ...rest } = data;
    const transformedData = { ...rest };
    return transformedData;
  };

  return (
    <Edit transform={transform}>
      <SimpleForm toolbar={<PlayerEditToolbar />} warnWhenUnsavedChanges>
        <Labeled label="Id">
          <TextField source="id" />
        </Labeled>
        <TextInput disabled label="Id" source="id" sx={{ display: 'none' }} />
        <ReferenceInput source="userId" reference="users">
          <AutocompleteInput validate={required()} />
        </ReferenceInput>
        <TextInput source="name" validate={required()} />
        <TextInput source="agaId" label="AGA ID" validate={required()} />
        <NumberInput
          source="rank"
          label="Rank"
          validate={[required()]}
          min={-30}
          max={9}
          step={0.01}
        />
      </SimpleForm>
    </Edit>
  );
};
export default PlayerEdit;
