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
    <Edit transform={transform} redirect="list" mutationMode="pessimistic">
      <SimpleForm toolbar={<EventEditToolbar />} warnWhenUnsavedChanges>
        <Labeled label="Id">
          <TextField source="id" />
        </Labeled>
        <TextInput disabled label="Id" source="id" sx={{ display: 'none' }} />
        <TextInput disabled label="Event Id" source="slug" />
        <TextInput source="title" validate={required()} />
        <TextInput
          source="registrationUrl"
          helperText="The public URL where users can register for this event."
        />
        <TextInput
          source="registrationFormId"
          helperText="If this event is using RegFox, use the Page ID (found in the RegFox Registration Page editor address bar) so that automation can create and link new players to this event when a registration is posted to our server. "
        />
        <TextInput source="description" />
        <DateTimeInput source="startAt" validate={required()} />
        <DateTimeInput source="endAt" validate={required()} />
      </SimpleForm>
    </Edit>
  );
};
export default EventEdit;
