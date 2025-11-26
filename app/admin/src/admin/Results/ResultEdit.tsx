import {
  ArrayInput,
  AutocompleteInput,
  DeleteWithConfirmButton,
  Edit,
  Labeled,
  NumberInput,
  ReferenceInput,
  SaveButton,
  SimpleForm,
  SimpleFormIterator,
  TextField,
  TextInput,
  Toolbar,
  minValue,
  required,
  useRecordContext,
  useRedirect,
} from 'react-admin';
import { useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transform = (data: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { kind, createdAt, updatedAt, deletedAt, ...rest } = data;
  return rest;
};

const ResultEditToolbar = () => {
  return (
    <Toolbar sx={{ justifyContent: 'space-between' }}>
      <SaveButton />
      <DeleteWithConfirmButton confirmContent="Are you sure you want to delete this result?" />
    </Toolbar>
  );
};

const RedirectIfHasAwards = () => {
  const record = useRecordContext();
  const redirect = useRedirect();

  useEffect(() => {
    if (record?.awards && record.awards.length > 0) {
      redirect('show', 'results', record.id);
    }
  }, [record, redirect]);

  return null;
};

const ResultEdit = () => {
  return (
    <Edit transform={transform} redirect="edit">
      <SimpleForm toolbar={<ResultEditToolbar />} warnWhenUnsavedChanges>
        <RedirectIfHasAwards />
        <Labeled label="Id">
          <TextField source="id" />
        </Labeled>
        <TextInput disabled label="Id" source="id" sx={{ display: 'none' }} />
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
    </Edit>
  );
};

export default ResultEdit;
