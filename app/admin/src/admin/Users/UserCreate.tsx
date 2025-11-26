import { Create, SimpleForm, TextInput, required } from 'react-admin';

const UserCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TextInput source="email" validate={[required()]} />
    </SimpleForm>
  </Create>
);

export default UserCreate;
