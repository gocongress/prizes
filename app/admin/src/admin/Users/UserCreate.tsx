import { BooleanInput, Create, SimpleForm, TextInput, required } from 'react-admin';

const UserCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TextInput source="email" validate={[required()]} />
      <BooleanInput source="emailPasscode" label="Email User an Access Code" defaultValue={true} />
    </SimpleForm>
  </Create>
);

export default UserCreate;
