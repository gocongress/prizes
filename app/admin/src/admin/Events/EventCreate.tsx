import { Create, DateInput, SimpleForm, TextInput, required } from 'react-admin';

const validateSlug = (value: string) => {
  if (!value) return undefined;
  const slugPattern = /^[a-z0-9-]+$/;
  if (!slugPattern.test(value)) {
    return 'Slug must contain only lowercase letters (a-z), digits (0-9), and dashes (-)';
  }
  return undefined;
};

const EventCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TextInput label="Event Id" source="slug" validate={[required(), validateSlug]} />
      <TextInput source="title" validate={[required()]} />
      <TextInput source="description" />
      <DateInput source="startAt" validate={[required()]} />
      <DateInput source="endAt" validate={[required()]} />
    </SimpleForm>
  </Create>
);

export default EventCreate;
