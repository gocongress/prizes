import { Email } from '@mui/icons-material';
import {
  Button,
  DeleteWithConfirmButton,
  Edit,
  Labeled,
  SaveButton,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  Toolbar,
  required,
  useCreate,
  useNotify,
  useRecordContext,
  useRedirect,
} from 'react-admin';

const UserEditToolbar = () => {
  const record = useRecordContext();
  const [create, { isPending }] = useCreate();
  const notify = useNotify();
  const redirect = useRedirect();
  const handleClick = () => {
    if (!record || !record.id) return;
    create(
      'users',
      { data: { email: record.email } },
      {
        onSuccess: () => {
          notify(`New login code sent to ${record.email}`, {
            type: 'success',
            autoHideDuration: 5000,
          });
          redirect('/users');
        },
        onError: (error) => {
          notify(`Error: ${(error as Error).message}`, { type: 'error' });
        },
      },
    );
  };

  return (
    <Toolbar sx={{ justifyContent: 'space-between' }}>
      <SaveButton />
      <Button
        type="button"
        label="Send new code"
        onClick={handleClick}
        disabled={isPending}
        color="success"
        variant="contained"
        size="large"
      >
        <Email />
      </Button>
      <DeleteWithConfirmButton />
    </Toolbar>
  );
};

const UserEdit = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transform = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { kind, createdAt, updatedAt, ...rest } = data;
    const transformedData = { ...rest };
    if (data.lastLoginAt === '') {
      transformedData.lastLoginAt = null;
    }
    return transformedData;
  };

  return (
    <Edit transform={transform}>
      <SimpleForm toolbar={<UserEditToolbar />}>
        <Labeled label="Id">
          <TextField source="id" />
        </Labeled>
        <TextInput disabled label="Id" source="id" sx={{ display: 'none' }} />
        <TextInput source="email" disabled />
        <SelectInput
          source="scope"
          label="API Access Level"
          validate={required()}
          choices={[
            { id: 'USER', name: 'USER' },
            { id: 'ADMIN', name: 'ADMIN' },
          ]}
        />
        <Labeled label="Access Code(s)">
          <TextField source="oneTimePass" />
        </Labeled>
        <Labeled label="Created">
          <TextField source="createdAt" />
        </Labeled>
        <Labeled label="Updated">
          <TextField source="updatedAt" />
        </Labeled>
        <Labeled label="Last Login">
          <TextField source="lastLoginAt" defaultValue="Has not logged in." />
        </Labeled>
      </SimpleForm>
    </Edit>
  );
};
export default UserEdit;
