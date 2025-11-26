import { AutocompleteInput, minValue, NumberInput, ReferenceInput, SimpleFormIterator, TextInput } from "react-admin";

const AwardSimpleForm = () => (
  <SimpleFormIterator inline disableClear disableReordering>
    <NumberInput
      source="value"
      step={0.01}
      min={0.1}
      validate={[minValue(0.01)]}
      format={(value) => value ? Number(value).toFixed(2) : 0}
      parse={(value) => parseFloat(value)}
    />
    <TextInput source="redeemCode" label="Redeem Code" />
    <ReferenceInput source="playerId" reference="players">
      <AutocompleteInput label="Awarded to Player" />
    </ReferenceInput>
  </SimpleFormIterator>)


export default AwardSimpleForm
