import React from 'react';
import { AutocompleteInput, required, useGetList } from 'react-admin';

const UniqueAwardsAutocompleteInput = () => {
  const { data: awards, isLoading } = useGetList('awards');

  // Deduplicate based on prizeTitle + value
  const uniqueAwards = React.useMemo(() => {
    if (!awards) return [];

    const seen = new Set();
    const unique = awards.filter(award => {
      const key = `${award.prizeTitle}-${award.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by prizeTitle-value
    return unique.sort((a, b) => {
      const keyA = `${a.prizeTitle}-${a.value}`;
      const keyB = `${b.prizeTitle}-${b.value}`;
      return keyA.localeCompare(keyB);
    });
  }, [awards]);


  return (
    <AutocompleteInput
      source="awardId"
      choices={uniqueAwards}
      optionText={(record) => `${record.prizeTitle} - $${record.value}`}
      optionValue={"awardId"}
      validate={required()}
      isLoading={isLoading}
    />
  );
}

export default UniqueAwardsAutocompleteInput;
