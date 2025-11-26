import { type Identifier, type RaRecord } from 'react-admin';
import { API_URL } from '../../config';
import { httpClient } from './httpClient';

interface UpdateParams<RecordType> {
  id: Identifier;
  data: Partial<RecordType>;
  previousData: RecordType;
  meta?: unknown;
}
interface UpdateResult<RecordType> {
  data: RecordType;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type update = <RecordType extends RaRecord = any>(
  resource: string,
  params: UpdateParams<RecordType>,
) => Promise<UpdateResult<RecordType>>;

export const update: update = async (resource, params) => {
  const { id, data } = params;

  const url = `${API_URL}/api/v1/admin/${resource}/${id}`;

  const response = await httpClient(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  const payload = await response.json;

  return {
    data: payload.data,
  };
};
