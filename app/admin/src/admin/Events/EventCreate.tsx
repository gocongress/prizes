import { Create, DateTimeInput, SimpleForm, TextInput, required } from 'react-admin';

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
    <Create redirect="list" transform={transform}>
      <SimpleForm>
        <TextInput label="Event Id" source="slug" validate={[required(), validateSlug]} />
        <TextInput source="title" validate={[required()]} />
        <TextInput source="description" />
        <DateTimeInput source="startAt" validate={[required()]} />
        <DateTimeInput source="endAt" validate={[required()]} />
      </SimpleForm>
    </Create>
  );
}

export default EventCreate;
