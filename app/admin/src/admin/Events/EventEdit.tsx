import {
  DateTimeInput,
  DeleteWithConfirmButton,
  Edit,
  Labeled,
  SaveButton,
  SimpleForm,
  TextField,
  TextInput,
  Toolbar,
  required
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

    // Convert datetime fields from local time to UTC
    if (transformedData.startAt) {
      transformedData.startAt = new Date(transformedData.startAt).toISOString();
    }
    if (transformedData.endAt) {
      transformedData.endAt = new Date(transformedData.endAt).toISOString();
    }

    return transformedData;
  };

  return (
    <Edit transform={transform}>
      <SimpleForm toolbar={<EventEditToolbar />} warnWhenUnsavedChanges>
        <Labeled label="Id">
          <TextField source="id" />
        </Labeled>
        <TextInput disabled label="Id" source="id" sx={{ display: 'none' }} />
        <TextInput disabled label="Event Id" source="slug" />
        <TextInput source="title" validate={required()} />
        <TextInput source="description" />
        <DateTimeInput source="startAt" validate={required()} />
        <DateTimeInput source="endAt" validate={required()} />
      </SimpleForm>
    </Edit>
  );
};
export default EventEdit;
