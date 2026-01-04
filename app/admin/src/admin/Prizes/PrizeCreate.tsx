import { RemoveCircle } from '@mui/icons-material';
import {
  ArrayInput,
  AutocompleteInput,
  Create,
  ImageInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
  required,
} from 'react-admin';
import AwardSimpleForm from './AwardSimpleForm';
import { transform } from './helpers';
import Image from './Image';

const PrizeCreate = () => {
  return (
    <Create transform={transform} redirect="edit">
      <SimpleForm>
        <ReferenceInput source="eventId" reference="events">
          <AutocompleteInput validate={[required()]} />
        </ReferenceInput>
        <TextInput source="title" validate={[required()]} />
        <TextInput source="url" />
        <TextInput source="contact" />
        <TextInput source="sponsor" />
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
          <Image />
        </ImageInput>
        <ArrayInput source="awards">
          <AwardSimpleForm />
        </ArrayInput>
      </SimpleForm>
    </Create>
  );
};

export default PrizeCreate;
