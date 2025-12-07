import { RemoveCircle } from '@mui/icons-material';
import {
  ArrayInput,
  AutocompleteInput,
  DeleteWithConfirmButton,
  Edit,
  ImageInput,
  Labeled,
  NumberField,
  ReferenceInput,
  SaveButton,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  Toolbar,
  required,
  useEditContext,
} from 'react-admin';
import AwardSimpleForm from './AwardSimpleForm';
import { transform } from './helpers';
import Image from './Image';

const PrizeEditToolbar = () => {
  return (
    <Toolbar sx={{ justifyContent: 'space-between' }}>
      <SaveButton />
      <DeleteWithConfirmButton confirmContent="Deleting this Prize will delete all of the Award records, are you sure you want to delete this?" />
    </Toolbar>
  );
};

const EditImage = () => {
  const { record, isPending } = useEditContext();
  return <Image recordEdit={record} isPending={isPending} />;
};

const PrizeEdit = () => {
  return (
    <Edit transform={transform} redirect="edit">
      <SimpleForm toolbar={<PrizeEditToolbar />} warnWhenUnsavedChanges>
        <Labeled label="Id">
          <TextField source="id" />
        </Labeled>
        <TextInput disabled label="Id" source="id" sx={{ display: 'none' }} />
        <ReferenceInput source="eventId" reference="events">
          <AutocompleteInput />
        </ReferenceInput>
        <TextInput source="title" validate={required()} />
        <TextInput source="url" />
        <TextInput source="contact" />
        <TextInput source="description" multiline={true} />
        <SelectInput
          source="recommendedRank"
          label="Recommended Rank"
          validate={[required()]}
          choices={[
            { id: 'ALL', name: 'ALL' },
            { id: 'DAN', name: 'DAN' },
            { id: 'SDK', name: 'SDK' },
            { id: 'DDK', name: 'DDK' },
          ]}
        />
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <ImageInput
            source="imageEncoded"
            label="Prize Image"
            placeholder="Drop a picture to upload, or click to select it. An image preview will be displayed below."
            removeIcon={RemoveCircle}
            accept={{
              'image/*': ['.png', '.jpg'],
            }}
            minSize={5000}
            maxSize={1000000}
          >
            <EditImage />
          </ImageInput>
          <TextInput source="imageEncoded" disabled sx={{ display: 'none' }} />
          <TextInput source="imageType" disabled sx={{ display: 'none' }} />
        </div>
        <ArrayInput source="awards">
          <AwardSimpleForm />
        </ArrayInput>
        <Labeled label="Awards Total Value">
          <NumberField
            source="awardsSum"
            options={{ style: 'currency', currency: 'USD', minimumFractionDigits: 2 }}
          />
        </Labeled>
      </SimpleForm>
    </Edit>
  );
};

export default PrizeEdit;
