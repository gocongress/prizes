import { Create, DateInput, SimpleForm, TextInput, required } from 'react-admin';

const EventCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TextInput source="title" validate={[required()]} />
      <TextInput source="description" />
      <DateInput source="startAt" validate={[required()]} />
      <DateInput source="endAt" validate={[required()]} />
    </SimpleForm>
  </Create>
);

export default EventCreate;
