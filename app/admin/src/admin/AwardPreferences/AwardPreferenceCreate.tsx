import {
  AutocompleteInput,
  Create,
  NumberInput,
  ReferenceInput,
  SimpleForm,
  required,
} from 'react-admin';
import UniqueAwardsAutocompleteInput from './UniqueAwardsAutocompleteInput';

const AwardPreferenceCreate = () => (
  <Create redirect="list" mutationMode="pessimistic">
    <SimpleForm>
      <ReferenceInput source="playerId" reference="players">
        <AutocompleteInput validate={required()} />
      </ReferenceInput>
      <UniqueAwardsAutocompleteInput />
      <NumberInput
        source="preferenceOrder"
        label="Preference Order"
        validate={[required()]}
        min={1}
        step={1}
      />
    </SimpleForm>
  </Create>
);

export default AwardPreferenceCreate;
