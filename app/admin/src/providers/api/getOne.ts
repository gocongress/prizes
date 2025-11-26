import { type Identifier, type RaRecord } from 'react-admin';
import { API_URL } from '../../config';
import { httpClient } from './httpClient';

interface GetOneParams {
  id: Identifier;
  meta?: unknown;
  signal?: AbortSignal;
}
interface GetOneResult<RecordType> {
  data: RecordType;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type getOne = <RecordType extends RaRecord = any>(
  resource: string,
  params: GetOneParams,
) => Promise<GetOneResult<RecordType>>;

export const getOne: getOne = async (resource, params) => {
  const { id, signal } = params;

  const url = `${API_URL}/api/v1/admin/${resource}/${id}`;

  const response = await httpClient(url, { signal });

  const payload = await response.json;

  return {
    data: payload.data,
  };
};
