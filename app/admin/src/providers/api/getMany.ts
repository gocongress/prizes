import { type Identifier, type RaRecord } from 'react-admin';
import { API_URL } from '../../config';
import { httpClient } from './httpClient';

interface GetManyParams {
  ids: Identifier[];
  meta?: unknown;
  signal?: AbortSignal;
}
interface GetManyResult<RecordType> {
  data: RecordType[];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type getMany = <RecordType extends RaRecord = any>(
  resource: string,
  params: GetManyParams,
) => Promise<GetManyResult<RecordType>>;

export const getMany: getMany = async (resource, params) => {
  const { ids, signal } = params;

  const queryParams: Record<string, string> = {
    ids: ids.join(','),
  };

  const queryString = new URLSearchParams(queryParams).toString();
  const url = `${API_URL}/api/v1/admin/${resource}?${queryString}&pageSize=${ids.length}`;

  const response = await httpClient(url, { signal });

  const payload = await response.json;

  return {
    data: payload.data.items,
  };
};
