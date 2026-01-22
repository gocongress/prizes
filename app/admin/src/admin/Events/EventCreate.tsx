import { BooleanInput, Create, DateTimeInput, SimpleForm, TextInput, required } from 'react-admin';

const validateSlug = (value: string) => {
  if (!value) return undefined;
  const slugPattern = /^[a-z0-9-]+$/;
  if (!slugPattern.test(value)) {
    return 'Slug must contain only lowercase letters (a-z), digits (0-9), and dashes (-)';
  }
  return undefined;
};

const EventCreate = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transform = (data: any) => {
    // Convert datetime fields from local time to UTC
    if (data.startAt) {
      data.startAt = new Date(data.startAt).toISOString();
    }
    if (data.endAt) {
      data.endAt = new Date(data.endAt).toISOString();
    }

    return data;
  };
  return (
    <Create redirect="list" transform={transform} mutationMode="pessimistic">
      <SimpleForm>
        <TextInput
          label="Event Id"
          source="slug"
          validate={[required(), validateSlug]}
          helperText="A unique identifier for the event, used in URLs. Only lowercase letters, digits, and dashes are allowed. (ie. go-congress-2026)"
        />
        <TextInput source="title" validate={[required()]} />
        <BooleanInput label="Self Registration" source="selfRegistrationEnabled" defaultValue={false} defaultChecked={false} />
        <TextInput
          source="registrationUrl"
          helperText="The public URL where users can register for this event."
        />
        <TextInput
          source="registrationFormId"
          label="Registration Form Id"
          helperText="If this event is using RegFox, use the Page ID (found in the RegFox Registration Page editor address bar) so that automation can create and link new players to this event when a registration is posted to our server. "
        />
        <TextInput source="description" />
        <DateTimeInput source="startAt" validate={[required()]} />
        <DateTimeInput source="endAt" validate={[required()]} />
      </SimpleForm>
    </Create>
  );
};

export default EventCreate;
