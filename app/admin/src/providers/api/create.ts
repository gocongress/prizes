import { API_URL } from '@/config';
import { httpClient } from '@/providers/api/httpClient';
import { type RaRecord } from 'react-admin';

interface CreateParams<RecordType> {
  data: Partial<RecordType>;
  meta?: unknown;
}

interface CreateResult<RecordType> {
  data: RecordType;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type create = <RecordType extends RaRecord = any>(
  resource: string,
  params: CreateParams<RecordType>,
) => Promise<CreateResult<RecordType>>;

export const create: create = async (resource, params) => {
  const { data } = params;

  const url = `${API_URL}/api/v1/admin/${resource}`;

  const response = await httpClient(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  const payload = await response.json;

  return {
    data: payload.data,
  };
};
