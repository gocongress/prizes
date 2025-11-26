import { type Identifier, type RaRecord } from 'react-admin';
import { API_URL } from '../../config';
import { httpClient } from './httpClient';

interface DeleteParams<RecordType> {
  id: Identifier;
  previousData?: RecordType;
  meta?: unknown;
}
interface DeleteResult<RecordType> {
  data: RecordType;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type _delete = <RecordType extends RaRecord = any>(
  resource: string,
  params: DeleteParams<RecordType>,
) => Promise<DeleteResult<RecordType>>;

export const _delete: _delete = async (resource, params) => {
  const { id } = params;

  const url = `${API_URL}/api/v1/admin/${resource}/${id}`;

  const response = await httpClient(url, {
    method: 'DELETE',
  });

  const payload = await response.json;

  return {
    data: payload.data,
  };
};
