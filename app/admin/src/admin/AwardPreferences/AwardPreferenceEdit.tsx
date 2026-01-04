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

const AwardPreferenceEditToolbar = () => {
  return (
    <Toolbar sx={{ justifyContent: 'space-between' }}>
      <SaveButton />
      <DeleteWithConfirmButton />
    </Toolbar>
  );
};

const AwardPreferenceEdit = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transform = (data: any) => {
    // Remove system fields that shouldn't be sent back to the API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { kind, createdAt, updatedAt, ...rest } = data;
    return rest;
  };

  return (
    <Edit transform={transform} redirect="edit" mutationMode="pessimistic">
      <SimpleForm toolbar={<AwardPreferenceEditToolbar />} warnWhenUnsavedChanges>
        <Labeled label="Id">
          <TextField source="id" />
        </Labeled>
        <TextInput disabled label="Id" source="id" sx={{ display: 'none' }} />
        <ReferenceInput source="playerId" reference="players">
          <AutocompleteInput validate={required()} disabled />
        </ReferenceInput>
        <ReferenceInput source="awardId" reference="awards">
          <AutocompleteInput validate={required()} disabled />
        </ReferenceInput>
        <NumberInput
          source="preferenceOrder"
          label="Preference Order"
          validate={[required()]}
          min={1}
          step={1}
        />
      </SimpleForm>
    </Edit>
  );
};

export default AwardPreferenceEdit;
