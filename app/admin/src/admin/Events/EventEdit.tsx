import {
  DateInput,
  DeleteWithConfirmButton,
  Edit,
  Labeled,
  SaveButton,
  SimpleForm,
  TextField,
  TextInput,
  Toolbar,
  required,
} from 'react-admin';

const EventEditToolbar = () => {
  return (
    <Toolbar sx={{ justifyContent: 'space-between' }}>
      <SaveButton />
      <DeleteWithConfirmButton />
    </Toolbar>
  );
};

const EventEdit = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transform = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { kind, createdAt, updatedAt, ...rest } = data;
    const transformedData = { ...rest };
    return transformedData;
  };

  return (
    <Edit transform={transform}>
      <SimpleForm toolbar={<EventEditToolbar />} warnWhenUnsavedChanges>
        <Labeled label="Id">
          <TextField source="id" />
        </Labeled>
        <TextInput disabled label="Id" source="id" sx={{ display: 'none' }} />
        <TextInput source="title" validate={required()} />
        <TextInput source="description" />
        <DateInput source="startAt" validate={required()} />
        <DateInput source="endAt" validate={required()} />
      </SimpleForm>
    </Edit>
  );
};
export default EventEdit;
