import { type Identifier, type RaRecord } from 'react-admin';
import { API_URL } from '../../config';
import { httpClient } from './httpClient';

interface UpdateManyParams {
  ids: Identifier[];
  data: Partial<RaRecord>;
  meta?: unknown;
}
interface UpdateManyResult {
  data: Identifier[];
}
type updateMany = (resource: string, params: UpdateManyParams) => Promise<UpdateManyResult>;

export const updateMany: updateMany = async (resource, params) => {
  const { ids, data } = params;

  const queryParams: Record<string, string> = {
    ids: ids.join(','),
  };

  const queryString = new URLSearchParams(queryParams).toString();
  const url = `${API_URL}/api/v1/admin/${resource}?${queryString}`;

  const response = await httpClient(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  const payload = await response.json;

  return {
    data: payload.data.ids,
  };
};
