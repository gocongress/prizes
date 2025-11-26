import { AutocompleteInput, DeleteWithConfirmButton, Edit, Labeled, minValue, NumberInput, ReferenceInput, SaveButton, SimpleForm, TextField, TextInput, Toolbar } from 'react-admin';

const AwardEditToolbar = () => {
  return (
    <Toolbar sx={{ justifyContent: 'space-between' }}>
      <SaveButton />
      <DeleteWithConfirmButton />
    </Toolbar>
  );
}

const AwardEdit = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transform = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { kind, createdAt, updatedAt, ...rest } = data;
    const transformedData = { ...rest };
    return transformedData;
  };

  return (
    <Edit transform={transform}>
      <SimpleForm toolbar={<AwardEditToolbar />} warnWhenUnsavedChanges>
        <Labeled label="Id">
          <TextField source="id" />
        </Labeled>
        <TextInput disabled label="Id" source="id" sx={{ display: 'none' }} />
        <ReferenceInput source="prizeId" reference="prizes">
          <AutocompleteInput disabled />
        </ReferenceInput>
        <ReferenceInput source="playerId" reference="players">
          <AutocompleteInput label="Awarded to Player" />
        </ReferenceInput>
        <NumberInput
          source="value"
          step={0.01}
          min={0.1}
          validate={[minValue(0.01)]}
          format={(value) =>
            value == null ? 0.01 : Number(value).toFixed(2)
          }
          parse={(value) => parseFloat(value)}
        />
        <TextInput source="redeemCode" label="Redeem Code" />
      </SimpleForm>
    </Edit>
  );
};
export default AwardEdit;
