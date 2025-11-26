import { API_URL } from '@/config';
import { httpClient } from '@/providers/api/httpClient';
import { type RaRecord } from 'react-admin';

interface GetResult<RecordType> {
  data: RecordType;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type get = <RecordType extends RaRecord = any>(resource: string) => Promise<GetResult<RecordType>>;

/**
 * This is a generic HTTP GET to a specific route and can be used for any resources that don't fit the standard CRUD operations.
 * @param route - An admin route to HTTP GET
 */
export const getRoute: get = async (route) => {
  const url = `${API_URL}/api/v1/admin/${route}`;

  const response = await httpClient(url, {
    method: 'GET',
  });

  const payload = await response.json;

  return {
    data: payload.data,
  };
};
