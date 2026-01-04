import { BooleanInput, Create, SimpleForm, TextInput, required } from 'react-admin';

const UserCreate = () => (
  <Create redirect="list" mutationMode="pessimistic">
    <SimpleForm>
      <TextInput source="email" validate={[required()]} />
      <BooleanInput source="emailPasscode" label="Email User an Access Code" defaultValue={true} />
    </SimpleForm>
  </Create>
);

export default UserCreate;
